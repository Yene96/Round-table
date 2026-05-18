const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('🚀 DeepSeek Router started on ws://localhost:8080');

let provider = null;

wss.on('connection', (ws) => {
  console.log('✅ Provider connected!');
  
  provider = ws;
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('📩 Received from provider:', data);
    
    // Handle responses from provider
    if (data.type === 'ready') {
      console.log('🟢 Provider ready for commands');
      // Send first command: navigate to DeepSeek
      sendCommand({
        type: 'navigate',
        url: 'https://chat.deepseek.com'
      });
    }
    
    if (data.type === 'navigation_complete') {
      console.log('🌐 Navigation complete');
      // Example: wait a bit then take screenshot or scrape
      setTimeout(() => {
        sendCommand({
          type: 'scrape',
          selector: 'body'
        });
      }, 2000);
    }
    
    if (data.type === 'scrape_result') {
      console.log('📄 Scraped content length:', data.content?.length || 0);
      console.log('✅ First provider successfully working!');
    }
  });
  
  ws.on('close', () => {
    console.log('❌ Provider disconnected');
    provider = null;
  });
});

function sendCommand(command) {
  if (provider && provider.readyState === WebSocket.OPEN) {
    console.log('📤 Sending command:', command.type);
    provider.send(JSON.stringify(command));
  } else {
    console.log('⚠️ No provider available');
  }
}

// Keep server running
setInterval(() => {}, 1000);
