// Content script - runs in the controlled tab
console.log('🔧 DeepSeek Provider Content Script loaded');

// Listen for commands from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📥 Content script received:', request.type);
  
  switch (request.type) {
    case 'scrape':
      scrapeContent(request.selector);
      break;
      
    case 'click':
      clickElement(request.selector);
      break;
      
    case 'type':
      typeText(request.selector, request.text);
      break;
  }
  
  return true; // Keep message channel open for async response
});

function scrapeContent(selector) {
  try {
    const elements = document.querySelectorAll(selector || 'body');
    let content = '';
    
    elements.forEach(el => {
      content += el.innerText + '\n';
    });
    
    console.log('📄 Scraped content length:', content.length);
    
    chrome.runtime.sendMessage({
      type: 'scrape_result',
      content: content.substring(0, 1000), // Send first 1000 chars
      fullLength: content.length
    });
  } catch (error) {
    console.error('Scrape error:', error);
    chrome.runtime.sendMessage({ type: 'error', message: error.message });
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
          type: 'click_complete', 
          selector 
        });
      }, 500);
    } else {
      chrome.runtime.sendMessage({ 
        type: 'error', 
        message: `Element not found: ${selector}` 
      });
    }
  } catch (error) {
    console.error('Click error:', error);
    chrome.runtime.sendMessage({ type: 'error', message: error.message });
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
        type: 'type_complete', 
        selector,
        text 
      });
    } else {
      chrome.runtime.sendMessage({ 
        type: 'error', 
        message: `Element not found: ${selector}` 
      });
    }
  } catch (error) {
    console.error('Type error:', error);
    chrome.runtime.sendMessage({ type: 'error', message: error.message });
  }
}

// Notify when page loads
window.addEventListener('load', () => {
  console.log('🌐 Page loaded:', window.location.href);
  
  // Wait a bit for dynamic content
  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: 'navigation_complete',
      url: window.location.href
    });
  }, 1000);
});
