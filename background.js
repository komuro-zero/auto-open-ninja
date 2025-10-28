const TARGET_URL = "https://stg.o-ninja.com";
const meetingPatterns = [
  /https:\/\/meet\.google\.com\/[a-z-]+/,
  /https:\/\/.*\.zoom\.us\/j\//,
  /https:\/\/teams\.microsoft\.com\/.*/,
];

// Map to store previous URLs per tab
const previousUrls = new Map();

// Set to track configured tabs
const configuredTabs = new Set();

// Helper to check if an O-Ninja window exists
async function findONinjaWindow() {
  const windows = await chrome.windows.getAll({ populate: true });
  return windows.find(win => win.tabs.some(tab => tab.url === TARGET_URL));
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log('Tab updated:', tabId, 'url:', tab.url, 'status:', changeInfo.status);
  if (changeInfo.status !== "complete" || !tab.url) return;

  // Get previous URL for this tab
  const prevUrl = previousUrls.get(tabId) || '';
  previousUrls.set(tabId, tab.url);

  // Check if main toggle is enabled
  const { mainToggle, windowTabMode } = await chrome.storage.sync.get(['mainToggle', 'windowTabMode']);
  if (!mainToggle) return;

  // Only open if navigating TO a meeting URL from a non-meeting URL
  const isMeetingUrl = meetingPatterns.some(pattern => pattern.test(tab.url));
  const wasMeetingUrl = meetingPatterns.some(pattern => pattern.test(prevUrl));

  if (!isMeetingUrl || wasMeetingUrl) {
    // Check if it's the O-Ninja page loading
    if (tab.url === TARGET_URL && !configuredTabs.has(tabId)) {
      console.log('O-Ninja page loaded, tabId:', tabId, 'url:', tab.url);
      configuredTabs.add(tabId);
      const options = await chrome.storage.sync.get(['engineMode', 'speakerRecognition', 'allAudioInput']);
      console.log('Sending setOptions to tab', tabId, 'options:', options);
      chrome.tabs.sendMessage(tabId, {action: 'setOptions', options}).then(() => {
        console.log('Message sent successfully');
      }).catch(err => {
        console.error('Failed to send message:', err);
      });
    }
    return;
  }

  const existingWindow = await findONinjaWindow();

  if (existingWindow) {
    // Focus existing window
    await chrome.windows.update(existingWindow.id, { focused: true });
    const ninjaTab = existingWindow.tabs.find(t => t.url === TARGET_URL);
    if (ninjaTab) {
      await chrome.tabs.update(ninjaTab.id, { active: true });
      // Notify user
      chrome.notifications.create({
        type: 'basic',
        title: 'O-Ninja Already Open',
        message: 'Switched to existing O-Ninja tab.'
      });
    }
  } else {
    // Open based on mode
    const options = await chrome.storage.sync.get(['engineMode', 'speakerRecognition', 'allAudioInput']);
    if (windowTabMode === 'tab') {
      // Open in new tab
      const newTab = await chrome.tabs.create({ url: TARGET_URL });
      // Send message after a delay
      setTimeout(() => {
        chrome.tabs.sendMessage(newTab.id, {action: 'setOptions', options}).then(() => {
          console.log('Message sent to new tab');
        }).catch(err => console.error('Failed to send to new tab:', err));
      }, 1000);
    } else {
      // Open new popup window
      const newWindow = await chrome.windows.create({
        url: TARGET_URL,
        type: "popup",
        width: 1000,
        height: 700
      });
      // Send message after a delay
      setTimeout(() => {
        chrome.windows.get(newWindow.id, {populate: true}, (win) => {
          if (win && win.tabs[0]) {
            chrome.tabs.sendMessage(win.tabs[0].id, {action: 'setOptions', options}).then(() => {
              console.log('Message sent to popup tab');
            }).catch(err => console.error('Failed to send to popup tab:', err));
          }
        });
      }, 1000);
    }
  }
});
