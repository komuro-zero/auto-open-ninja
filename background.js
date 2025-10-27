const TARGET_URL = "https://stg.o-ninja.com";
const meetingPatterns = [
  /https:\/\/meet\.google\.com\/[a-z-]+/,
  /https:\/\/.*\.zoom\.us\/j\//,
  /https:\/\/teams\.microsoft\.com\/.*/,
];

// Helper to check if an O-Ninja window exists
async function findONinjaWindow() {
  const windows = await chrome.windows.getAll({ populate: true });
  return windows.find(win => win.tabs.some(tab => tab.url === TARGET_URL));
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  // Check if main toggle is enabled
  const { mainToggle, windowTabMode } = await chrome.storage.sync.get(['mainToggle', 'windowTabMode']);
  if (!mainToggle) return;

  for (const pattern of meetingPatterns) {
    if (pattern.test(tab.url)) {
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
        if (windowTabMode === 'tab') {
          // Open in new tab
          await chrome.tabs.create({ url: TARGET_URL });
        } else {
          // Open new popup window
          chrome.windows.create({
            url: TARGET_URL,
            type: "popup",
            width: 1000,
            height: 700
          });
        }
      }

      break;
    }
  }
});
