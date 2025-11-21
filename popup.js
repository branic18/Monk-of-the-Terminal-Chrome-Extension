console.log("This is the js popup!")

// Get the button element
// const playButton = document.getElementById('play');

// // Add a click event listener to the button
// playButton.addEventListener('click', function() {
//   alert('Play button clicked!');
// });

// // Example with a named function
// // function handleButtonClick() {
// //   console.log('Another click detected!');
// // }

// // Get the button element
// const skipButton = document.getElementById('skip');

// // Add a click event listener to the button
// skipButton.addEventListener('click', function() {
//   alert('Skip button clicked!');
// });




// document.getElementById('start-work').addEventListener('click', () => {
//   alert('Play button clicked!');
//   chrome.runtime.sendMessage({ type: 'start', sessionType: 'work' });
// });

// document.getElementById('start-break').addEventListener('click', () => {
//   alert('Break button clicked!');
//   chrome.runtime.sendMessage({ type: 'start', sessionType: 'break' });
// });

// document.getElementById('skip').addEventListener('click', () => {
//   alert('Play button clicked!');
//   chrome.runtime.sendMessage({ type: 'skip' });
// });


document.getElementById('play').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'START_SESSION', sessionType: 'work' });
});

document.getElementById('skip').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'SKIP' });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SESSION_SKIPPED') {
    alert(`${msg.currentSession.toUpperCase()} session skipped!`);
  }
});

// Optional: listen for ticks to update UI

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TICK') {
    document.getElementById('timer-display').textContent = formatTime(msg.remainingSeconds);
  }
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

// Load and display stats from storage when popup opens
function loadStatsFromStorage() {
  chrome.storage.local.get(['Stillness', 'Discipline', 'Order', 'Switches', 'Tabs', 'Noise', 'Sessions'], function(data) {
    console.log('data retrieved:', data);
    console.log('stillness retrieved:', data.Stillness);

    if (data.Stillness !== undefined && data.Stillness !== null) {
      const element = document.getElementById('stillnessStat');
      if (element) element.textContent = data.Stillness;
    } 

    if (data.Discipline !== undefined && data.Discipline !== null) {
      const element = document.getElementById('disciplineStat');
      if (element) element.textContent = data.Discipline;
    }

    if (data.Order !== undefined && data.Order !== null) {
      const element = document.getElementById('orderStat');
      if (element) element.textContent = data.Order;
    }

    if (data.Switches !== undefined && data.Switches !== null) {
      // Note: switchesStat uses class, not id in HTML
      const elements = document.getElementsByClassName('switchesStat');
      if (elements.length > 0) elements[0].textContent = data.Switches;
    }

    if (data.Tabs !== undefined && data.Tabs !== null) {
      // Note: tabCountStat uses class, not id in HTML
      const elements = document.getElementsByClassName('tabCountStat');
      if (elements.length > 0) elements[0].textContent = data.Tabs;
    }

    if (data.Noise !== undefined && data.Noise !== null) {
      // Note: noiseCategory uses class, not id in HTML
      const elements = document.getElementsByClassName('noiseCategory');
      if (elements.length > 0) elements[0].textContent = data.Noise;
    }
  });
}

// Load stats when popup opens
loadStatsFromStorage();

// Also listen for storage changes to update the UI in real-time
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    console.log('Storage changed, updating UI');
    loadStatsFromStorage();
  }
});

