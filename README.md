# Pass English — AMIR Test Prep App 🎯

Built for IDF soldiers preparing for the **אמי"ר (AMIR)** English proficiency test.

## Features
- 📚 **Flashcards** — 50+ vocabulary words from real AMIR tests with spaced repetition
- ✍️ **Sentence Completion** — 30 real AMIR-style questions with AI hints
- 🔄 **Restatements** — 10 questions with key-word strategy  
- 📖 **Reading Comprehension** — 4 real passages with 16 questions
- 📝 **Mock Test** — Full timed simulation (3 sections × 25 min)
- 📊 **Progress Tracker** — XP, score estimate, weak spots
- 🤖 **AI Tutor** — Ask anything in Hebrew, powered by Claude

## Deployment

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/YOUR_USERNAME/pass-english.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Select pass-english repo → Deploy

### 3. Add API Key
In Vercel → Settings → Environment Variables:
- Name: `ANTHROPIC_API_KEY`
- Value: `sk-ant-...`

Redeploy after adding the key.

## Local Dev
```bash
npm install
npx vercel dev   # runs both frontend and API routes
```
