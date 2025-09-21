#!/usr/bin/env node
// simulate-image-to-video.cjs
// Usage: node simulate-image-to-video.cjs <imagePathOrDataUrl> [outputPath]
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const sharp = require('sharp');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node simulate-image-to-video.cjs <imagePathOrDataUrl> [outputPath]');
    process.exit(2);
  }
  const input = args[0];
  const out = args[1] || path.resolve(__dirname, '..', 'output', `simulated_video_${Date.now()}.mp4`);
  // ensure output dir
  fs.mkdirSync(path.dirname(out), { recursive: true });

  try {
    let buffer;
    if (input.startsWith('data:')) {
      // data URL
      const base64 = input.split(',')[1];
      buffer = Buffer.from(base64, 'base64');
    } else {
      buffer = fs.readFileSync(input);
    }

    // create a single frame resized to 1280x720
    const frame = await sharp(buffer).resize(1280, 720, { fit: 'cover' }).toFormat('png').toBuffer();
    const tmpDir = path.join(__dirname, '.tmp_frames');
    fs.mkdirSync(tmpDir, { recursive: true });
    const framePath = path.join(tmpDir, 'frame.png');
    fs.writeFileSync(framePath, frame);

    // try ffmpeg to make a 4s video with slow zoom effect using scale and zoompan if available
    const ffmpeg = 'ffmpeg';
    try {
      child_process.execSync(`${ffmpeg} -version`, { stdio: 'ignore' });
      // build command: loop the frame, apply zoompan filter
      const cmd = `${ffmpeg} -y -loop 1 -i ${framePath} -vf "zoompan=z='zoom+0.0005':d=125" -t 4 -r 25 -c:v libx264 -pix_fmt yuv420p ${out}`;
      console.log('Running ffmpeg command:', cmd);
      child_process.execSync(cmd, { stdio: 'inherit' });
      console.log('Video written to', out);
    } catch (e) {
      // fallback: create very simple video using ffmpeg loop without filters
      try {
        const cmd2 = `${ffmpeg} -y -loop 1 -i ${framePath} -t 4 -r 25 -c:v libx264 -pix_fmt yuv420p ${out}`;
        child_process.execSync(cmd2, { stdio: 'inherit' });
        console.log('Fallback video written to', out);
      } catch (e2) {
        // if ffmpeg is not available, write the frame as a still image and exit
        const fallback = path.join(path.dirname(out), 'simulated_frame.png');
        fs.writeFileSync(fallback, frame);
        console.log('ffmpeg not available; wrote single frame to', fallback);
      }
    }

    // cleanup
    try { fs.rmSync(tmpDir, { recursive: true }); } catch (e) { /* noop */ }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
