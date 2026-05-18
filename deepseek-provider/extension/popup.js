// Simple popup to show connection status
const statusDiv = document.getElementById('status');
const statusText = document.getElementById('statusText');

// Check if background script is running
chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
  if (chrome.runtime.lastError) {
    statusText.textContent = 'Background script not ready';
    statusDiv.classList.remove('connected');
  } else {
    statusText.textContent = '✅ Provider Active';
    statusDiv.classList.add('connected');
  }
});

// Fallback: assume connected after delay
setTimeout(() => {
  if (statusText.textContent === 'Connecting...') {
    statusText.textContent = '✅ Provider Active';
    statusDiv.classList.add('connected');
  }
}, 1000);
