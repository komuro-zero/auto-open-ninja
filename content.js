// Listen for messages from background
console.log('Content script loaded on', window.location.href);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  if (message.action === 'setOptions') {
    const options = message.options;
    console.log('Options:', options);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setOptions(options));
    } else {
      setOptions(options);
    }

    function setOptions(options) {

      // Wait for page to be fully loaded
      if (document.readyState !== 'complete') {
        console.log('Page not fully loaded, waiting...');
        window.addEventListener('load', () => setOptions(options));
        return;
      }

      // Set voice engine select
      const hiddenInput = document.querySelector('#voice-engine-select + input.MuiSelect-nativeInput');
      console.log('Hidden input:', hiddenInput, 'current value:', hiddenInput?.value);
      if (hiddenInput) {
        const targetValue = options.engineMode === 'specialized' ? 'amivoice' : 'azure';
        hiddenInput.value = targetValue;
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('Set hidden input to:', targetValue);
      }

      // Set speaker recognition toggle
      const speakerInput = document.getElementById('speakerRecognitionToggle');
      console.log('Speaker input:', speakerInput);
      if (speakerInput) {
        const switchBase = speakerInput.closest('.MuiSwitch-switchBase');
        console.log('Speaker switch base:', switchBase, 'classes:', switchBase?.className);
        if (switchBase) {
          const isChecked = switchBase.classList.contains('Mui-checked');
          console.log('Speaker is checked:', isChecked, 'desired:', options.speakerRecognition);
          if (isChecked !== options.speakerRecognition) {
            console.log('Clicking speaker switch');
            switchBase.click();
          }
        }
      }

      // Set system audio toggle
      const systemInput = document.getElementById('systemAudioToggle');
      console.log('System input:', systemInput);
      if (systemInput) {
        const switchBase = systemInput.closest('.MuiSwitch-switchBase');
        console.log('System switch base:', switchBase, 'classes:', switchBase?.className);
        if (switchBase) {
          const isChecked = switchBase.classList.contains('Mui-checked');
          console.log('System is checked:', isChecked, 'desired:', options.allAudioInput);
          if (isChecked !== options.allAudioInput) {
            console.log('Clicking system switch');
            switchBase.click();
          }
        }
      }

      // Click the record button
      setTimeout(() => {
        const buttonId = options.allAudioInput ? 'system-audio-record-Button' : 'record-Button';
        const recordButton = document.getElementById(buttonId);
        console.log('Record button id:', buttonId, 'element:', recordButton, 'disabled:', recordButton?.disabled);
        if (recordButton) {
          console.log('Clicking record button');
          recordButton.click();
        }
      }, 1500); // wait for settings to apply
    }
  }
});