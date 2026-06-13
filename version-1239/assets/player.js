(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setMessage(wrapper, text) {
    var message = wrapper.querySelector('[data-player-message]');

    if (message) {
      message.textContent = text;
    }
  }

  function initPlayer(video) {
    var source = video.getAttribute('data-hls-src');
    var wrapper = video.closest('.player-shell') || video.parentElement;
    var startButton = wrapper ? wrapper.querySelector('[data-player-toggle]') : null;

    if (!source || !wrapper) {
      return;
    }

    function hideStartButton() {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    }

    function showStartButton() {
      if (startButton) {
        startButton.classList.remove('is-hidden');
      }
    }

    function playVideo() {
      var playPromise = video.play();
      hideStartButton();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showStartButton();
          setMessage(wrapper, '浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage(wrapper, '视频已准备就绪，点击播放。');
      });

      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage(wrapper, '网络错误，正在尝试重新加载播放源。');
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage(wrapper, '媒体错误，正在尝试恢复播放。');
          hls.recoverMediaError();
        } else {
          setMessage(wrapper, '播放器出现错误，请刷新页面后重试。');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setMessage(wrapper, '视频已准备就绪，点击播放。');
    } else {
      setMessage(wrapper, '当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', hideStartButton);
    video.addEventListener('pause', showStartButton);
  }

  ready(function () {
    document.querySelectorAll('video[data-hls-src]').forEach(initPlayer);
  });
})();
