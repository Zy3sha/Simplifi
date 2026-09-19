// Minimal Anthropic Messages API caller (raw https, no npm deps so CI needs no install).
// Requires env ANTHROPIC_API_KEY. Model via AGENT_MODEL (default claude-sonnet-5).
import https from 'https';

export function anthropic({ system, prompt, model, maxTokens = 4096 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set (add it as a GitHub repo secret).');
  const body = JSON.stringify({
    model: model || process.env.AGENT_MODEL || 'claude-sonnet-5',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      host: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(body),
      },
    }, (resp) => {
      let b = '';
      resp.on('data', (c) => (b += c));
      resp.on('end', () => {
        if (resp.statusCode >= 300) return reject(new Error(`Anthropic ${resp.statusCode}: ${b.slice(0, 500)}`));
        try {
          const j = JSON.parse(b);
          resolve((j.content || []).map((x) => x.text || '').join('').trim());
        } catch (e) { reject(new Error(`bad JSON: ${b.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Tiny GET helper for fetching competitor pages / store JSON (no deps).
export function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'OBubbaAgent/1.0 (+https://obubba.com)' } }, (resp) => {
      if (resp.statusCode >= 300 && resp.headers.location) return resolve(fetchText(resp.headers.location));
      let b = '';
      resp.on('data', (c) => (b += c));
      resp.on('end', () => resolve(b));
    }).on('error', reject);
  });
}
