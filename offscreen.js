chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "PLAY_ALARM") {
    const audio = document.getElementById("player");
    audio.src = chrome.runtime.getURL("gong-sound-effect.mp3");
    audio.play();
  }
});
