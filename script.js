const giftButton = document.querySelector("#giftButton");
const giftStage = document.querySelector("#giftStage");
const photoCard = document.querySelector("#photoCard");
const giftPhoto = document.querySelector("#giftPhoto");
const stageStatus = document.querySelector("#stageStatus");
const drumAudio = document.querySelector("#drumAudio");
const buttonLabel = giftButton.querySelector(".button-label");
const birthdayVideo = document.querySelector("#birthdayVideo");
const videoShell = document.querySelector(".video-shell");
const playToggle = document.querySelector("#playToggle");
const overlayPlay = document.querySelector("#overlayPlay");
const rewindButton = document.querySelector("#rewindButton");
const forwardButton = document.querySelector("#forwardButton");
const videoSeek = document.querySelector("#videoSeek");
const currentTimeReadout = document.querySelector("#currentTime");
const durationTimeReadout = document.querySelector("#durationTime");
const watchState = document.querySelector("#watchState");
const giftLockNote = document.querySelector("#giftLockNote");
const musicPlayer = document.querySelector("#musicPlayer");
const musicAudio = document.querySelector("#musicAudio");
const musicPlay = document.querySelector("#musicPlay");
const musicPrev = document.querySelector("#musicPrev");
const musicNext = document.querySelector("#musicNext");
const musicSeek = document.querySelector("#musicSeek");
const musicCurrent = document.querySelector("#musicCurrent");
const musicDuration = document.querySelector("#musicDuration");
const musicTitle = document.querySelector("#musicTitle");
const musicKicker = document.querySelector("#musicKicker");
const musicStatus = document.querySelector("#musicStatus");
const trackButtons = Array.from(document.querySelectorAll(".track-button"));

const statusTimeline = [
  { time: 250, text: "Oke, hadiah mulai ditarik pelan-pelan." },
  { time: 1850, text: "Sebentar, tim kecilnya mulai serius." },
  { time: 2750, text: "Lho. Kayaknya nyangkut." },
  { time: 3650, text: "Aduh, kejebak sebentar. Tarik napas dulu." },
  { time: 4850, text: "Bisa. Bisa. Tinggal sedikit lagi." },
  { time: 6200, text: "Akhirnya sampai. Ini hadiahnya buat Intan." },
];

const musicTracks = [
  { title: "Hari Ini Milikmu", src: "music1.mp3" },
  { title: "Bintang Baru", src: "music2.mp3" },
  { title: "Hari Baru", src: "music3.mp3" },
  { title: "Langkah ke China", src: "music4.mp3" },
  { title: "Jalan Pulang Merdeka", src: "music5.mp3" },
  { title: "Rumah Kecilmu", src: "music6.mp3" },
];

let hasRun = false;
let timers = [];
let videoComplete = false;
let isSeeking = false;
let activeTrackIndex = 0;
let isMusicSeeking = false;

function clearTimers() {
  timers.forEach((timer) => window.clearTimeout(timer));
  timers = [];
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function updateSeekProgress() {
  const duration = birthdayVideo.duration || 0;
  const currentTime = birthdayVideo.currentTime || 0;
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isSeeking) {
    videoSeek.value = String(percent);
  }

  videoSeek.style.setProperty("--seek-progress", `${percent}%`);
  currentTimeReadout.textContent = formatTime(currentTime);
  durationTimeReadout.textContent = formatTime(duration);

  if (!videoComplete && duration > 0 && currentTime >= duration - 0.2) {
    unlockGift();
  }
}

function setVideoPlayingState() {
  const isPlaying = !birthdayVideo.paused && !birthdayVideo.ended;

  videoShell.classList.toggle("is-playing", isPlaying);
  playToggle.setAttribute("aria-label", isPlaying ? "Jeda video" : "Putar video");
  playToggle.title = isPlaying ? "Jeda video" : "Putar video";
}

function unlockGift() {
  if (videoComplete) {
    return;
  }

  videoComplete = true;
  giftButton.disabled = false;
  giftButton.classList.remove("is-locked");
  videoShell.classList.add("is-complete");
  watchState.textContent = "Video selesai. Hadiah sudah kebuka.";
  giftLockNote.textContent = "Hadiah sudah bisa dicek.";
  giftLockNote.classList.add("is-open");
  stageStatus.textContent = "Video selesai. Sekarang tombol hadiah sudah siap.";
}

function playVideo() {
  if (birthdayVideo.ended) {
    birthdayVideo.currentTime = 0;
  }

  videoShell.classList.add("has-started");

  const playAttempt = birthdayVideo.play();
  if (playAttempt) {
    playAttempt.catch(() => {
      watchState.textContent = "Tekan tombol Putar Video sekali lagi.";
    });
  }
}

function toggleVideoPlayback() {
  if (birthdayVideo.paused || birthdayVideo.ended) {
    playVideo();
    return;
  }

  birthdayVideo.pause();
}

function skipVideo(seconds) {
  const duration = birthdayVideo.duration || 0;
  const nextTime = Math.min(Math.max(birthdayVideo.currentTime + seconds, 0), duration || 0);

  birthdayVideo.currentTime = nextTime;
  updateSeekProgress();
}

function setMusicPlayingState() {
  const isPlaying = !musicAudio.paused && !musicAudio.ended;

  musicPlayer.classList.toggle("is-playing", isPlaying);
  musicPlay.setAttribute("aria-label", isPlaying ? "Jeda musik" : "Putar musik");
  musicPlay.title = isPlaying ? "Jeda musik" : "Putar musik";
  musicStatus.textContent = isPlaying ? "Sedang diputar" : "Dijeda";
}

function updateMusicProgress() {
  const duration = musicAudio.duration || 0;
  const currentTime = musicAudio.currentTime || 0;
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isMusicSeeking) {
    musicSeek.value = String(percent);
  }

  musicSeek.style.setProperty("--seek-progress", `${percent}%`);
  musicCurrent.textContent = formatTime(currentTime);
  musicDuration.textContent = formatTime(duration);
}

function renderActiveTrack() {
  const activeTrack = musicTracks[activeTrackIndex];

  musicTitle.textContent = activeTrack.title;
  musicKicker.textContent = `Lagu ${activeTrackIndex + 1} dari ${musicTracks.length}`;

  trackButtons.forEach((button, index) => {
    const isActive = index === activeTrackIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function loadMusicTrack(index, shouldPlay = false) {
  activeTrackIndex = (index + musicTracks.length) % musicTracks.length;
  const activeTrack = musicTracks[activeTrackIndex];

  musicAudio.src = activeTrack.src;
  musicAudio.load();
  musicStatus.textContent = "Siap diputar";
  renderActiveTrack();
  updateMusicProgress();

  if (shouldPlay) {
    playMusic();
  }
}

function playMusic() {
  birthdayVideo.pause();
  drumAudio.pause();

  const playAttempt = musicAudio.play();
  if (playAttempt) {
    playAttempt.catch(() => {
      musicStatus.textContent = "Tekan tombol putar sekali lagi.";
    });
  }
}

function toggleMusicPlayback() {
  if (musicAudio.paused || musicAudio.ended) {
    playMusic();
    return;
  }

  musicAudio.pause();
}

function goToAdjacentTrack(direction) {
  loadMusicTrack(activeTrackIndex + direction, true);
}

function queueStatusUpdates() {
  statusTimeline.forEach((item) => {
    timers.push(
      window.setTimeout(() => {
        stageStatus.textContent = item.text;
      }, item.time),
    );
  });

  timers.push(
    window.setTimeout(() => {
      giftStage.classList.add("is-stuck");
    }, 2700),
  );

  timers.push(
    window.setTimeout(() => {
      giftStage.classList.remove("is-stuck");
    }, 4850),
  );

  timers.push(
    window.setTimeout(() => {
      giftStage.classList.remove("is-running");
      giftStage.classList.add("is-finished");
      giftButton.disabled = !videoComplete;
      buttonLabel.textContent = "Lihat lagi";
      hasRun = true;
    }, 7100),
  );
}

function loadGiftPhoto() {
  photoCard.classList.remove("is-missing");

  giftPhoto.onload = () => {
    photoCard.classList.remove("is-missing");
  };

  giftPhoto.onerror = () => {
    photoCard.classList.add("is-missing");
  };

  giftPhoto.src = `tf.jpg?fresh=${Date.now()}`;
}

function playDrum() {
  if (!drumAudio) {
    return;
  }

  drumAudio.pause();
  drumAudio.currentTime = 0;

  const playAttempt = drumAudio.play();
  if (playAttempt) {
    playAttempt.catch(() => {
      stageStatus.textContent = "Hadiah tetap jalan, drum.mp3 bisa ditaruh nanti di folder ini.";
    });
  }
}

function startGiftShow() {
  if (!videoComplete) {
    stageStatus.textContent = "Hadiah masih terkunci. Tonton videonya sampai selesai dulu.";
    return;
  }

  clearTimers();
  loadGiftPhoto();
  playDrum();

  giftButton.disabled = true;
  buttonLabel.textContent = hasRun ? "Ulang lagi" : "Lagi ditarik";

  giftStage.classList.remove("is-running", "is-stuck", "is-finished");
  stageStatus.textContent = "Siap. Hitungan mundur kecil dimulai.";

  window.requestAnimationFrame(() => {
    giftStage.classList.add("is-running");
    queueStatusUpdates();
  });
}

giftButton.addEventListener("click", startGiftShow);

birthdayVideo.addEventListener("loadedmetadata", updateSeekProgress);
birthdayVideo.addEventListener("timeupdate", updateSeekProgress);
birthdayVideo.addEventListener("play", () => {
  videoShell.classList.add("has-started");
  setVideoPlayingState();
  watchState.textContent = videoComplete
    ? "Video sedang diputar ulang."
    : "Video sedang diputar. Hadiah masih dikunci dulu.";
});
birthdayVideo.addEventListener("pause", setVideoPlayingState);
birthdayVideo.addEventListener("ended", () => {
  updateSeekProgress();
  setVideoPlayingState();
  unlockGift();
});

playToggle.addEventListener("click", toggleVideoPlayback);
overlayPlay.addEventListener("click", playVideo);
rewindButton.addEventListener("click", () => skipVideo(-10));
forwardButton.addEventListener("click", () => skipVideo(10));

videoSeek.addEventListener("input", () => {
  isSeeking = true;
  const duration = birthdayVideo.duration || 0;
  const nextTime = (Number(videoSeek.value) / 100) * duration;

  videoSeek.style.setProperty("--seek-progress", `${videoSeek.value}%`);
  currentTimeReadout.textContent = formatTime(nextTime);
});

videoSeek.addEventListener("change", () => {
  const duration = birthdayVideo.duration || 0;
  birthdayVideo.currentTime = (Number(videoSeek.value) / 100) * duration;
  isSeeking = false;
  updateSeekProgress();
});

musicAudio.addEventListener("loadedmetadata", updateMusicProgress);
musicAudio.addEventListener("timeupdate", updateMusicProgress);
musicAudio.addEventListener("play", setMusicPlayingState);
musicAudio.addEventListener("pause", setMusicPlayingState);
musicAudio.addEventListener("ended", () => {
  goToAdjacentTrack(1);
});

musicPlay.addEventListener("click", toggleMusicPlayback);
musicPrev.addEventListener("click", () => goToAdjacentTrack(-1));
musicNext.addEventListener("click", () => goToAdjacentTrack(1));

musicSeek.addEventListener("input", () => {
  isMusicSeeking = true;
  const duration = musicAudio.duration || 0;
  const nextTime = (Number(musicSeek.value) / 100) * duration;

  musicSeek.style.setProperty("--seek-progress", `${musicSeek.value}%`);
  musicCurrent.textContent = formatTime(nextTime);
});

musicSeek.addEventListener("change", () => {
  const duration = musicAudio.duration || 0;
  musicAudio.currentTime = (Number(musicSeek.value) / 100) * duration;
  isMusicSeeking = false;
  updateMusicProgress();
});

trackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const trackIndex = Number(button.dataset.track);
    const isSameTrack = trackIndex === activeTrackIndex;

    if (isSameTrack) {
      toggleMusicPlayback();
      return;
    }

    loadMusicTrack(trackIndex, true);
  });
});

renderActiveTrack();
updateSeekProgress();
updateMusicProgress();
