
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const JULES_API_KEY = process.env.JULES_API_KEY;
const API_BASE = 'https://jules.googleapis.com/v1alpha';

if (!JULES_API_KEY) {
  console.error('Error: JULES_API_KEY is not set.');
  process.exit(1);
}

async function main() {
  const sessionId = process.argv[2];
  if (!sessionId) {
    console.error('Usage: npx tsx scripts/jules-check.ts <session-id>');
    process.exit(1);
  }

  console.log(`Checking session: ${sessionId}`);
  console.log(`Monitor at: https://jules.google.com/session/${sessionId}`);

  // Poll for completion
  let status = 'RUNNING';
  let retries = 0;
  
  while (status === 'RUNNING' || status === 'PENDING' || status === 'IN_PROGRESS') {
    // Check session state
    const sessionRes = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      headers: { 'x-goog-api-key': JULES_API_KEY }
    });
    
    if (sessionRes.ok) {
      const sess = await sessionRes.json();
      console.log(`Status: ${sess.state}`);
      
      // FETCH AND PRINT RECENT ACTIVITIES
      try {
        const actsRes = await fetch(`${API_BASE}/sessions/${sessionId}/activities`, {
            headers: { 'x-goog-api-key': JULES_API_KEY }
        });
        if (actsRes.ok) {
            const acts = await actsRes.json();
            const recent = (acts.activities || []).slice(0, 3);
            recent.forEach((a: any) => console.log(`[Activity] ${a.createTime}: ${a.type} - ${a.message || ''}`));
        }
      } catch (e) { /* ignore activity fetch errors */ }

      if (sess.state === 'SUCCEEDED' || sess.state === 'FAILED' || sess.state === 'ENDED') {
        status = sess.state;
      } else {
          // If status is still running, wait
          status = sess.state || 'IN_PROGRESS'; // Default to in progress if state is missing but request ok
      }
    } else {
      console.error('Failed to get session status:', await sessionRes.text());
      retries++;
      if (retries > 3) process.exit(1);
    }
    
    if (status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ENDED') {
        await new Promise(r => setTimeout(r, 10000)); // Wait 10s
    }
  }

  if (status !== 'SUCCEEDED') {
    console.error(`Session finished with status: ${status}`);
    // Optional: try to download anyway?
  }

  // Download Output
  console.log('Attempting to download output files...');
  
  try {
    // Listing files
    const filesRes = await fetch(`${API_BASE}/sessions/${sessionId}/files`, {
        headers: { 'x-goog-api-key': JULES_API_KEY }
    });

    if (filesRes.ok) {
        const contentType = filesRes.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            const data = await filesRes.json();
            const files = data.files || [];
            console.log(`Found ${files.length} files.`);
            
            for (const file of files) {
                const filePath = file.path;
                console.log(`Fetching ${filePath}...`);
                const fileContentRes = await fetch(`${API_BASE}/sessions/${sessionId}/files/${encodeURIComponent(filePath)}`, {
                     headers: { 'x-goog-api-key': JULES_API_KEY }
                });
                const content = await fileContentRes.text();
                
                const fullPath = path.resolve(process.cwd(), filePath);
                // Ensure directory exists
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, content);
                console.log(`Saved: ${fullPath}`);
            }
        } else {
            // Raw text/patch fallback
            const text = await filesRes.text();
            console.log('Received raw output (patch?):');
            console.log(text.substring(0, 200) + '...');
            
            if (text.startsWith('diff --git')) {
                fs.writeFileSync('jules.patch', text);
                console.log('Applying patch...');
                try {
                    execSync('git apply jules.patch');
                    console.log('Patch applied successfully.');
                    fs.unlinkSync('jules.patch');
                } catch (e) {
                    console.error('Failed to apply patch. Saved as jules.patch');
                }
            } else {
                console.log('Output format unrecognized. Saved as jules_output.txt');
                fs.writeFileSync('jules_output.txt', text);
            }
        }
    } else {
        console.error('Failed to fetch files endpoint:', await filesRes.text());
    }
  } catch (e) {
      console.error('Error fetching/applying output:', e);
  }
}

main().catch(console.error);
