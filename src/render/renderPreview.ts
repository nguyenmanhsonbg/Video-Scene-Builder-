import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {renderStill as remotionRenderStill} from '@remotion/renderer';
import type {VideoConfig} from 'remotion/no-react';
import type {VoiceSegmentId} from '../core/domain/types.js';
import type {RenderCompositionProps} from './renderComposition.js';

const PREVIEW_STAGES: VoiceSegmentId[] = [
  'QUESTION',
  'THINK',
  'IDENTIFY_SVO',
  'TRANSFORM',
  'FINAL_ANSWER',
];

export type PreviewRenderItem = {
  stage: VoiceSegmentId;
  frame: number;
  output: string;
};

export type RenderStillBatchRequest = {
  composition: VideoConfig;
  serveUrl: string;
  inputProps: RenderCompositionProps;
  previews: PreviewRenderItem[];
};

export type RenderStillBatchAdapter = (request: RenderStillBatchRequest) => Promise<void>;

export type RenderPreviewOptions = {
  outputDir: string;
  renderProps: RenderCompositionProps;
  composition: VideoConfig;
  serveUrl: string;
  renderStill: RenderStillBatchAdapter;
};

function previewFrame(start: number, duration: number, fps: number, totalFrames: number): number {
  const offset = Math.min(Math.max(duration - 1 / fps, 0), duration * 0.8);
  return Math.min(totalFrames - 1, Math.max(0, Math.floor((start + offset) * fps)));
}

export async function renderPreview({
  outputDir,
  renderProps,
  composition,
  serveUrl,
  renderStill,
}: RenderPreviewOptions): Promise<string[]> {
  const previewDir = join(outputDir, 'preview');
  await mkdir(previewDir, {recursive: true});

  const timeline = renderProps.resolvedTimeline;
  if (timeline === undefined) {
    throw new Error('resolved timeline is required for stage previews');
  }

  const previews = PREVIEW_STAGES.map((stage) => {
    const resolvedStage = timeline.stages[stage];
    const filename = `${stage}.png`;
    return {
      stage,
      frame: previewFrame(
        resolvedStage.start,
        resolvedStage.duration,
        composition.fps,
        composition.durationInFrames,
      ),
      output: join(previewDir, filename),
    };
  });

  await renderStill({
    composition,
    serveUrl,
    inputProps: renderProps,
    previews,
  });

  return previews.map((preview) => preview.output);
}

export const renderStillBatch: RenderStillBatchAdapter = async ({
  composition,
  serveUrl,
  inputProps,
  previews,
}) => {
  for (const preview of previews) {
    await remotionRenderStill({
      composition,
      serveUrl,
      inputProps,
      output: preview.output,
      frame: preview.frame,
      imageFormat: 'png',
      overwrite: true,
      logLevel: 'error',
    });
  }
};
