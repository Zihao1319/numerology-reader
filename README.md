# 八宅飛星 Numerology Reader

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create numerology-reader --public --push
```

### 2. Deploy to Vercel
```bash
npm i -g vercel
vercel
```
Follow the prompts — accept all defaults.

### 3. Set your API key (IMPORTANT)
In Vercel dashboard → your project → Settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-...your key...
```
Then redeploy:
```bash
vercel --prod
```

### 4. Share the URL
Vercel gives you a URL like `https://numerology-reader-xxx.vercel.app`

## Local Development
```bash
npm install
npm run dev
```
For local dev with the API proxy working:
```bash
npm i -g vercel
vercel dev
```
Set ANTHROPIC_API_KEY in a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Project Structure
```
├── api/
│   └── chat.js          # Vercel Edge Function (API proxy)
├── src/
│   ├── main.jsx         # React entry point
│   └── App.jsx          # Main app (all logic + UI)
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```
