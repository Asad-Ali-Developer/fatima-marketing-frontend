export function playReminderBeep(notificationAudio: HTMLAudioElement | null) {
  try {
    // Create audio element if it doesn't exist
    if (!notificationAudio) {
      notificationAudio = new Audio("/assets/Audios/notification.mp3");
      notificationAudio.preload = "auto";

      // Handle audio loading errors
      notificationAudio.onerror = () => {
        console.warn("Failed to load notification sound");
      };
    }

    // Reset to start and play
    notificationAudio.currentTime = 0;

    // Attempt to play (may fail if user hasn't interacted with page)
    const playPromise = notificationAudio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Autoplay was prevented - this is normal before user interaction
        console.warn("Notification sound autoplay prevented:", error);
      });
    }
  } catch (e) {
    console.warn("Unable to play notification sound", e);
  }
}
