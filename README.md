# 八宅飛星 Numerology Reader

## Deploy to Vercel

### 1. Push to GitHub
Upload the contents of this folder to a GitHub repo.

### 2. Deploy to Vercel
Connect your GitHub repo to Vercel. It auto-detects Vite.

### 3. Set Environment Variables
In Vercel dashboard → your project → Settings → Environment Variables:

```
OPENROUTER_API_KEY = sk-or-...your OpenRouter key...
ANTHROPIC_API_KEY  = sk-ant-...your Anthropic key... (fallback)
```

At least one key is required. OpenRouter (Qwen) is tried first — if it fails, falls back to Claude.

### 4. Redeploy
After setting env vars, go to Deployments → Redeploy.

## How It Works
- `/api/chat` Edge Function tries OpenRouter (qwen/qwen3.7-plus) first
- If OpenRouter fails for any reason, automatically falls back to Claude Sonnet
- No API key exposed to browser — all calls go through the Edge Function

## Local Development
```bash
npm install
vercel dev
```
Create `.env.local`:
```
OPENROUTER_API_KEY=sk-or-...
ANTHROPIC_API_KEY=sk-ant-...
```
