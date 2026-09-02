import React, { useState } from 'react';
import { Wifi, Radio, Code, Copy, Check, Terminal, Server, ShieldCheck } from 'lucide-react';

export default function ReceiverStatus({ healthData }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const serverIp = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '<YOUR-SERVER-IP>'
    : window.location.hostname;

  const wifiUrl = `http://${serverIp}:5000/api/events`;
  const loraUrl = `http://${serverIp}:5000/api/events/lora`;

  const curlExample = `curl -X POST "${wifiUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_id": "EVT-00125",
    "hazard": "fire",
    "confidence": 0.91,
    "priority": "HIGH",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "altitude": 42.5,
    "timestamp": "2026-09-01T14:32:18",
    "image_path": "events/EVT-00125/image.jpg"
  }'`;

  const pythonExample = `import requests
import json
from datetime import datetime

# Person 2 Ground Station Backend Endpoint
ENDPOINT = "${wifiUrl}"

payload = {
    "event_id": "EVT-" + datetime.now().strftime("%Y%m%d%H%M%S"),
    "hazard": "fire",  # or 0=flood, 1=smoke, 2=fire, 3=debris, 4=landslide, 5=person
    "confidence": 0.94,
    "priority": "HIGH",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "altitude": 45.0,
    "timestamp": datetime.now().isoformat(),
    "image_path": "events/EVT-00125/image.jpg"
}

response = requests.post(ENDPOINT, json=payload)
print("Status Code:", response.status_code)
print("Response:", response.json())`;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Overview Card */}
      <div className="glass-panel p-6 border-cyan-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-white">
              PERSON 1 / RASPBERRY PI INTEGRATION CONTRACT
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Provide these connection endpoints to Person 1 for real drone deployment over Wi-Fi and LoRa.
            </p>
          </div>
        </div>

        {/* Dual Channels Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          
          {/* Wi-Fi Channel */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
                <Wifi className="w-4 h-4" /> WI-FI HIGH-BANDWIDTH ENDPOINT
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
            <div className="p-2 rounded bg-black/60 border border-slate-800 text-cyan-300 font-bold select-all">
              POST {wifiUrl}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Transmits full JSON payload + optional image evidence binary (`multipart/form-data` with field `image`).
            </p>
          </div>

          {/* LoRa Channel */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                <Radio className="w-4 h-4" /> LORA LOW-BANDWIDTH TELEMETRY
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-bold">
                ACTIVE
              </span>
            </div>
            <div className="p-2 rounded bg-black/60 border border-slate-800 text-amber-300 font-bold select-all">
              POST {loraUrl}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Transmits lightweight telemetry (coordinates, hazard class, confidence, priority). No images transmitted over LoRa.
            </p>
          </div>

        </div>

      </div>

      {/* Code Snippets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* cURL Example */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" /> SAMPLE cURL REQUEST
              </span>
              <button
                onClick={() => handleCopy(curlExample, 1)}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIndex === 1 ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
              <code>{curlExample}</code>
            </pre>
          </div>
        </div>

        {/* Python Example */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-amber-400" /> RASPBERRY PI PYTHON SCRIPT
              </span>
              <button
                onClick={() => handleCopy(pythonExample, 2)}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIndex === 2 ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px] overflow-x-auto">
              <code>{pythonExample}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
}
