import {copyFile, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {EdgeTTS} from 'node-edge-tts';

const execFileAsync = promisify(execFile);

type TtsPart = {
  kind: 'tts';
  text: string;
  language: 'vi' | 'en';
};

type PausePart = {
  kind: 'pause';
  seconds: number;
};

type Part = TtsPart | PausePart;

const vi = (text: string): TtsPart => ({kind: 'tts', text, language: 'vi'});
const en = (text: string): TtsPart => ({kind: 'tts', text, language: 'en'});
const pause = (seconds = 0.22): PausePart => ({kind: 'pause', seconds});

const segments: Record<string, Part[]> = {
  Q01_01_question: [
    vi('Câu một.'),
    pause(0.5),
    en("Doctors often check patients' blood pressure."),
  ],
  Q01_02_svo: [
    vi(
      'Trước tiên, chúng ta xác định các thành phần của câu. “Doctors” là chủ ngữ, ký hiệu S. “Check” là động từ, ký hiệu V. Và “patients\' blood pressure” là tân ngữ, ký hiệu O. “Often” là trạng từ chỉ tần suất.',
    ),
  ],
  Q01_03_transform: [
    vi(
      'Bây giờ, chúng ta chuyển câu chủ động sang câu bị động. Bước một, đưa tân ngữ “patients\' blood pressure” lên đầu câu, làm chủ ngữ mới. Ta được: “Patients\' blood pressure”. Bước hai, cụm “blood pressure” là số ít, vì vậy chúng ta dùng “is”. Bước ba, động từ “check” chuyển sang dạng quá khứ phân từ là “checked”. Ghép các thành phần lại, ta có: “Patients\' blood pressure, is, checked”. Trạng từ “often” được đặt sau “is”. Cuối cùng, thêm “by doctors” để chỉ người thực hiện hành động.',
    ),
  ],
  Q01_04_answer: [
    vi('Câu bị động hoàn chỉnh là:'),
    pause(0.6),
    en("Patients' blood pressure is often checked by doctors."),
    pause(0.55),
    vi('Chúng ta ghi nhớ công thức: Chủ ngữ, cộng am, is hoặc are, cộng động từ ở dạng quá khứ phân từ, và có thể thêm by cộng tân ngữ.'),
  ],
};

const outputNames = Object.keys(segments).map((name) => `${name}.mp3`);
const TTS_TIMEOUT_MS = 90000;
const TTS_MAX_ATTEMPTS = 3;
const TTS_COOLDOWN_MS = 3000;

function createTts(language: TtsPart['language']): EdgeTTS {
  return new EdgeTTS({
    voice: language === 'vi' ? 'vi-VN-HoaiMyNeural' : 'en-US-AriaNeural',
    lang: language === 'vi' ? 'vi-VN' : 'en-US',
    outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
    rate: '-5%',
    timeout: TTS_TIMEOUT_MS,
  });
}

async function synthesizePart(part: TtsPart, output: string, label: string): Promise<void> {
  for (let attempt = 1; attempt <= TTS_MAX_ATTEMPTS; attempt += 1) {
    try {
      console.log(`[TTS] ${label} (${part.language}, attempt ${attempt}/${TTS_MAX_ATTEMPTS})`);
      await rm(output, {force: true});
      await createTts(part.language).ttsPromise(part.text, output);
      await new Promise((resolve) => setTimeout(resolve, TTS_COOLDOWN_MS));
      return;
    } catch (error) {
      if (attempt === TTS_MAX_ATTEMPTS) {
        throw error;
      }
      console.warn(`[TTS] retrying ${label}: ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function makeSilence(ffmpeg: string, output: string, seconds: number): Promise<void> {
  await execFileAsync(ffmpeg, [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anullsrc=r=24000:cl=mono',
    '-t',
    String(seconds),
    '-c:a',
    'libmp3lame',
    '-b:a',
    '96k',
    '-ar',
    '24000',
    '-ac',
    '1',
    output,
  ]);
}

async function concatAudio(ffmpeg: string, inputs: string[], output: string): Promise<void> {
  const labels = inputs.map((_, index) => `[${index}:a]`).join('');
  await execFileAsync(ffmpeg, [
    '-y',
    ...inputs.flatMap((input) => ['-i', input]),
    '-filter_complex',
    `${labels}concat=n=${inputs.length}:v=0:a=1[out]`,
    '-map',
    '[out]',
    '-c:a',
    'libmp3lame',
    '-b:a',
    '96k',
    '-ar',
    '24000',
    '-ac',
    '1',
    output,
  ], {maxBuffer: 2 * 1024 * 1024});
}

async function main(): Promise<void> {
  const projectRoot = resolve(process.cwd());
  const audioDir = join(projectRoot, 'input', 'Q01', 'audio');
  const ffmpeg = join(projectRoot, 'node_modules', '@remotion', 'compositor-win32-x64-msvc', 'ffmpeg.exe');
  const workDir = await mkdtemp(join(tmpdir(), 'passive-voice-q01-'));
  try {
    await mkdir(audioDir, {recursive: true});
    const silenceByDuration = new Map<number, string>();
    const generatedOutputs: string[] = [];

    for (const [segmentName, parts] of Object.entries(segments)) {
      const inputFiles: string[] = [];
      for (const [index, part] of parts.entries()) {
        if (part.kind === 'pause') {
          let silence = silenceByDuration.get(part.seconds);
          if (silence === undefined) {
            silence = join(workDir, `silence-${part.seconds}.mp3`);
            await makeSilence(ffmpeg, silence, part.seconds);
            silenceByDuration.set(part.seconds, silence);
          }
          inputFiles.push(silence);
          continue;
        }

        const partPath = join(workDir, `${segmentName}-${index}.mp3`);
        await synthesizePart(part, partPath, `${segmentName} part ${index}`);
        inputFiles.push(partPath);
      }

      const generatedPath = join(workDir, `${segmentName}.mp3`);
      await concatAudio(ffmpeg, inputFiles, generatedPath);
      generatedOutputs.push(generatedPath);
    }

    for (const outputName of outputNames) {
      await copyFile(join(workDir, outputName), join(audioDir, outputName));
    }

    console.log(`Generated ${generatedOutputs.length} Q01 MP3 files using:`);
    console.log('  Vietnamese: vi-VN-HoaiMyNeural');
    console.log('  English:    en-US-AriaNeural');
    for (const outputName of outputNames) {
      console.log(`  input/Q01/audio/${outputName}`);
    }
  } finally {
    await rm(workDir, {recursive: true, force: true});
  }
}

await main();
