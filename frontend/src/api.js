const API_BASE = '/api';

export async function analyzeStock(ticker) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Analysis failed');
  }
  return data;
}

export async function fetchDemo(ticker) {
  const url = ticker
    ? `${API_BASE}/demo?ticker=${ticker}`
    : `${API_BASE}/demo`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Demo fetch failed');
  }
  return data;
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
