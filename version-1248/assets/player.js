(function () {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var layer = shell.querySelector(".play-layer");
  var url = shell.getAttribute("data-video-url");
  var hls = null;

  function attach() {
    if (!video || !url || video.getAttribute("data-ready") === "1") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    video.setAttribute("data-ready", "1");
  }

  function start() {
    attach();
    if (layer) {
      layer.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (layer) {
          layer.classList.remove("is-hidden");
        }
      });
    }
  }

  if (layer) {
    layer.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
