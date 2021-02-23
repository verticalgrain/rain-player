var AudioContext = AudioContext || webkitAudioContext,
    context = new AudioContext(),
    sounds = [];

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

var stop = document.querySelector('[data-js="stop"]');

document.querySelectorAll('.sound').forEach(item => {
    item.addEventListener('change', event => {
        if ( item.checked ) {
            var mediaSrc = item.getAttribute('data-src');
            stopSoundAll();
            request( mediaSrc );
        } else {
            stopSoundAll();
        }
    })
})

stop.addEventListener('click', function() {
    stopSoundAll();
});

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