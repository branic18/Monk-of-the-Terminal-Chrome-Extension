////////// PLAY BUTTON

// ---- FOCUS SESSION
// Create an alarm named "pomodoro" with a 25-minute delay.
// chrome.alarms.create("focus-session", {
//   delayInMinutes: 25.0
// });

// // Add a listener for when the alarm triggers.
// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === "focus-session") {
//     // Action to perform when the alarm fires, e.g., show a notification.
//     console.log("25-minute timer finished!");
//   }
// });

// ----- BREAK TIMER






////////// SKIP BUTTON













// Background script for Pomodoro Chrome extension
// Handles timer, badge, audio alerts, and messages from popup
console.log("🔥 Service Worker Loaded");

let timerInterval = null;
let previousTab = null;
let tabSwitchCount = 0;

// Initialize previousTab with current active tab when service worker starts
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  if (tabs && tabs.length > 0) {
    previousTab = tabs[0].id;
    console.log("Initialized previousTab with current active tab:", previousTab);
  }
});
let remainingSeconds = 0;
let isBreak = false;

// Default session lengths
const WORK_MINUTES = 5;
const BREAK_MINUTES = 1;

let stillnessStat = 0
let disciplineStat = 0
let orderStat = 0
let noiseCategory
let completePair = [] // Track work/break pairs across sessions
let lastWasBreakWithoutWork = false // Track if last session was a break without preceding work

// --- NOTIFICATION EVENT LISTENERS --- These listeners must NOT be inside any function. They need to live at global scope so the service worker can attach them.
// chrome.notifications.onShown.addListener((id) => {
//   console.log("NOTIFICATION SHOWN:", id);
// });

// chrome.notifications.onClosed.addListener((id) => {
//   console.log("NOTIFICATION CLOSED:", id);
// });

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  console.log("BUTTON CLICKED:", notifId, btnIdx);

  if (notifId === 'pomodoro_done') {
    if (btnIdx === 0) {
      console.log("Button → Take a Break");
      startBreak();
    }
    else if (btnIdx === 1) {
      console.log("Button → Continue");
      startSession();
    }
  }
});


function updateBadge() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  // Only show minutes on the badge (space is limited)
  chrome.action.setBadgeText({ text: String(minutes) });
  chrome.action.setBadgeBackgroundColor({ color: '#12766fff' }); // neon cyan
}

// Audio alert
function notifyPomodoroComplete() {
    console.log("🔥 Notification fired!");
  chrome.notifications.create('pomodoro_done', {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('Snowflake-icon.jpg'),
    title: 'Pomodoro Complete',
    message: 'Time is up! Take a break or continue?',
    silent: false, // play audio
    buttons: [
      { title: 'Take a Break' },
      { title: 'Continue' }
    ],
    requireInteraction: true
  });

//   const alarmAudio = new Audio(chrome.runtime.getURL("gong-sound-effect.mp3"));
//   alarmAudio.play().catch(err => console.error("AUDIO ERROR:", err));
}

async function playAlarmSound() {
  // ensure the offscreen doc exists
  if (!(await chrome.offscreen.hasDocument())) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play pomodoro alarm",
    });
  }

  chrome.runtime.sendMessage({ type: "PLAY_ALARM" });
}

// handle clicks to the notification here
chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  if (notifId === 'pomodoro_done') {
    if (btnIdx === 0) {
      startBreak();
    } else if (btnIdx === 1) {
      startSession();
    }
  }
});

// Listen for tab activation events
chrome.tabs.onActivated.addListener(function(activeInfo) {
  // activeInfo contains information about the newly active tab
  console.log("Tab activated:", activeInfo.tabId);

  if (previousTab !== null && activeInfo.tabId !== previousTab) {
    // Only count as a switch if we have a previous tab (not the first activation)
    console.log("Switched tab-- SWITCH")
    console.log(`Switched from ${previousTab} to ${activeInfo.tabId}`)
    tabSwitchCount++
    console.log(`Current switchCount: ${tabSwitchCount}`)
    console.log("----------------------------------------------------")
  } else if (previousTab === null) {
    // First tab activation - just initialize, don't count as switch
    console.log("First tab activation - initializing previousTab")
    console.log("----------------------------------------------------")
  } else {
    console.log("Stayed in the same tab-- NO SWITCH")
    console.log(`Same: ${previousTab} and ${activeInfo.tabId}`)
    console.log("----------------------------------------------------")
  }
  
  // Update previousTab after checking
  previousTab = activeInfo.tabId

  // Retrieve details of the newly active tab
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab) {
      console.log("Active tab URL:", tab.url);
      console.log("Active tab title:", tab.title);
      // Perform other actions based on the active tab
    }
  });
});

// Listen for tab update events (e.g., URL change within a tab)-- NOT SURE IF I NEED THIS CODE (DOWN)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // Check if the URL or status of the tab has changed
  if (changeInfo.url) {
    console.log("Tab URL updated for tab ID", tabId, ":", changeInfo.url);
  }
  if (changeInfo.status === "complete") {
    console.log("Tab finished loading for tab ID", tabId, ":", tab.url);
  }
  // Perform other actions based on tab updates
});
// -- NOT SURE IF I NEED THIS CODE (UP)

// let workPair
// let breakPair
// let completePair = workPair + breakPair



// Start a Pomodoro session
function startSession(minutes = WORK_MINUTES) {
  clearInterval(timerInterval);
  isBreak = false;
  remainingSeconds = minutes * 60;
  updateBadge();
  timerInterval = setInterval(tick, 1000);
}

// Start a break session
function startBreak(minutes = BREAK_MINUTES) {
  clearInterval(timerInterval);
  isBreak = true;
  remainingSeconds = minutes * 60;
  updateBadge();
  timerInterval = setInterval(tick, 1000);
}

// Timer tick every second
function tick() {
  if (remainingSeconds <= 0) {
    clearInterval(timerInterval);
    playAlarmSound();

    notifyPomodoroComplete();
    chrome.action.setBadgeText({ text: '' });
    chrome.runtime.sendMessage({ type: 'SESSION_COMPLETE', break: isBreak });

    // Capture tab switch count before resetting (needed for async callback)
    const currentTabSwitchCount = tabSwitchCount;
    
    // Handle Stillness stat based on tab switch count
    if (tabSwitchCount > 10) {
        console.log(`Pomodoro session is complete and tab switch count is MORE than 10: ${tabSwitchCount}, you lose Stillness by -1`)
        stillnessStat -= 1
        console.log(`Subtracted 1 from stillness: ${stillnessStat}`)
        console.log("========================================")
    } else {
        console.log(`Pomodoro session is complete and tab switch count is LESS than 10: ${tabSwitchCount}, you gain Stillness by +1`)
        stillnessStat += 1
        console.log(`Added 1 to stillness: ${stillnessStat}`)
        console.log("========================================")
    }
    
    // Reset tab switch count after checking
    tabSwitchCount = 0
    console.log(`Tab switch count reset to: ${tabSwitchCount}`)

    // Handle Discipline stat based on work/break pairs
    function completePairCheck() {
        // Count work and break pairs in the array
        const workCount = completePair.filter(item => item === 'workPair').length;
        const breakCount = completePair.filter(item => item === 'breakPair').length;
        
        if (workCount >= 1 && breakCount >= 1) {
            // Complete pair: work + break
            disciplineStat += 2
            console.log(`Added 2 to discipline: ${disciplineStat}`)
            console.log(`Pair completed: --${completePair}-- the user gains Discipline +2`)
            completePair = [] // Reset after break
            lastWasBreakWithoutWork = false // Reset flag
            console.log(`Complete pair reset to: --${completePair}`)
            console.log("========================================")
        } else if (workCount >= 1 && breakCount === 0) {
            // Only work session(s), no break
            disciplineStat += 1
            console.log("Only did focus session, did not do break")
            console.log(`Added 1 to discipline: ${disciplineStat}`)
            console.log(`Complete pair is INCOMPLETE: --${completePair}-- the user gains Discipline +1`)
            completePair = [] // Reset when new work starts or break happens
            console.log("========================================")
        } else if (workCount === 0 && breakCount > 1) {
            // Multiple breaks in a row (more than 1 break without work)
            disciplineStat -= 1
            console.log("Took more than 1 break in a row")
            console.log(`Subtracted 1 from discipline: ${disciplineStat}`)
            console.log(`Complete pair is INCOMPLETE: --${completePair}-- the user loses Discipline -1`)
            completePair = [] // Reset after break
            lastWasBreakWithoutWork = false // Reset flag
            console.log("========================================")
        } else if (workCount === 0 && breakCount === 1) {
            // Single break without preceding work
            // Check if this is a consecutive break (previous break also had no work)
            if (lastWasBreakWithoutWork) {
                // This is the second consecutive break
                disciplineStat -= 1
                console.log("Took more than 1 break in a row (consecutive breaks detected)")
                console.log(`Subtracted 1 from discipline: ${disciplineStat}`)
                console.log(`Complete pair is INCOMPLETE: --${completePair}-- the user loses Discipline -1`)
                lastWasBreakWithoutWork = false // Reset flag
            } else {
                // First break without work
                console.log("Break completed without preceding work session")
                lastWasBreakWithoutWork = true // Set flag for next break
            }
            completePair = [] // Reset after break
            console.log("========================================")
        } else {
            // Shouldn't reach here, but log for debugging
            console.log("ERROR- check the completePairCheck function")
            console.log(`This is what's in the pair: --${completePair}`)
            console.log(`Work count: ${workCount}, Break count: ${breakCount}`)
            console.log("========================================")
        }
    }

    if (isBreak == true) {
        // Break session completed
        completePair.push('breakPair')
        completePairCheck() // Check and reset after break
    } else {
        // Work session completed
        // Reset flag since work started (breaks are no longer consecutive)
        lastWasBreakWithoutWork = false
        
        // Check if there's an incomplete pair from before (work without break)
        if (completePair.length > 0 && completePair.includes('workPair') && !completePair.includes('breakPair')) {
            // Previous work session had no break - award +1 discipline
            disciplineStat += 1
            console.log("Previous work session had no break - awarding Discipline +1")
            console.log(`Added 1 to discipline: ${disciplineStat}`)
            console.log(`Complete pair was INCOMPLETE: --${completePair}--`)
            completePair = [] // Reset before starting new pair
            console.log("========================================")
        }
        // Add current work session to pair
        completePair.push('workPair')
        // Don't check yet - wait for break to complete the pair
    }

    // Handle Order stat and Noise category based on tab count (async)
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
        const tabCount = tabs.length;
        console.log(`You have ${tabCount} tabs open.`);
        
        if (tabCount <= 5) {
            console.log(`Pomodoro session is complete and tab count ${tabCount} is less than or equal to 5, you gain Order by +2 and Noise is Low`)
            orderStat += 2
            console.log(`Added 2 to order: ${orderStat}`)
            noiseCategory = "low"
            console.log(`Updated noise: ${noiseCategory}`)
            console.log("========================================")
        } else {
            console.log(`Pomodoro session is complete and tab count ${tabCount} is more than 5, you lose Order by -2 and Noise is High`)
            orderStat -= 2
            console.log(`Subtracted 2 from order: ${orderStat}`)
            noiseCategory = "high"
            console.log(`Updated noise: ${noiseCategory}`)
            console.log("========================================")
        }

        // Log all stats after async operation completes
        console.log(`Current stillness: ${stillnessStat}`)
        console.log(`Current discipline: ${disciplineStat}`)
        console.log(`Current order: ${orderStat}`)
        console.log(`Current switch count: ${currentTabSwitchCount}`)
        console.log(`Current tab count: ${tabCount}`)
        console.log(`Current noise category: ${noiseCategory}`)

        // chrome.storage.local.set({
        //   Stillness : stillnessStat,
        //   Discipline: disciplineStat,
        //   Order: orderStat,
        //   Switches: currentTabSwitchCount,
        //   Tabs: tabCount,
        //   Noise: noiseCategory
        // }).then(() => {
        //   console.log('Saved to local database');
        // });

        // ALSO STORE: FUTURE TWIN MESSAGES FROM INFERENCE, LLM PROMPT, TOTAL SESSION COUNT TO TRIGGER FUTURE TWIN
    });

    return;
  }

  remainingSeconds--;
  console.log(`This is the remainingSeconds: ${remainingSeconds}`)
  updateBadge();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // Badge: just minutes (fits)
  chrome.action.setBadgeText({ text: `${minutes}m` });
  chrome.action.setBadgeBackgroundColor({ color: '#11504cff' });

  // Broadcast to popup
  chrome.runtime.sendMessage({
    type: 'TICK',
    remainingSeconds
  });
}


// Listen to messages from popup/modal for user actions
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'START_SESSION':
        console.log("----User selected play button")
        if (msg.sessionType === 'work') {
            // completePairCheck() // check here before I start the next pair session
            startSession();
        } else if (msg.sessionType === 'break') {
            startBreak();
        }
        sendResponse({ status: 'session_started' });
        break;
    case 'START_BREAK':
      startBreak();
      sendResponse({ status: 'break_started' });
      break;
    case 'SKIP':
        console.log("----User selected skip button")
        clearInterval(timerInterval); // stop current session
        if (isBreak) {
            // If currently on break, skip to a new work session
            console.log("CURRENT BREAK WAS SKIPPED")
            startSession();
        } else {
            // If currently in work session, skip to a break
            startBreak();
        }
        sendResponse({ status: 'skipped', nextSession: isBreak ? 'work' : 'break' });
        break;
    case 'GET_REMAINING':
      sendResponse({ remainingSeconds, isBreak });
      break;
    default:
      console.warn('Unknown message type:', msg.type);
  }
});
