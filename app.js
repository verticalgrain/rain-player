var AudioContext = AudioContext || webkitAudioContext,
    context = new AudioContext(),
    sounds = [],
    stop = document.querySelector('[data-js="stop"]'),
    soundButtons = document.querySelectorAll('.sound-button'),
    soundButtonActiveClass = 'sound-button--active',
    connectionStatus = 'connection-status';

function createSound(buffer, context) {
    var sourceNode = null,
        startedAt = 0,
        pausedAt = 0,
        playing = false;

    var play = function( src ) {
        var offset = pausedAt;

        sourceNode = context.createBufferSource();
        sounds.push( sourceNode );
        sourceNode.connect(context.destination);
        sourceNode.buffer = buffer;
        sourceNode.start(0, offset);
        sourceNode.loop = true;

        startedAt = context.currentTime - offset;
        pausedAt = 0;
        playing = true;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        stop();
        pausedAt = elapsed;
    };

    var stop = function() {
        if (sourceNode) {
            sourceNode.disconnect();
            sourceNode.stop(0);
            sourceNode = null;
        }
        pausedAt = 0;
        startedAt = 0;
        playing = false;
    };

    var getPlaying = function() {
        return playing;
    };

    var getCurrentTime = function() {
        if(pausedAt) {
            return pausedAt;
        }
        if(startedAt) {
            return context.currentTime - startedAt;
        }
        return 0;
    };

    var getDuration = function() {
        return buffer.duration;
    };

    return {
        getCurrentTime: getCurrentTime,
        getDuration: getDuration,
        getPlaying: getPlaying,
        play: play,
        pause: pause,
        stop: stop
    };
}

function stopSoundAll() {
    var arrayLength = sounds.length;
    for(var i = 0; i < arrayLength; i++)
        if (sounds[i]) {
            sounds[i].disconnect(0);
            sounds[i].stop(0);
        }
    // Clear the sounds array
    sounds.length = 0;
}

var init = function(buffer) {
    var sound = createSound(buffer, context);
    sound.play();
    context.resume();
};

var request = function( url ) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.setRequestHeader("Cache-Control", "max-stale");
    request.responseType = 'arraybuffer';
    request.addEventListener('load', function() {
        context.decodeAudioData(
            request.response,
            function(buffer) {
                init(buffer);
            },
            function(e) {
                console.error('ERROR: context.decodeAudioData:', e);
            }
        );
    });
    request.send();
}

function requestFetch( url ) {
    fetch(url)
    .then(resp => resp.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        init(audioBuffer);
    })
}

// Dom manipulation

function removeClasses() {
    for (var i = 0; i < soundButtons.length; i++) {
        soundButtons[i].classList.remove(soundButtonActiveClass)
    }
}

window.addEventListener("load", (event) => {
    const statusDisplay = document.getElementById(connectionStatus);
    statusDisplay.textContent = navigator.onLine ? " " : "offline";
});

window.addEventListener("offline", (event) => {
    const statusDisplay = document.getElementById(connectionStatus);
    statusDisplay.textContent = "offline";
});

window.addEventListener("online", (event) => {
    const statusDisplay = document.getElementById(connectionStatus);
    statusDisplay.textContent = " ";
});


// Event Listeners

soundButtons.forEach(item => {
    item.addEventListener('click', event => {
        // Remove active class from all buttons
        removeClasses();
        // add active class to this button
        item.classList.add(soundButtonActiveClass);
        var mediaSrc = item.getAttribute('data-src');
        stopSoundAll();
        // request( mediaSrc );
        requestFetch( mediaSrc );
    })
})

stop.addEventListener('click', function() {
    removeClasses();
    stopSoundAll();
});