'use client';

import { useState } from 'react';

export default function HeyGenGenerator() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const PROMPT = "A stylized 3D digital assistant. Male in his 40s, wearing a plain quarter-zip or button-down shirt. Non-corporate, approachable, looking like a blue-collar peer. Dark background with subtle STRATUS blue accents. Not photorealistic. Saying exactly this and nothing else: 'Hi! How can we help you streamline your business operations today?'";

  const generateVideo = async () => {
    if (!apiKey) {
      alert("Please enter your HeyGen API Key");
      return;
    }

    try {
      setStatus('Generating...');
      addLog('Starting generation...');

      // 1. Create Session
      addLog('Calling POST /v3/video-agents...');
      const createRes = await fetch("https://api.heygen.com/v3/video-agents", {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create session: ${await createRes.text()}`);
      }

      const createData = await createRes.json();
      const sessionId = createData.data.session_id;
      addLog(`Session created! ID: ${sessionId}`);

      // 2. Poll for video_id
      addLog('Waiting for video ID assignment...');
      let videoId = null;
      while (!videoId) {
        await new Promise(r => setTimeout(r, 5000));
        const sessionRes = await fetch(`https://api.heygen.com/v3/video-agents/${sessionId}`, {
          headers: { "X-Api-Key": apiKey }
        });
        const sessionData = await sessionRes.json();
        videoId = sessionData.data.video_id;
        if (!videoId) addLog('Still waiting for video ID...');
      }
      addLog(`Video ID assigned! ID: ${videoId}`);

      // 3. Poll for completed video
      addLog('Waiting for video rendering to complete (this takes a few minutes)...');
      while (true) {
        await new Promise(r => setTimeout(r, 10000));
        const videoRes = await fetch(`https://api.heygen.com/v3/videos/${videoId}`, {
          headers: { "X-Api-Key": apiKey }
        });
        const videoData = await videoRes.json();
        
        if (videoData.data.status === "completed") {
          const url = videoData.data.video_url;
          setVideoUrl(url);
          addLog(`SUCCESS! Video URL: ${url}`);
          setStatus('Completed!');
          break;
        } else if (videoData.data.status === "failed") {
          throw new Error('Video generation failed on HeyGen side.');
        } else {
          addLog('Rendering... checking again in 10s...');
        }
      }

    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
      setStatus('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">HeyGen API Generator (Browser Mode)</h1>
        <p className="text-gray-400">This bypasses backend network blocks by making API calls directly from your browser.</p>
        
        <div>
          <label className="block text-sm mb-2">HeyGen API Key:</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
            placeholder="sk_V2_..."
          />
        </div>

        <button onClick={generateVideo} disabled={status === 'Generating...'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          {status === 'Generating...' ? 'Generating (Check Logs)...' : 'Generate Avatar & 3s Video'}
        </button>

        {videoUrl && (
          <div className="p-4 bg-green-900/30 border border-green-500 rounded">
            <p className="text-green-400 font-bold mb-2">Success! Copy this URL into Vercel NEXT_PUBLIC_AVATAR_TEASER_URL:</p>
            <input type="text" readOnly value={videoUrl} className="w-full bg-black border border-green-500 p-2 rounded text-green-400 select-all" />
          </div>
        )}

        <div className="bg-gray-900 border border-gray-700 p-4 rounded h-64 overflow-y-auto">
          <h3 className="font-bold mb-2">Logs:</h3>
          {logs.map((log, i) => <div key={i} className="text-sm">{log}</div>)}
        </div>
      </div>
    </div>
  );
}
