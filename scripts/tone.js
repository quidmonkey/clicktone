define('tone', function () {

    var Tone = function (context, synth, key, octave, x, y, color) {
        this.animate = false;                   // should draw circle?
        this.color = color;                     // color of circle associated with tone
        this.octave = octave;                   // octave of tone
        this.key = key;                         // key (pitch) of tone
        this.repeat = 0;                        // # of times tone has been repeated
        this.start = context.currentTime;       // when initial tone was played
        this.synth = synth;                     // our synth/oscillator
        this.x = x;                             // x-coordinate of circle
        this.y = y;                             // y-coordinate of circle

        // when tone is first struck
        // play it!
        this.play();
    }

    Tone.prototype = {
        play: function (startTime) {
            this.synth.create(this.key, this.octave, startTime || this.start);
        }
    };

    return Tone;

});
