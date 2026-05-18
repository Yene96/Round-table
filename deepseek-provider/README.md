# DeepSeek Provider - Lightweight Browser Automation

A distributed browser automation system where the heavy lifting happens in your browser, not on the server.

## Architecture

```
┌─────────────────┐      WebSocket      ┌──────────────────┐
│   Router Server │ ◄─────────────────► │  Browser Extension│
│   (Node.js)     │   JSON Commands     │  (Provider Agent) │
│   Port 8080     │                     │  - Background JS  │
└─────────────────┘                     │  - Content Script │
                                        │  - Controlled Tab │
                                        └──────────────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │   DeepSeek.com   │
                                        │   (Real Browser) │
                                        └──────────────────┘
```

## Quick Start

### 1. Install Dependencies
```bash
cd deepseek-provider
npm install
```

### 2. Start the Router
```bash
npm start
```

You should see:
```
🚀 DeepSeek Router started on ws://localhost:8080
```

### 3. Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `/workspace/deepseek-provider/extension` folder
5. Click the extension icon to activate

### 4. Watch It Work

The router will automatically:
- ✅ Connect to the provider extension
- 🗂️ Create a controlled tab
- 🌐 Navigate to https://chat.deepseek.com
- 📄 Scrape the page content

Check the router terminal for logs!

## How It Works

### Router (`router/server.js`)
- WebSocket server on port 8080
- Sends commands to connected providers
- Receives results and logs them

### Extension Components

**background.js**
- Maintains WebSocket connection to router
- Creates and manages controlled tab
- Routes commands between router and content script

**content.js**
- Runs inside the target webpage
- Executes DOM operations (click, type, scrape)
- Uses native browser APIs (no Playwright!)

## Message Protocol

### Commands (Router → Provider)
```json
{ "type": "navigate", "url": "https://example.com" }
{ "type": "scrape", "selector": "body" }
{ "type": "click", "selector": "#button" }
{ "type": "type", "selector": "input", "text": "hello" }
```

### Responses (Provider → Router)
```json
{ "type": "ready", "tabId": 123 }
{ "type": "navigation_complete", "url": "..." }
{ "type": "scrape_result", "content": "..." }
```

## Why This is Lightweight

✅ **No backend browsers** - Runs in user's browser  
✅ **Tiny bundle** - Extension is < 10KB total  
✅ **No Playwright** - Uses native browser APIs  
✅ **Distributed** - Scale by adding more provider extensions  
✅ **Stealthy** - Real browser, real user agent  

## Next Steps

- Add authentication for providers
- Support multiple concurrent providers
- Add screenshot capability
- Implement retry logic
- Add command queue for complex workflows
