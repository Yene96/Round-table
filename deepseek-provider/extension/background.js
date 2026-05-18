let ws = null;
let controlledTabId = null;

// Connect to router
function connectToRouter() {
  ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    console.log('✅ Connected to DeepSeek Router');
    createControlledTab();
  };
  
  ws.onmessage = (event) => {
    const command = JSON.parse(event.data);
    console.log('📥 Command received:', command.type);
    handleCommand(command);
  };
  
  ws.onclose = () => {
    console.log('❌ Disconnected from router');
    setTimeout(connectToRouter, 3000); // Reconnect
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

async function createControlledTab() {
  try {
    const tab = await chrome.tabs.create({ url: 'about:blank' });
    controlledTabId = tab.id;
    console.log('🗂️ Created controlled tab:', controlledTabId);
    
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: controlledTabId },
      files: ['content.js']
    });
    
    // Notify router we're ready
    sendMessage({ type: 'ready', tabId: controlledTabId });
  } catch (error) {
    console.error('Error creating tab:', error);
  }
}

function handleCommand(command) {
  if (!controlledTabId) return;
  
  switch (command.type) {
    case 'navigate':
      chrome.tabs.update(controlledTabId, { url: command.url }, (tab) => {
        console.log('🌐 Navigating to:', command.url);
      });
      break;
      
    case 'scrape':
      chrome.tabs.sendMessage(controlledTabId, {
        type: 'scrape',
        selector: command.selector
      });
      break;
      
    case 'click':
      chrome.tabs.sendMessage(controlledTabId, {
        type: 'click',
        selector: command.selector
      });
      break;
      
    case 'type':
      chrome.tabs.sendMessage(controlledTabId, {
        type: 'type',
        selector: command.selector,
        text: command.text
      });
      break;
  }
}

function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.tab?.id === controlledTabId) {
    console.log('📨 From content script:', request.type);
    sendMessage(request);
  }
});

// Start connection when extension loads
connectToRouter();
