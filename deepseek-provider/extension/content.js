// Content script - runs in the controlled tab
console.log('🔧 DeepSeek Provider Content Script loaded');

let myRoomId = null;

// Listen for commands from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📥 Content script received:', request.type, request);
  
  // Handle initialization
  if (request.type === 'INIT') {
    myRoomId = request.roomId;
    console.log(`✅ Joined room: ${myRoomId}`);
    return true;
  }
  
  // Only process commands for our room
  if (request.roomId && request.roomId !== myRoomId) {
    console.log('⚠️ Ignoring command for different room:', request.roomId);
    return true;
  }
  
  switch (request.type) {
    case 'WAIT_AND_SELECT':
      waitForElement(request.payload.selector, request.payload.timeout)
        .then(el => {
          console.log('✅ Element found:', el.tagName);
          chrome.runtime.sendMessage({ 
            type: 'TASK_COMPLETE', 
            roomId: myRoomId,
            payload: { step: 'selected', element: el.tagName }
          });
        })
        .catch(err => {
          console.error('❌ Wait error:', err);
          chrome.runtime.sendMessage({ 
            type: 'ERROR', 
            roomId: myRoomId,
            payload: { message: err.message }
          });
        });
      break;
      
    case 'TYPE':
      typeText(request.payload.selector, request.payload.text);
      break;
      
    case 'CLICK':
      clickElement(request.payload.selector);
      break;
      
    case 'SCRAPE':
      scrapeContent(request.payload.selector);
      break;
      
    case 'IDLE':
      console.log('😴 Going idle...');
      break;
  }
  
  return true; // Keep message channel open for async response
});

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Timeout waiting for element: ' + selector));
    }, timeout);
  });
}

function scrapeContent(selector) {
  try {
    const elements = document.querySelectorAll(selector || 'body');
    let content = '';
    
    elements.forEach(el => {
      content += el.innerText + '\n';
    });
    
    console.log('📄 Scraped content length:', content.length);
    
    chrome.runtime.sendMessage({
      type: 'TASK_COMPLETE',
      roomId: myRoomId,
      payload: { 
        step: 'scraped', 
        content: content.substring(0, 2000),
        fullLength: content.length
      }
    });
  } catch (error) {
    console.error('Scrape error:', error);
    chrome.runtime.sendMessage({ 
      type: 'ERROR', 
      roomId: myRoomId,
      payload: { message: error.message }
    });
  }
}

function clickElement(selector) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      console.log('🖱️ Clicked:', selector);
      
      setTimeout(() => {
        chrome.runtime.sendMessage({ 
          type: 'TASK_COMPLETE',
          roomId: myRoomId,
          payload: { step: 'clicked', selector }
        });
      }, 1000);
    } else {
      chrome.runtime.sendMessage({ 
        type: 'ERROR',
        roomId: myRoomId,
        payload: { message: `Element not found: ${selector}` }
      });
    }
  } catch (error) {
    console.error('Click error:', error);
    chrome.runtime.sendMessage({ 
      type: 'ERROR',
      roomId: myRoomId,
      payload: { message: error.message }
    });
  }
}

function typeText(selector, text) {
  try {
    const element = document.querySelector(selector);
    if (element) {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('⌨️ Typed:', text, 'into', selector);
      
      chrome.runtime.sendMessage({ 
        type: 'TASK_COMPLETE',
        roomId: myRoomId,
        payload: { step: 'typed', selector, text }
      });
    } else {
      chrome.runtime.sendMessage({ 
        type: 'ERROR',
        roomId: myRoomId,
        payload: { message: `Element not found: ${selector}` }
      });
    }
  } catch (error) {
    console.error('Type error:', error);
    chrome.runtime.sendMessage({ 
      type: 'ERROR',
      roomId: myRoomId,
      payload: { message: error.message }
    });
  }
}

// Notify when page loads
window.addEventListener('load', () => {
  console.log('🌐 Page loaded:', window.location.href);
  
  // Wait a bit for dynamic content
  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: 'PAGE_LOADED',
      roomId: myRoomId,
      payload: { url: window.location.href }
    });
  }, 1000);
});
