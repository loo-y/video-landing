import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { removeBackground } from "@imgly/background-removal";

const VIDEO_PATH = "./public/videos/bg-video.mp4";
const OUTPUT_DIR = "./public/frames";
const BACKGROUND_DIR = join(OUTPUT_DIR, "background");
const FOREGROUND_DIR = join(OUTPUT_DIR, "foreground");
const FPS = 30; // Adjust based on your needs

async function main() {
  console.log("🎬 Video Preprocessing Script");
  console.log("=============================\n");

  // Check if video exists
  if (!existsSync(VIDEO_PATH)) {
    console.error(`❌ Video not found: ${VIDEO_PATH}`);
    console.log("Please place your video at public/videos/bg-video.mp4");
    process.exit(1);
  }

  // Create output directories
  mkdirSync(BACKGROUND_DIR, { recursive: true });
  mkdirSync(FOREGROUND_DIR, { recursive: true });

  // Step 1: Extract frames using ffmpeg
  console.log("📹 Step 1: Extracting video frames...");
  try {
    execSync(
      `ffmpeg -i "${VIDEO_PATH}" -vf fps=${FPS} "${join(BACKGROUND_DIR, "frame_%04d.png")}" -y`,
      { stdio: "inherit" }
    );
    console.log("✅ Frames extracted successfully\n");
  } catch (error) {
    console.error("❌ FFmpeg error. Make sure ffmpeg is installed.");
    process.exit(1);
  }

  // Step 2: Get list of extracted frames
  const frames = readdirSync(BACKGROUND_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();

  if (frames.length === 0) {
    console.error("❌ No frames extracted");
    process.exit(1);
  }

  console.log(`📸 Found ${frames.length} frames\n`);

  // Step 3: Process each frame with background removal
  console.log("🖼️  Step 2: Removing backgrounds (this may take a while)...");
  console.log("   First run will download AI model (~100MB)...\n");

  let processed = 0;
  for (const frame of frames) {
    const inputPath = join(BACKGROUND_DIR, frame);
    const outputPath = join(FOREGROUND_DIR, frame);

    try {
      const blob = await removeBackground(inputPath, {
        progress: (key, current, total) => {
          if (key === "compute:inference") {
            const percent = Math.round((current / total) * 100);
            process.stdout.write(
              `\r   Processing frame ${processed + 1}/${frames.length} - ${percent}%`
            );
          }
        },
      });

      // Convert blob to buffer and save
      const buffer = Buffer.from(await blob.arrayBuffer());
      const { writeFileSync: write } = await import("fs");
      write(outputPath, buffer);

      processed++;
    } catch (error) {
      console.error(`\n❌ Error processing ${frame}:`, error.message);
    }
  }

  console.log(`\n\n✅ Processed ${processed}/${frames.length} frames\n`);

  // Step 4: Generate metadata
  console.log("📝 Step 3: Generating metadata...");
  const meta = {
    fps: FPS,
    totalFrames: frames.length,
    backgroundDir: "/frames/background",
    foregroundDir: "/frames/foreground",
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(join(OUTPUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
  console.log("✅ Metadata saved\n");

  console.log("=============================");
  console.log("🎉 Preprocessing complete!");
  console.log(`   Background frames: ${BACKGROUND_DIR}`);
  console.log(`   Foreground frames: ${FOREGROUND_DIR}`);
  console.log(`   Metadata: ${join(OUTPUT_DIR, "meta.json")}`);
}

main().catch(console.error);
