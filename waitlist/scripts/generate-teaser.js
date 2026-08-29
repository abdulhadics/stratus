const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContentStr = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContentStr.match(/HEYGEN_API_KEY=([^\r\n]+)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;

if (!API_KEY) {
  console.error("HEYGEN_API_KEY is missing in .env.local");
  process.exit(1);
}

const PROMPT = "A male presenter in his 40s dressed in a plain button-down shirt, looking directly at the camera, saying exactly this and nothing else: 'Hi! How can we help you streamline your business operations today?'";

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTeaser() {
  console.log("🚀 Starting HeyGen Video Generation...");
  console.log(`Using API Key: ${API_KEY.substring(0, 10)}...`);

  // 1. Send prompt to Video Agent
  console.log("\n1. Sending prompt to Video Agent...");
  const createRes = await fetch("https://api.heygen.com/v3/video-agents", {
    method: "POST",
    headers: {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: PROMPT }),
  });

  if (!createRes.ok) {
    console.error("Failed to create video session:", await createRes.text());
    process.exit(1);
  }

  const createData = await createRes.json();
  const sessionId = createData.data.session_id;
  console.log(`✅ Session created! ID: ${sessionId}`);

  // 2. Poll for video_id
  console.log("\n2. Waiting for video_id assignment...");
  let videoId = null;
  while (!videoId) {
    const sessionRes = await fetch(`https://api.heygen.com/v3/video-agents/${sessionId}`, {
      headers: { "X-Api-Key": API_KEY }
    });
    const sessionData = await sessionRes.json();
    
    if (!sessionRes.ok) {
        console.error("Error fetching session:", sessionData);
        process.exit(1);
    }

    videoId = sessionData.data.video_id;
    if (!videoId) {
      process.stdout.write(".");
      await delay(5000);
    }
  }
  console.log(`\n✅ Video ID assigned! ID: ${videoId}`);

  // 3. Poll for completed video
  console.log("\n3. Waiting for video rendering to complete (this may take a few minutes)...");
  let videoUrl = null;
  while (true) {
    const videoRes = await fetch(`https://api.heygen.com/v3/videos/${videoId}`, {
      headers: { "X-Api-Key": API_KEY }
    });
    const videoData = await videoRes.json();
    
    if (!videoRes.ok) {
        console.error("\nError fetching video:", videoData);
        process.exit(1);
    }

    const status = videoData.data.status;
    if (status === "completed") {
      videoUrl = videoData.data.video_url;
      console.log(`\n🎉 Video generation COMPLETE!`);
      console.log(`🔗 Video URL: ${videoUrl}`);
      break;
    } else if (status === "failed") {
      console.error("\n❌ Video generation FAILED!");
      console.error(videoData.data.error);
      process.exit(1);
    }
    
    process.stdout.write(".");
    await delay(10000);
  }

  // 4. Update .env.local
  console.log("\n4. Saving URL to .env.local...");
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_AVATAR_TEASER_URL=')) {
    envContent = envContent.replace(
        /NEXT_PUBLIC_AVATAR_TEASER_URL=.*/, 
        `NEXT_PUBLIC_AVATAR_TEASER_URL=${videoUrl}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_AVATAR_TEASER_URL=${videoUrl}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local updated successfully!");
  console.log("\nDONE! You can now commit and redeploy your Next.js app.");
}

generateTeaser().catch(console.error);
