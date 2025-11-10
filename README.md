# FIZ AI TaxBot - MCP Server

Model Context Protocol server for Portuguese Tax Assistant.

## ⚠️ IMPORTANT: MCP Requires Local Setup

**MCP protocol works ONLY through local Node.js process (stdio transport).**

If you cannot run Node.js locally, use **REST API** instead (see below).

---

## 🏠 Option 1: MCP Protocol (Claude Desktop/Code)

**Requirements:**
- Node.js installed locally
- Access to this repository

### 1. Clone repository and install dependencies

```bash
git clone https://github.com/YOUR_USERNAME/fiz-taxbot-mcp.git
cd fiz-taxbot-mcp
npm install
```

Or download as ZIP and extract.

### 2. Get your API key

**For FIZ internal developers:**
- Go to https://af.fiz.co/admin/mcp-keys
- Login with @fiz.co email
- Create new API key (tier: `mcp_fiz_internal`)
- Copy the key (starts with `fiz_mcp_internal_...`)

**For external developers:**
- Contact FIZ team for API key
- You will receive external tier key (starts with `fiz_mcp_external_...`)

### 3. Configure Claude Desktop

Edit your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

Add:

```json
{
  "mcpServers": {
    "fiz-taxbot": {
      "command": "node",
      "args": ["/absolute/path/to/fiz-taxbot-mcp/index.js"],
      "env": {
        "FIZ_API_KEY": "your_api_key_here",
        "FIZ_API_URL": "https://af.fiz.co"
      }
    }
  }
}
```

**⚠️ Important**:
- Replace `/absolute/path/to/fiz-taxbot-mcp/` with actual path where you cloned the repository!
- Example macOS: `"/Users/username/fiz-taxbot-mcp/index.js"`
- Example Windows: `"C:\\Users\\username\\fiz-taxbot-mcp\\index.js"`
- Use `https://af.fiz.co` for production

### 4. Restart Claude Desktop

The MCP server will appear in Claude Desktop's tool panel.

---

## 🌐 Option 2: REST API (Universal)

**No local setup required!** Use this if you cannot run Node.js locally.

### Endpoint

```
POST https://af.fiz.co/api/mcp/query
```

### Headers

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body

```json
{
  "question": "Your tax question in any language",
  "specialist": "civa"  // Optional: force specific specialist
}
```

### Response

```json
{
  "response": "Answer in your language",
  "specialist": "civa",
  "conversationId": "...",
  "conversationContinued": true,
  "followupQuestions": [...],
  "references": [...],
  "detectedLanguage": "ru",
  "rateLimit": {
    "limit": 1000,
    "used": 1,
    "remaining": 999
  }
}
```

### Example (curl)

```bash
curl -X POST https://af.fiz.co/api/mcp/query \
  -H "Authorization: Bearer fiz_mcp_external_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Какая ставка НДС в Португалии?"
  }'
```

### Example (Python)

```python
import requests

response = requests.post(
    "https://af.fiz.co/api/mcp/query",
    headers={
        "Authorization": "Bearer fiz_mcp_external_xxxxx",
        "Content-Type": "application/json"
    },
    json={
        "question": "Qual é a taxa de IVA em Portugal?"
    }
)

data = response.json()
print(data["response"])
```

### Example (JavaScript)

```javascript
const response = await fetch("https://af.fiz.co/api/mcp/query", {
  method: "POST",
  headers: {
    "Authorization": "Bearer fiz_mcp_external_xxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    question: "What is the VAT rate in Portugal?"
  })
});

const data = await response.json();
console.log(data.response);
```

---

## 🌐 Public Hosting (Production)

### Option 1: Vercel (Recommended for Next.js)

#### 1. Prepare for deployment

```bash
# From project root
npm run build
```

#### 2. Deploy to Vercel

```bash
npx vercel
```

Follow prompts:
- Set up project
- Configure environment variables:
  - `DATABASE_URL` (Neon Postgres)
  - `OPENAI_API_KEY`
  - All specialist vector store IDs
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (your production domain)

#### 3. Update MCP server config

```json
{
  "mcpServers": {
    "fiz-taxbot": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "FIZ_API_KEY": "fiz_mcp_external_xxxxx",
        "FIZ_API_URL": "https://your-app.vercel.app"
      }
    }
  }
}
```

### Option 2: Docker + Any Cloud

#### 1. Build Docker image

```bash
# From project root
docker build -t fiz-taxbot .
```

#### 2. Run container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e OPENAI_API_KEY="your_key" \
  fiz-taxbot
```

#### 3. Deploy to cloud

- AWS ECS
- Google Cloud Run
- DigitalOcean App Platform
- Railway
- Render

---

## 🔑 API Key Tiers

### Internal Tier (`mcp_fiz_internal`)
- ✅ Unlimited requests
- ✅ Latest prompts (bleeding edge)
- ✅ @fiz.co developers only

### External Tier (`mcp_external`)
- 📊 1000 requests/month
- 📚 Published prompts (stable)
- 🌍 External developers

---

## 🧪 Testing

### Test REST API (Production)

```bash
curl -X POST https://af.fiz.co/api/mcp/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual é a taxa de IVA em Portugal?"
  }'
```

### Test MCP in Claude Desktop

1. Open Claude Desktop
2. Start new conversation
3. Click tool icon (should show "fiz-taxbot")
4. Select "ask_portuguese_tax_question"
5. Enter your question in any language (PT/RU/EN)

### Test Local Development

```bash
# Start Next.js server
npm run dev

# Test API
curl -X POST http://localhost:3000/api/mcp/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual é a taxa de IVA em Portugal?"
  }'
```

---

## 📚 Documentation

### Supported Languages
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇬🇧 English

### Tax Specialists
- **CIVA**: IVA (VAT) - rates, exemptions, invoicing
- **CIRS**: IRS (Personal Income Tax)
- **CIRC**: IRC (Corporate Tax)
- **SEGSOC**: Social Security
- **RITI**: Intra-community transactions
- **RGIT**: Fines and penalties
- **CIS**: Stamp Duty

### Auto-Continuation
- Messages within 60s: Always continue conversation
- Messages within 5min + same specialist: Continue
- Messages after 30min: New conversation

Configuration: `mcp-config.json`

---

## 🛠️ Troubleshooting

### "Server not found" in Claude Desktop

1. Check file path is absolute
2. Verify Node.js is installed: `node --version`
3. Check server logs in Claude Desktop console

### "Unauthorized" error

1. Verify API key is correct
2. Check key is active in admin panel
3. Ensure API_URL is correct

### "Connection refused"

1. Ensure Next.js server is running: `npm run dev`
2. Check port 3000 is not blocked
3. Verify FIZ_API_URL matches server address

---

## 📝 License

MIT - FIZ © 2025
