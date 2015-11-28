define('synth', ['note'], function (Note) {

    // constants
    const BASE_FREQUENCY = 440;     // A above Middle C, in Hz
    const MASTER_VOLUME = 0.2;      // master volume as a percent
    const NOTES = {
        'A': 0,
        'A#': 1,
        'B': 2,
        'C': 3,
        'C#': 4,
        'D': 5,
        'D#': 6,
        'E': 7,
        'F': 8,
        'F#': 9,
        'G': 10,
        'G#': 11
    };

    // create synth with a short delay patch
    var Synth = function (context) {
        this.context = context;

        this.master = this.context.createGain();
        this.master.gain.value = MASTER_VOLUME;

        this.delay = this.context.createDelay();
        this.delay.delayTime.value = 0.25;
        this.delay.connect(this.master);

        this.master.connect(this.delay);    // feedback!
        this.master.connect(this.context.destination);
    };

    Synth.prototype = {
        baseOctave: 4,

        // in ms
        attack: 0,
        decay: 200,
        sustain: 10,
        release: 2000,

        create: function (key, octave, startTime) {
            var note = new Note(
                this.context,
                this.master,
                this.getHz(key, octave),
                this.attack,
                this.decay,
                this.sustain,
                this.release
            );
            this.play(note, startTime);
            return this.stop(note, startTime);
        },

        getHz: function (key, octave) {
            var transpose = octave - this.baseOctave;
            var halfSteps = (NOTES[key] + transpose * 12) / 12;
            return BASE_FREQUENCY * Math.pow(2, halfSteps);
        },

        play: function (note, startTIme) {
            note.play(startTIme);
            return note;
        },

        stop: function (note, startTIme) {
            note.stop(startTIme);
            return note;
        }
    };

    return Synth;

});
