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
