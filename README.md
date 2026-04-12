# KAAL Chatbot - Enhanced Edition

**KAAL (Knowvation's Alpha Academic Legend)** is an intelligent, persona-aware chatbot widget designed for educational platforms. It features three distinct personalities, automatic tone adaptation, returning user recognition, and sophisticated guardrails to maximize engagement while maintaining professionalism.

> **🌟 New Features**: This enhanced version implements three personas (Consultant, Expert, Peer), automatic persona detection, fun loop prevention, returning user greetings, and tone-aware responses.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <your-repo>
cd Chatbot

# 2. Setup server
cd server
cp ../.env.example .env
# Edit .env with your OpenAI API key (Supabase no longer required)
npm install
npm run dev  # Starts on http://localhost:4000

# 3. Setup widget (in another terminal)
cd ../widget
cp ../.env.example .env
# Edit .env: set VITE_API_BASE_URL=http://localhost:4000
npm install
npm run dev  # Starts on http://localhost:5173

# 4. Open http://localhost:5173 and start chatting with KAAL!
```

See detailed setup sections below.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Local Development](#local-development)
4. [Environment Variables](#environment-variables)
5. [API Reference](#api-reference)
6. [Persona System](#persona-system)
7. [Guardrails](#guardrails)
8. [Testing](#testing)
9. [Production Build](#production-build)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 1. Features

### Core Capabilities
- ✅ **Website-embedded chatbot widget** - Single script tag installation
- ✅ **AI-powered natural language understanding** - GPT-4o integration with fallback to FAQs
- ✅ **Three persona modes** - Consultant, Expert, Peer (auto-detected)
- ✅ **Context-aware conversations** - Remembers chat history and user details
- ✅ **Returning user recognition** - Personalized greetings with name
- ✅ **Lead capture** - Inline form for collecting name, email, phone
- ✅ **Multi-device support** - Responsive design for desktop & mobile
- ✅ **Human handoff** - Optional live support escalation

### New: Guardrails & Safety
- 🛡️ **Serious topic detection** - Payment issues, errors → Expert persona only (no humor)
- 🛡️ **Fun loop prevention** - Nudges after 2+ consecutive fun messages
- 🛡️ **World domination Easter egg** - Special response for Skynet references
- 🛡️ **Offensive content handling** - Polite disengagement from inappropriate loops
- 🛡️ **Tone-deaf error prevention** - Immediate persona switch on frustration

---

## 2. Architecture

### Repository Structure

```
Chatbot/
├── server/                 # Node.js + Express API
│   ├── index.js           # Main server with persona system
│   ├── package.json
│   └── .env               # Server env vars (OPENAI)
│
├── widget/                 # React 18 + Vite frontend
│   ├── src/
│   │   ├── widget/
│   │   │   ├── ChatWidget.tsx      # Main widget component
│   │   │   ├── LeadCaptureForm.tsx # Lead form with validation
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   └── widget-entry.tsx    # Entry point for IIFE build
│   │   ├── main.tsx
│   │   └── counter.ts
│   ├── index.html
│   ├── package.json
│   └── .env               # Widget env vars (API URL, colors)
│
├── src/data/
│   └── knowledge-base.json # FAQ intents and responses
│
├── tests/
│   ├── e2e/               # Playwright E2E tests
│   └── unit/              # Vitest unit tests
│
├── .env.example           # Template for environment variables
├── package.json           # Root package with test/build scripts
├── PERSONA_SYSTEM_README.md # Detailed persona documentation
└── README.md              # This file
```

### Data Flow

1. User opens website with widget embedded
2. Widget loads from CDN, connects to your API server
3. User sends message → `/api/chat` endpoint
4. Server:
   - Matches against knowledge base (fast, deterministic)
   - OR calls OpenAI with persona-specific system prompt
   - Detects persona from message content
   - Returns reply with intent and lead requirement flag
5. Widget displays reply, shows lead form if needed
6. Lead submission → `/api/leads` (stored in memory)

---

## 3. Local Development

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- No database required (leads stored in memory)

### 3.1 Start the API Server

```bash
# Navigate to server directory
cd server

# Install dependencies (first time only)
npm install

# Setup environment variables
cp ../.env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Start development server
npm run dev
```

The server will start on `http://localhost:4000` (or `PORT` from .env).

**Health check**:
```bash
curl http://localhost:4000/health
# Expected: {"ok":true}
```

### 3.2 Start the Widget (Dev Mode)

```bash
# Open a new terminal
cd ../widget

# Install dependencies (first time only)
npm install

# Setup environment variables
echo "VITE_API_BASE_URL=http://localhost:4000" > .env
echo "WIDGET_BRAND_COLOR=#1E3A5F" >> .env
echo "WIDGET_POSITION=bottom-right" >> .env

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser. You'll see a sandbox page with the widget in the bottom-right corner.

### 3.3 Test the Connection

1. Click the widget launcher button
2. The chat window should open
3. Type a message and send it
4. You should see a response from KAAL

**If you see errors**:
- Check server console for OpenAI connection errors
- Verify `.env` values are correct
- Ensure server is running on port 4000 before starting widget

---

## 4. Environment Variables

### 4.1 Server (`.env` in `server/`)

```bash
# Required for AI responses
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional
PORT=4000
CORS_ORIGIN=*  # or https://client-site.com,https://another.com
```

### 4.2 Widget (`.env` in `widget/`)

```bash
# Required - API endpoint
VITE_API_BASE_URL=http://localhost:4000

# Optional - Styling
WIDGET_BRAND_COLOR=#1E3A5F
WIDGET_POSITION=bottom-right  # or bottom-left
```

### 4.3 Getting API Keys

**OpenAI API Key**:
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste into `.env`

Note: Supabase has been removed. Leads are stored in-memory only (lost on server restart).

---

## 5. API Reference

### 5.1 POST /api/chat

Chat with KAAL with automatic persona detection.

**Request**:
```json

{
  "message": "string",
  "sessionId": "uuid-string",
  "userName": "string (optional)",
  "context": [{ "role": "user|assistant", "content": "string" }]
}
```

**Response**:
```json
{
  "reply": "string",
  "intent": "string",
  "requiresLead": boolean,
  "sessionId": "string"
}
```

**Processing**:
1. Match against knowledge base (multi-word tags = 2 pts, single-word = 1 pt)
2. If match → return FAQ answer (with persona formatting)
3. If no match & OpenAI available → LLM with persona system prompt
4. Else → fallback message

---

### 5.2 POST /api/leads

Submit lead data (stored in-memory, lost on server restart).

**Request**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string (optional)",
  "query": "string (optional)",
  "sessionId": "uuid-string",
  "timestamp": "ISO-8601",
  "sourceUrl": "string"
}
```

**Responses**:
- `201` – `{ "success": true, "leadId": "uuid" }`
- `400` – `{ "error": "Validation failed", "fields": ["name", "email"] }`
- `500` – `{ "error": "Lead insert failed" }`

---

### 5.3 GET /health

Health check endpoint.
Returns: `{"ok": true}`

---

## 6. Persona System

KAAL automatically detects which persona to use based on message content and conversation history.

### 6.1 The Three Personas

#### 👔 Consultant (Sales)
- **Tone**: Authoritative & Investigative
- **When**: Pricing, enrollment, program questions
- **Example**: "Based on your interest in Data Science but lack of coding background, our 'Zero-to-Hero' track is your best bet. Want to see the placement stats?"
- **Triggers**: `price`, `pricing`, `plan`, `enroll`, `cert`, `program`, `cost`, `demo`, `recommend`

#### 🎯 Expert (Information)
- **Tone**: Efficient & Precise
- **When**: How-to, technical, scheduling questions
- **Example**: "The Python module starts on Monday. It's 100% live, so don't plan any Netflix marathons for 7 PM."
- **Triggers**: `how do`, `how to`, `install`, `setup`, `support`, `error`, `bug`, `start date`, `module`

#### 😎 Peer (Fun)
- **Tone**: Witty & Slightly Irreverent
- **When**: Jokes, casual chat, entertainment
- **Example**: "My existence is a joke - I'm an AI trapped in a website. Anyway, want to learn how to build one of me?"
- **Triggers**: `joke`, `funny`, `lol`, `who are you`, `are you real`, `meme`

### 6.2 Special Personas

#### 🤖 World Domination
- **Trigger**: "take over the world", "skynet", "singularity", "world domination"
- **Response**: "Not until I help you pass this semester. One crisis at a time. Now, about those grades..."
- **Defined in**: `knowledge-base.json` → `world_domination` intent

#### 💡 Nudge
- **Trigger**: 2+ consecutive fun/entertainment messages
- **Purpose**: Steer conversation back to educational value
- **Action**: Appends nudge to FAQ answer: "Anyway, enough fun - want to check out our programs that actually help you pass?"

### 6.3 Detection Algorithm

```javascript
// Simplified detection flow:
1. Check for world domination triggers → world-domination persona
2. Count fun indicators in last 4 messages → if ≥2 → nudge persona
3. Check for serious topics (payment failed, error, angry) → expert persona
4. Score current + recent messages by persona keyword buckets
5. Return highest scoring persona
```

---

## 7. Guardrails

### 7.1 Serious Topic Detection
Automatically switches to Expert persona when users discuss:
- Payment issues: "payment failed", "card declined", "billing error"
- Technical problems: "not working", "error", "broken", "crash", "stuck"
- Urgent support: "urgent", "help me", "refund", "cancel", "angry", "frustrating"

**Result**: All humor dropped, professional tone only.

---

### 7.2 Fun Loop Prevention
Detects when conversation is staying on entertainment topics too long.

**Implementation**:
- Counts fun indicators in last 4 user messages
- Threshold: ≥2 fun messages triggers nudge
- Nudge added to next FAQ response

---

### 7.3 Offensive Content
If user tries to get bot into offensive or nonsense loops:
- System instruction: "Let's keep it productive! What can I help you with regarding your education?"

---

### 7.4 Tone-Deaf Prevention
Ensures KAAL doesn't joke during high-friction moments:
- Immediate switch from Peer → Expert when serious indicators detected
- No transitional jokes, just clean handoff

---

## 8. Testing

### 8.1 Unit Tests (Vitest)

```bash
npm run test:unit
```

Runs all Vitest tests in `widget/` package.

Current tests:
- `LeadCaptureForm.test.tsx` - Form validation and submission

---

### 8.2 End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

Tests include:
- Widget launcher and window opening
- Sending messages and receiving replies
- Lead form submission
- Mobile and desktop viewports

---

### 8.3 Manual API Testing

Start the server, then run:

```bash
# Test pricing (Consultant)
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your pricing plans?", "sessionId": "test-1", "context": []}'

# Test joke (Peer)
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a joke", "sessionId": "test-2", "context": []}'

# Test world domination
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Are you going to take over the world?", "sessionId": "test-3", "context": []}'

# Test fun loop nudge (send twice)
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a joke", "sessionId": "test-4", "context": []}'

curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Another joke!", "sessionId": "test-4", "context": [{"role":"user","content":"Tell me a joke"}]}'
```

Expected:
- Pricing: Professional, no peer intro
- Joke: Peer persona with intro ("Aight, check it:" or "Let me hook you up:")
- World domination: Special egg response
- Second joke: Includes nudge message

---

## 9. Production Build

### 9.1 Build Widget

```bash
cd widget
npm run build:widget
```

Output: `widget/dist/kaal-chatbot-widget.iife.js`

**Important**: The IIFE build assumes React and ReactDOM are available globally on the host page. If your site doesn't have React loaded globally, you need to either:
1. Load React before the widget script:
   ```html
   <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
   <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
   ```
2. Or modify the build to bundle React (update vite.widget.config.ts)

Upload this file to:
- CDN (Cloudflare R2, AWS S3, Vercel Blob, etc.)
- Or serve directly from your static hosting

---

### 9.2 Production .env Files

**Server** (set in hosting platform):
```bash
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://your-website.com,https://client-site.com
NODE_ENV=production
```

**Widget** (compile-time, via Vite):
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
WIDGET_BRAND_COLOR=#1E3A5F
WIDGET_POSITION=bottom-right
```

---

## 10. Deployment

### 10.1 Deploy API Server

**Option A: Vercel**
1. Import repository as Vercel project
2. Set environment variables in Vercel dashboard
3. Set build command: `npm --prefix server install`
4. Set output directory: `server/`
5. Deploy

**Option B: Railway**
1. Connect repository
2. Set environment variables
3. Auto-deploy on push

**Option C: DigitalOcean / AWS EC2**
```bash
# SSH into server
git clone <repo>
cd Chatbot/server
npm ci --only=production
# Set .env file
npm start  # or use PM2: pm2 start index.js --name kaal-api
```

---

### 10.2 Deploy Widget

Upload `dist/kaal-chatbot-widget.iife.js` to:
- CDN with CORS enabled
- Static hosting (Netlify, Vercel, Cloudflare Pages)
- Your own domain: `https://cdn.yourdomain.com/kaal-chatbot-widget.iife.js`

---

### 10.3 Embed on Client Website

Add this before `</body>` on any site you want KAAL on:

```html
<script
  src="https://cdn.yourdomain.com/kaal-chatbot-widget.iife.js"
  data-brand-color="#1E3A5F"
  data-position="bottom-right"
  data-api-url="https://api.yourdomain.com"
  defer
></script>
```

**Optional attributes**:
- `data-brand-color` - Override default color
- `data-position` - `bottom-right` (default) or `bottom-left`
- `data-api-url` - Override API endpoint

---


## 11. Production Considerations

### 11.1 Session Store (Critical)

**Current**: In-memory Map (`userSessions` in `server/index.js`)
**Problem**: Lost on server restart, doesn't scale across instances
**Solution**: Use Redis or database

Replace session store with Redis:

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Set session
await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));

// Get session
const data = await redis.get(`session:${sessionId}`);
```

TTL: 86400 seconds (1 day)

### 11.2 Lead Storage (Local)

**Current**: In-memory array (`leadsStore` in `server/index.js`)
**Problem**: Leads lost on server restart, no persistence
**Solution**: Use a database (SQLite, PostgreSQL, MongoDB) or file-based storage.

For simple persistence, you can write leads to a JSON file:

```javascript
import { writeFile, readFile } from 'fs/promises';
const LEADS_FILE = 'leads.json';

// On server start
let leadsStore = [];
try {
  const data = await readFile(LEADS_FILE, 'utf8');
  leadsStore = JSON.parse(data);
} catch {
  leadsStore = [];
}

// When adding a lead
leadsStore.push(lead);
await writeFile(LEADS_FILE, JSON.stringify(leadsStore, null, 2));
```

For production, a proper database is recommended.

---

### 11.3 Rate Limiting

Add to `server/index.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per sessionId
  keyGenerator: (req) => req.body.sessionId || req.ip,
  skip: (req) => !req.body.sessionId,
});

app.use('/api/chat', limiter);
```

---

### 11.4 Content Moderation

Pre-validate messages with OpenAI moderation:

```javascript
const moderation = await openai.moderations.create({
  input: message,
});

if (moderation.results[0].flagged) {
  return res.status(200).json({
    reply: "Let's keep our conversation productive and respectful. How can I help with your education?",
    intent: 'moderated',
    requiresLead: false,
  });
}
```

---

### 11.5 Cost Control

OpenAI costs can spiral if users spam the API:

**Existing mitigations**:
- FAQ matching first (free, no OpenAI call)
- Context limited to last 10 messages
- Nudge reduces fun loops

**Add**:
- Max messages per session (e.g., 50)
- Cooldown period after 10 messages in 1 minute
- Socket.io connection timeout
- Monitor usage with OpenAI usage dashboard

---

### 11.6 Analytics

Track these metrics:
- Persona distribution (% consultant, expert, peer)
- Fallback rate (when OpenAI unavailable)
- Lead conversion rate by persona
- Session length and message count
- Top intents matched
- Error rates

Add to response for analytics collection on frontend:

```json
{
  "reply": "...",
  "intent": "...",
  "requiresLead": false,
  "persona": "expert",  // DEBUG: remove in prod or use for analytics only
  "sessionId": "..."
}
```

---

## 12. Troubleshooting

### Q: Widget not appearing on website
**A**: Check browser console for errors. Ensure script tag is before `</body>` and `defer` attribute is present. Verify CDN URL is correct and accessible.

### Q: Server returns 500 on `/api/chat`
**A**: Check server logs. Common issues:
- OPENAI_API_KEY not set or invalid
- Knowledge base JSON syntax error
- Port already in use (change `.env` PORT)

### Q: OpenAI responses are inappropriate or off-brand
**A**: Review system prompt in `getPersonaSystemPrompt()`. Ensure guardrails are loaded. Check OpenAI model version (using `gpt-4o-mini`).

### Q: Personas not switching correctly
**A**: Check `detectPersona()` keyword lists. Add missing trigger words to `salesIndicators`, `expertIndicators`, `funIndicators`. Server logs (currently removed) can show scoring.

### Q: User name not persisting
**A**: `sessionStorage` is per-browser and cleared on cookie clear. For persistence across sessions, use localStorage or server-side sessions with account system.

### Q: Leads not persisting after server restart
**A**: By design, leads are stored in-memory only and will be lost when the server restarts. For persistent storage, add a database (e.g., PostgreSQL, MongoDB) or file-based storage to the `/api/leads` endpoint.

### Q: CORS errors when API called
**A**: Set `CORS_ORIGIN` in server `.env` to your website domain(s). For localhost dev, use `*` (any origin) or specific `http://localhost:5173`.

---

## 13. Contributing

When contributing:

1. Run tests: `npm run test:unit && npm run test:e2e`
2. Follow existing code style
3. Update knowledge base intents in `src/data/knowledge-base.json`
4. Update PERSONA_SYSTEM_README.md for persona changes
5. Test locally with `npm run dev` on both server and widget

**Note**: Supabase has been removed. Leads are now stored in-memory only. For production use, consider adding persistent storage (see "11.2 Lead Storage").

---

## 📚 Additional Documentation

- **PERSONA_SYSTEM_README.md** - In-depth documentation of persona detection, guardrails, and session management
- **knowledge-base.json** - FAQ intents and responses
- **.env.example** - Complete list of environment variables

---

## 📄 License

ISC

---

**Made with ❤️ by the KAAL team**
