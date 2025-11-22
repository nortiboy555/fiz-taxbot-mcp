# FIZ AI TaxBot - MCP Server

Model Context Protocol server for Portuguese Tax Assistant.

**Ask in ANY language 🌍 — Get answers in YOUR language!**

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
git clone https://github.com/nortiboy555/fiz-taxbot-mcp.git
cd fiz-taxbot-mcp
npm install
```

Or download as ZIP and extract.

### 2. Get your API key

Contact FIZ team to receive your API key.

### 3. Configure Claude Desktop or Claude Code

#### For Claude Desktop:

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

#### For Claude Code:

Create `.mcp.json` file in your project root:

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

### 4. Restart Claude Desktop/Code

The MCP server will appear as available tool `ask_portuguese_tax_question`.

### 5. How to Use

In Claude Desktop/Code, use the tool directly:

```
Ask Portuguese tax question: "Какие ставки НДС в Португалии?"
```

Or in conversation:

```
User: What are the VAT rates in Portugal?
Claude: [automatically uses ask_portuguese_tax_question tool]
```

**Supported languages:** ANY language! Ask in your language (English, Portuguese, Russian, Spanish, French, German, Chinese, etc.) and get answers in the same language.

**Tax specialists:**
- **CIVA**: IVA/VAT (rates, exemptions, invoicing)
- **CIRS**: IRS (Personal Income Tax)
- **CIRC**: IRC (Corporate Tax)
- **SEGSOC**: Social Security contributions
- **RITI**: Intra-community transactions
- **RGIT**: Tax fines and penalties
- **CIS**: Stamp Duty

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
  "specialist": "civa",     // Optional: force specific specialist
  "channel": "whatsapp",    // Optional: "web" | "whatsapp" | "telegram" | null (default: whatsapp)
  "userId": "user123"       // Optional: external user ID for multi-user scenarios
}
```

**Parameters:**
- `question` (required): Your tax question in any language
- `specialist` (optional): Force specific specialist: `civa`, `cirs`, `circ`, `segsoc`, `riti`, `rgit`, `cis`
- `channel` (optional): Response format control
  - `"web"`: Full response inline (no summary/PDF processing)
  - `"whatsapp"` or `"telegram"`: Long responses → summary + PDF (default)
  - `null` or omitted: Same as `whatsapp` (summary + PDF for long responses)
- `userId` (optional): External user identifier for multi-user bots (e.g., WhatsApp/Telegram)

### Response Format

The API returns a minimal response optimized for messenger channels:

**Short responses** (≤400 chars):
```json
{
  "response": "Complete answer in your language (plain text, no markdown)"
}
```

**Long responses** (>400 chars):
```json
{
  "response": "AI-generated summary with key points (≤400 chars, plain text)",
  "attachment": {
    "url": "https://blob.vercel-storage.com/pdf-abc123.pdf"
  }
}
```

**Clarification responses** (when specialist unclear):
```json
{
  "response": "I need clarification. Which tax area does your question relate to?",
  "requiresClarification": true,
  "clarificationOptions": [
    {
      "id": "civa",
      "name": "IVA (VAT)",
      "description": "Value Added Tax questions"
    },
    {
      "id": "cirs",
      "name": "IRS",
      "description": "Personal Income Tax questions"
    }
  ]
}
```

**Notes:**
- Responses are in **plain text** (markdown converted for WhatsApp/Telegram)
- **Summary** highlights key points from the full answer
- **PDF** contains complete detailed answer with legal citations and formatting
- PDF auto-expires after **7 days** from Vercel Blob storage
- **No metadata fields**: API returns ONLY `response` and optionally `attachment` (no specialist, conversationId, references, etc.)

**Response Processing:**
- **Threshold**: 400 characters (configurable via database settings)
- **Short responses** (≤400 chars): Full answer returned inline
- **Long responses** (>400 chars): AI-generated summary + PDF with full details
- **PDF TTL**: 7 days (auto-deleted from Vercel Blob storage)
- **Channels**: Processing applies to `whatsapp`, `telegram`, and `null` (default)
- **Web channel**: Set `"channel": "web"` to skip processing and get full response

### Examples

**Works with ANY language!** Below are examples in Russian, Portuguese, and English, but you can use Spanish, French, German, Chinese, Arabic, or any other language.

#### Example (curl - Russian)

```bash
curl -X POST https://af.fiz.co/api/mcp/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Какая ставка НДС в Португалии?"
  }'
```

#### Example (Python - Portuguese)

```python
import requests

response = requests.post(
    "https://af.fiz.co/api/mcp/query",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "question": "Qual é a taxa de IVA em Portugal?"
    }
)

data = response.json()
print(data["response"])
```

#### Example (JavaScript - English)

```javascript
const response = await fetch("https://af.fiz.co/api/mcp/query", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
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

### Test MCP in Claude Desktop/Code

1. Open Claude Desktop or Claude Code
2. Start new conversation
3. Ask your tax question in any language
4. Claude will automatically use the `ask_portuguese_tax_question` tool
5. You'll receive an answer in the same language

---

## 📚 Documentation

### Supported Languages
- 🌍 **ANY language!** Ask questions in your native language
- 💬 Automatic language detection
- 🔄 Responses in the same language you used
- ✅ Tested with: Portuguese, Russian, English, Spanish, French, German, Chinese, and more

### Tax Specialists
- **CIVA**: IVA (VAT) - rates, exemptions, invoicing
- **CIRS**: IRS (Personal Income Tax)
- **CIRC**: IRC (Corporate Tax)
- **SEGSOC**: Social Security
- **RITI**: Intra-community transactions
- **RGIT**: Fines and penalties
- **CIS**: Stamp Duty

### Features
- 🔄 **Conversation continuity**: Automatically continues your tax conversation
- 🎯 **Smart routing**: Routes questions to the right tax specialist
- 📚 **Official sources**: All answers based on Portuguese tax codes
- 🌐 **Multi-language**: Ask and receive answers in any language
- 📄 **Smart responses**: Short answers inline, long answers as AI summary + detailed PDF
- ☁️ **PDF storage**: Secure temporary storage on Vercel Blob (7 days TTL)

---

## 🛠️ Troubleshooting

### "Server not found" in Claude Desktop/Code

1. Verify file path is absolute (not relative)
2. Check Node.js is installed: `node --version`
3. Restart Claude Desktop/Code after config changes

### "Unauthorized" error

1. Verify your API key is correct
2. Contact FIZ team if you don't have an API key
3. Ensure `FIZ_API_URL` is set to `https://af.fiz.co`

### Tool not appearing

1. Check `.mcp.json` syntax is valid JSON
2. Verify `command` and `args` paths are correct
3. Restart Claude Desktop/Code
4. Check Claude's MCP settings/logs for errors

---

## 📝 License

MIT - FIZ © 2025
