let ws = null;
let controlledTabId = null;
let providerId = null;

// Connect to router
function connectToRouter() {
  ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    console.log('✅ Connected to DeepSeek Router');
    // Generate a unique provider ID
    providerId = 'provider-' + Math.random().toString(36).substr(2, 9);
    createControlledTab();
  };
  
  ws.onmessage = (event) => {
    const command = JSON.parse(event.data);
    console.log('📥 Command received:', command.type, command);
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
    
    // Notify router we're ready with READY message
    sendMessage({ type: 'READY', providerId: providerId });
  } catch (error) {
    console.error('Error creating tab:', error);
  }
}

function handleCommand(command) {
  if (!controlledTabId) return;
  
  console.log('🎯 Handling command:', command.type, 'for room:', command.roomId);
  
  switch (command.type) {
    case 'NAVIGATE':
      chrome.tabs.update(controlledTabId, { url: command.payload.url }, (tab) => {
        console.log('🌐 Navigating to:', command.payload.url);
        // Wait for navigation then inject content script again
        setTimeout(async () => {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: controlledTabId },
              files: ['content.js']
            });
            // Initialize content script with roomId
            chrome.tabs.sendMessage(controlledTabId, { 
              type: 'INIT', 
              roomId: command.roomId 
            });
          } catch (e) {
            console.log('Re-injection skipped or failed:', e);
          }
        }, 1500);
      });
      break;
      
    case 'WAIT_AND_SELECT':
    case 'TYPE':
    case 'CLICK':
    case 'SCRAPE':
    case 'IDLE':
      // Forward to content script with roomId
      chrome.tabs.sendMessage(controlledTabId, {
        ...command,
        tabId: controlledTabId
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
  console.log('📨 From content script:', request.type, request);
  if (ws && ws.readyState === WebSocket.OPEN) {
    // Add roomId if present
    const msg = { ...request };
    if (request.roomId) {
      msg.roomId = request.roomId;
    }
    ws.send(JSON.stringify(msg));
  }
  return true;
});

// Start connection when extension loads
connectToRouter();
