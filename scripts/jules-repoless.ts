
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const JULES_API_KEY = process.env.JULES_API_KEY;
const API_BASE = 'https://jules.googleapis.com/v1alpha';

if (!JULES_API_KEY) {
  console.error('Error: JULES_API_KEY is not set. Please check .env.local or environment variables.');
  process.exit(1);
}

async function main() {
  const promptFile = process.argv[2];
  if (!promptFile) {
    console.error('Usage: npx tsx scripts/jules-repoless.ts <prompt-file>');
    process.exit(1);
  }

  const promptContent = fs.readFileSync(promptFile, 'utf-8');
  
  // 1. Create Session
  console.log('Creating Jules session...');
  const createRes = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': JULES_API_KEY
    },
    body: JSON.stringify({ prompt: promptContent })
  });

  if (!createRes.ok) {
    console.error('Failed to create session:', await createRes.text());
    process.exit(1);
  }

  const session = await createRes.json();
  const sessionId = session.name.split('/').pop(); // Assuming name is projects/.../sessions/ID
  console.log(`Session created: ${sessionId}`);
  console.log(`Monitor at: https://jules.google.com/session/${sessionId}`);

  // 2. Poll for completion
  console.log('Waiting for session completion...');
  let status = 'RUNNING';
  
  while (status === 'RUNNING' || status === 'PENDING') {
    await new Promise(r => setTimeout(r, 5000));
    
    // Check activities or session state
    // For simplicity, we check the session state if available, or list activities
    const sessionRes = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      headers: { 'x-goog-api-key': JULES_API_KEY }
    });
    
    if (sessionRes.ok) {
      const sess = await sessionRes.json();
      console.log(`Status: ${sess.state}`);
      if (sess.state === 'SUCCEEDED' || sess.state === 'FAILED' || sess.state === 'ENDED') {
        status = sess.state;
      }
    } else {
      // Fallback to activities if session endpoint behaves differently
      const actsRes = await fetch(`${API_BASE}/sessions/${sessionId}/activities`, {
        headers: { 'x-goog-api-key': JULES_API_KEY }
      });
      // ... parsing activities ...
    }
  }

  if (status !== 'SUCCEEDED' && status !== 'ENDED') {
    console.error(`Session finished with status: ${status}`);
    // Try to get output anyway?
  }

  // 3. Download Output (Try Files API)
  console.log('Downloading output files...');
  // The user suggested /files endpoint. Let's try to list files.
  // Note: The exact API shape for "download files" in repoless might be specific.
  // We'll try to list files and then download content.
  
  try {
    const filesRes = await fetch(`${API_BASE}/sessions/${sessionId}/files`, {
        headers: { 'x-goog-api-key': JULES_API_KEY }
    });

    if (filesRes.ok) {
        // Assume it returns a list of files or a patch. 
        // If it's a JSON list:
        const contentType = filesRes.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            const data = await filesRes.json();
            const files = data.files || []; // Adjust based on actual response schema
            
            for (const file of files) {
                const filePath = file.path;
                const fileContentRes = await fetch(`${API_BASE}/sessions/${sessionId}/files/${encodeURIComponent(filePath)}`, {
                     headers: { 'x-goog-api-key': JULES_API_KEY }
                });
                const content = await fileContentRes.text();
                
                const fullPath = path.resolve(process.cwd(), filePath);
                console.log(`Writing ${fullPath}...`);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, content);
            }
        } else {
            // Maybe it's the patch text directly?
            const text = await filesRes.text();
            console.log('Received raw output (patch?):');
            console.log(text.substring(0, 200) + '...');
            
            if (text.startsWith('diff --git')) {
                fs.writeFileSync('jules.patch', text);
                console.log('Applying patch...');
                execSync('git apply jules.patch');
                fs.unlinkSync('jules.patch');
            }
        }
    } else {
        console.error('Failed to fetch files:', await filesRes.text());
    }
  } catch (e) {
      console.error('Error fetching/applying output:', e);
  }
}

main().catch(console.error);
