define('main', [
    'util/d3.v3.min',
    'synth',
    'tone',
    'helpers'
], function (d3, Synth, Tone) {

    // constants
    const OCTAVES = { min: 1, max: 8 };             // played octaves
    const PARTICLE_WIDTH = { min: 2, max: 100 };    // size of tone circles
    const PHRASE_INTERVAL = 1000;                   // ms until phrase is complete
    const RADIUS = { start: 0, stop: 100 };         // size of particles
    const REPEAT_NOTE = 3;                          // # times to repeat note
    const REPEAT_TEMPO = PHRASE_INTERVAL / 1000;    // phrase interval in secs
    const SCALES = {
        CHROMATIC: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
        MAJOR_PENTATONIC: ['A', 'C#', 'D',' E', 'F#'],
        MINOR_PENTATONIC: ['A', 'C', 'D', 'E', 'G']
    };

    // web audio
    var context;
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    } catch (e) {
        alert('WebAudio is unsupported by your browser.');
        throw '*** Missing WebAudio ***';
    }

    var scale = location.hash.substring(1);     // parse scale from hash url
    var KEYS = SCALES[scale];                   // available keys in the scale
    var phrase = {                              // tones are grouped together in a phrase
        tones: [],                              // which is repeated by the time specified
        start: null                             // in the PHRASE_INTERVAL
    };
    var tones = [];                             // current playing tones
    var synth = new Synth(context);             // synth/oscillator

    // cache circle colors
    var colors = d3.scale[getCategory()]();

    // randomize our colors!
    function getCategory () {
        var x = Math.random() * 3;
        if (x < 1) {
            return 'category20';
        } else if (x < 2) {
            return 'category20b';
        } else {
            return 'category20c';
        }
    }

    // svg
    var svg = d3.select('body').append('svg:svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
        .style('pointer-events', 'all')
        .on('mousedown', playTone);

    // start audio loop with request animation frame
    d3.timer(audioLoop);

    function audioLoop (elapsed) {
        for (var i = tones.length; i--;) {
            var tone = tones[i];

            // because timing is variable in javascript
            // we schedule the tone based on the fixed timestep of
            // the web audio context
            if (tone.start + REPEAT_TEMPO < context.currentTime) {
                tone.play.call(tone, tone.start + REPEAT_TEMPO);
                tone.start = context.currentTime + REPEAT_TEMPO;

                render(tone.x, tone.y, tone.color);

                // has this tone played itself out?
                if (++tone.repeat === REPEAT_NOTE) {
                    tones.splice(i, 1);
                }
            }
        }
    }

    function addToPhrase (key, octave, x, y, color) {
        // set the phrase start time if this is
        // the first note
        if (phrase.tones.length === 0) {
            phrase.start = context.currentTime;
            setTimeout(stopPhrase, PHRASE_INTERVAL);
        }
        phrase.tones.push(
            new Tone(context, synth, key, octave, x, y, color)       // plays initial tone
        );
    }

    // mouse-up handler
    function playTone () {
        var m = d3.mouse(this);

        // audio
        var keyIndex = m[0].map(0, window.innerWidth, 0, KEYS.length - 1);         // pitch (key) changes along x-axis
        var key = KEYS[keyIndex];
        var octave = m[1].map(0, window.innerHeight, OCTAVES.max, OCTAVES.min);    // octave changes along y-axis

        // color
        var color = colors(~~(Math.random() * 20));

        addToPhrase(key, octave, m[0], m[1], color);

        render(m[0], m[1], color);
    }

    function render (x, y, color) {
        var width = y.map(0, window.innerHeight, PARTICLE_WIDTH.min, PARTICLE_WIDTH.max);    // scales with octave along y-axis

        svg.append('svg:circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', RADIUS.start)
            .style('stroke', color)
            .style('stroke-opacity', 1)
            .style('stroke-width', width)
        .transition()
            .duration(2000)
            .ease(Math.sqrt)
            .attr('r', RADIUS.stop)
            .style('stroke-opacity', 1e-6)
            .remove();
    }

    function stopPhrase (tone) {
        // queue all notes relative to end of phrase
        var current = context.currentTime;
        for (var i = 0, len = phrase.tones.length; i < len; i++) {
            var tone = phrase.tones[i];
            tone.start = current + (tone.start - phrase.start);
        }

        // add to audio loop!
        tones = tones.concat(phrase.tones);

        // start new phrase
        phrase.tones.length = 0;
        phrase.start = null;
    }

});
