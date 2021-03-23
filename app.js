var AudioContext = AudioContext || webkitAudioContext,
    context = new AudioContext(),
    sounds = [],
    soundButtons = document.querySelectorAll('.sound-button'),
    soundButtonActiveClass = 'sound-button--active',
    soundButtonCachedClass = 'sound-button--cached',
    connectionStatus = 'connection-status',
    soundButtonFetchStartClass = 'sound-button--fetch-started',
    soundButtonFetchDoneClass = 'sound-button--fetch-done',
    cachedFiles = [];

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

function requestFetch( url, element ) {
    element.classList.add(soundButtonFetchStartClass)

    fetch(url)
    .then(resp => resp.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        element.classList.add(soundButtonFetchDoneClass)
        element.classList.add(soundButtonCachedClass)
        init(audioBuffer);
    })
}

function initSoundButtons() {
    soundButtons.forEach(item => {

        // Get url of sound file
        var mediaSrc = item.getAttribute('data-src');

        // Check if sound file exists in cache
        var isCached = cachedFiles.some( cachedFile => cachedFile.includes( mediaSrc ));
        isCached && item.classList.add(soundButtonCachedClass)

        item.addEventListener('click', event => {
            if ( item.classList.contains("sound-button--active") ) {
                // Stop all sounds from playing
                stopSoundAll();
                // Remove active class from all buttons
                removeActiveClassAll();
            } else {
                // Remove active class from all buttons
                removeActiveClassAll();
                // Add active class to this button
                item.classList.add(soundButtonActiveClass);
                // Stop all sounds from plahing
                stopSoundAll();
                // Fetch the mp3 file
                requestFetch( mediaSrc, item );
            }
        })
    })
}

// Dom manipulation

function removeActiveClassAll() {
    for (var i = 0; i < soundButtons.length; i++) {
        soundButtons[i].classList.remove(soundButtonActiveClass)
    }
}

// Event Listeners

window.addEventListener("DOMContentLoaded", (event) => {
    // Get a list of files in the cache
    caches.open('r37sk3PWA-v1').then(cache => {
        cache.keys().then(cachedItems => {
            cachedItems.map( item => {
                cachedFiles.push( item.url )
            } )
        })
        .then( thing => {
            initSoundButtons();
        })
    })
})

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
