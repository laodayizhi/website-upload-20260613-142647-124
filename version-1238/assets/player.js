import { H as Hls } from "./hls.js";

export function attachPlayer(source) {
  const video = document.getElementById("movie-video");
  const cover = document.querySelector("[data-player-cover]");
  const playButton = document.querySelector("[data-player-button]");

  if (!video || !source) {
    return;
  }

  let loaded = false;
  let hls = null;

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    }
  }

  function begin(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    loadSource();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.setAttribute("controls", "controls");
    video.play().catch(() => {});
  }

  if (cover) {
    cover.addEventListener("click", begin);
  }

  if (playButton) {
    playButton.addEventListener("click", begin);
  }

  video.addEventListener("click", () => {
    if (video.paused) {
      begin();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
