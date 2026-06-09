
import { H as Hls } from './hls.js';

function startPlayer(shell) {
    var video = shell.querySelector('video');
    var source = shell.dataset.src;

    if (!video || !source) {
        return;
    }

    shell.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
        });
        return;
    }

    video.src = source;
    video.play().catch(function () {});
}

document.querySelectorAll('.js-player').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    if (button) {
        button.addEventListener('click', function () {
            startPlayer(shell);
        });
    }

    shell.addEventListener('dblclick', function () {
        startPlayer(shell);
    });
});
