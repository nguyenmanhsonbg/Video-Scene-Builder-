import {mkdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const execFileAsync = promisify(execFile);
const ffmpegPath = fileURLToPath(new URL('../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe', import.meta.url));
const audioDir = fileURLToPath(new URL('../tests/fixtures/Q01/audio/', import.meta.url));

const files = [
  ['Q01_01_question.mp3', 6.21],
  ['Q01_02_svo.mp3', 17.84],
  ['Q01_03_transform.mp3', 25.13],
  ['Q01_04_answer.mp3', 10.42],
] as const;

await mkdir(audioDir, {recursive: true});
for (const [filename, duration] of files) {
  const output = join(audioDir, filename);
  await execFileAsync(ffmpegPath, [
    '-y',
    '-f', 'lavfi',
    '-i', 'anullsrc=r=44100:cl=mono',
    '-t', duration.toFixed(2),
    '-ar', '44100',
    '-ac', '1',
    '-c:a', 'libmp3lame',
    '-b:a', '64k',
    output,
  ], {cwd: dirname(ffmpegPath)});
}

console.log(`Created ${files.length} deterministic MP3 fixtures in ${audioDir}`);
