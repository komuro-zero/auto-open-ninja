// Load saved states
document.addEventListener('DOMContentLoaded', async () => {
  const storage = await chrome.storage.sync.get([
    'mainToggle',
    'windowTabMode',
    'engineMode',
    'speakerRecognition',
    'allAudioInput'
  ]);

  const mainBtn = document.getElementById('main-toggle-btn');
  mainBtn.textContent = storage.mainToggle ? 'オン' : 'オフ';
  mainBtn.classList.toggle('off', !storage.mainToggle);

  document.getElementById('window-tab-select').value = storage.windowTabMode || 'window';
  document.getElementById('engine-select').value = storage.engineMode || 'specialized';
  document.getElementById('speaker-recognition').checked = storage.speakerRecognition || false;
  document.getElementById('all-audio-input').checked = storage.allAudioInput || false;
});

// Main toggle button
document.getElementById('main-toggle-btn').addEventListener('click', (e) => {
  const isOn = e.target.textContent === 'オン';
  const newState = !isOn;
  e.target.textContent = newState ? 'オン' : 'オフ';
  e.target.classList.toggle('off', !newState);
  chrome.storage.sync.set({ mainToggle: newState });
});

// Selects
document.getElementById('window-tab-select').addEventListener('change', (e) => {
  chrome.storage.sync.set({ windowTabMode: e.target.value });
});

document.getElementById('engine-select').addEventListener('change', (e) => {
  chrome.storage.sync.set({ engineMode: e.target.value });
});

// Other toggles
document.getElementById('speaker-recognition').addEventListener('change', (e) => {
  chrome.storage.sync.set({ speakerRecognition: e.target.checked });
});

document.getElementById('all-audio-input').addEventListener('change', (e) => {
  chrome.storage.sync.set({ allAudioInput: e.target.checked });
});