import {copyFile, mkdir, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {bundle as remotionBundle, type BundleOptions, type WebpackConfiguration} from '@remotion/bundler';
import {
  renderMedia as remotionRenderMedia,
  selectComposition as remotionSelectComposition,
} from '@remotion/renderer';
import type {VideoConfig} from 'remotion/no-react';
import {ROOT_COMPOSITION_ID} from '../Root.js';
import {inspectAudioDurations, resolveAudioPath, type AudioDurationReader, type MeasuredDurations} from '../core/audio/inspectAudio.js';
import type {InputPackage} from '../core/domain/types.js';
import type {AudioAssetMap, AudioSegmentId} from '../core/audio/stageAudio.js';
import {createRenderManifest, type RenderManifest} from '../core/qa/manifest.js';
import {loadInputPackage} from '../core/schema/loadInputPackage.js';
import {buildSubtitleCues} from '../core/subtitles/subtitleCues.js';
import {resolveTimeline, type ResolvedTimeline} from '../core/timeline/resolveTimeline.js';
import {validateTimeline} from '../core/timeline/validateTimeline.js';
import {PASSIVE_VOICE_ELEMENT_IDS} from '../question-types/passive-voice/defaults.js';
import type {RenderCompositionProps} from './renderComposition.js';
import {renderPreview, renderStillBatch, type RenderStillBatchAdapter, type RenderStillBatchRequest} from './renderPreview.js';

export type RenderMediaRequest = {
  composition: VideoConfig;
  serveUrl: string;
  inputProps: RenderCompositionProps;
  output: string;
};

export type RenderMediaAdapter = (request: RenderMediaRequest) => Promise<void>;

export type RenderQuestionAdapters = {
  inspectAudio?: (
    voice: InputPackage['voice'],
    inputDir: string,
    reader?: AudioDurationReader,
  ) => Promise<{durations: MeasuredDurations; warnings: string[]}>;
  bundle?: (options: BundleOptions) => Promise<string>;
  selectComposition?: (options: {
    serveUrl: string;
    id: string;
    inputProps: Record<string, unknown>;
  }) => Promise<VideoConfig>;
  renderMedia?: RenderMediaAdapter;
  renderStill?: RenderStillBatchAdapter;
};

export type RenderQuestionOptions = {
  inputDir: string;
  outputDir: string;
  adapters?: RenderQuestionAdapters;
  renderVideo?: boolean;
};

export type RenderResult = {
  outputDir: string;
  videoPath: string | null;
  previewPaths: string[];
  timeline: ResolvedTimeline;
  manifest: RenderManifest;
};

const audioStages: AudioSegmentId[] = ['QUESTION', 'IDENTIFY_SVO', 'TRANSFORM', 'FINAL_ANSWER'];

function normalizeAssetPath(assetPath: string): string {
  return assetPath.replaceAll('\\', '/').replace(/^\/+/, '');
}

async function stageAudioAssets(input: InputPackage): Promise<{
  publicDir: string;
  assets: AudioAssetMap;
}> {
  const publicDir = await mkdtemp(join(tmpdir(), 'passive-voice-renderer-'));
  const assets = {} as AudioAssetMap;

  try {
    for (const stage of audioStages) {
      const segment = input.voice.segments.find((candidate) => candidate.id === stage);
      if (segment === undefined || segment.audio === null) {
        throw new Error(`missing audio path for stage ${stage}`);
      }
      const source = resolveAudioPath(input.inputDir, segment.audio);
      const relativeAsset = normalizeAssetPath(segment.audio);
      const destination = join(publicDir, ...relativeAsset.split('/'));
      await mkdir(dirname(destination), {recursive: true});
      await copyFile(source, destination);
      assets[stage] = relativeAsset;
    }
  } catch (error) {
    await rm(publicDir, {recursive: true, force: true});
    throw error;
  }

  return {publicDir, assets};
}

const defaultWebpackOverride = (configuration: WebpackConfiguration): WebpackConfiguration => ({
  ...configuration,
  resolve: {
    ...configuration.resolve,
    extensionAlias: {
      ...configuration.resolve?.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
    },
  },
});

const defaultBundle = (options: BundleOptions) => remotionBundle({
  ...options,
  webpackOverride: options.webpackOverride ?? defaultWebpackOverride,
});

const defaultSelectComposition = (options: {
  serveUrl: string;
  id: string;
  inputProps: Record<string, unknown>;
}) => remotionSelectComposition(options);

const defaultRenderMedia: RenderMediaAdapter = async ({composition, serveUrl, inputProps, output}) => {
  await remotionRenderMedia({
    composition,
    serveUrl,
    inputProps,
    outputLocation: output,
    codec: 'h264',
    overwrite: true,
    enforceAudioTrack: true,
    logLevel: 'error',
  });
};

async function prepareRemotion(input: InputPackage, renderProps: RenderCompositionProps, adapters: RenderQuestionAdapters) {
  const staged = await stageAudioAssets(input);
  try {
    renderProps.audioAssets = staged.assets;
    const bundle = adapters.bundle ?? defaultBundle;
    const selectComposition = adapters.selectComposition ?? defaultSelectComposition;
    const entryPoint = fileURLToPath(new URL('../index.ts', import.meta.url));
    const serveUrl = await bundle({entryPoint, publicDir: staged.publicDir});
    const composition = await selectComposition({
      serveUrl,
      id: ROOT_COMPOSITION_ID,
      inputProps: renderProps as Record<string, unknown>,
    });
    return {staged, serveUrl, composition};
  } catch (error) {
    await rm(staged.publicDir, {recursive: true, force: true});
    throw error;
  }
}

export async function renderQuestion({inputDir, outputDir, adapters = {}, renderVideo = true}: RenderQuestionOptions): Promise<RenderResult> {
  const input = await loadInputPackage(inputDir);
  const audio = await (adapters.inspectAudio ?? inspectAudioDurations)(input.voice, input.inputDir);
  const timeline = resolveTimeline(input.voice, input.timeline, audio.durations);
  validateTimeline(timeline, new Set(PASSIVE_VOICE_ELEMENT_IDS));
  const subtitleCues = buildSubtitleCues(input.voice, timeline);

  await mkdir(outputDir, {recursive: true});
  const timelinePath = join(outputDir, 'timeline_resolved.json');
  await writeFile(timelinePath, `${JSON.stringify(timeline, null, 2)}\n`, 'utf8');

  const audioAssets = {
    QUESTION: 'audio/QUESTION.mp3',
    IDENTIFY_SVO: 'audio/IDENTIFY_SVO.mp3',
    TRANSFORM: 'audio/TRANSFORM.mp3',
    FINAL_ANSWER: 'audio/FINAL_ANSWER.mp3',
  } as const;
  const renderProps: RenderCompositionProps = {
    question: input.question,
    voice: input.voice,
    resolvedTimeline: timeline,
    subtitleCues,
    audioAssets,
  };

  const renderMedia = adapters.renderMedia ?? defaultRenderMedia;
  const renderStill = adapters.renderStill ?? renderStillBatch;
  const needsRemotion = adapters.renderStill === undefined || (renderVideo && adapters.renderMedia === undefined);
  let context: {staged: Awaited<ReturnType<typeof stageAudioAssets>>; serveUrl: string; composition: VideoConfig} | null = null;

  try {
    if (needsRemotion) {
      context = await prepareRemotion(input, renderProps, adapters);
    }

    const composition = context?.composition ?? ({
      id: ROOT_COMPOSITION_ID,
      durationInFrames: Math.ceil(timeline.totalDuration * 30),
      fps: 30,
      width: 1920,
      height: 1080,
    } as VideoConfig);
    const serveUrl = context?.serveUrl ?? '';
    const videoPath = join(outputDir, 'video.mp4');
    if (renderVideo) {
      await renderMedia({composition, serveUrl, inputProps: renderProps, output: videoPath});
    }
    const previewPaths = await renderPreview({
      outputDir,
      renderProps,
      composition,
      serveUrl,
      renderStill: async (request: RenderStillBatchRequest) => renderStill(request),
    });
    const manifest = createRenderManifest(input, timeline, audio.warnings);
    await writeFile(join(outputDir, 'render_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

    return {outputDir, videoPath: renderVideo ? videoPath : null, previewPaths, timeline, manifest};
  } finally {
    if (context !== null) {
      await rm(context.staged.publicDir, {recursive: true, force: true});
    }
  }
}
