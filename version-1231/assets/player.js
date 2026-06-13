(function () {
    window.setupVideoPlayer = function (videoId, source, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !source) {
            return;
        }
        var hlsInstance = null;

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute("data-ready", "1");
        }

        function start() {
            attach();
            if (button) {
                button.classList.add("is-hidden");
            }
            var playing = video.play();
            if (playing && typeof playing.catch === "function") {
                playing.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
