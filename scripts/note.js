define('note', function () {

    // oscillator + envelope (adsr)
    var Note = function (context, master, hz, attack, decay, sustain, release) {
        this.context = context;
        this.master = master;
        this.hz = hz;
        this.attack = attack;
        this.decay = decay;
        this.sustain = sustain;
        this.release = release;

        this.osc = this.context.createOscillator();
        this.envelope = this.context.createGain();

        this.osc.connect(this.envelope);
        this.envelope.connect(this.master);

        this.osc.frequency.setValueAtTime(this.hz, 0);

        this.setEnvelope();
    };

    Note.prototype = {
        play: function (time) {
            this.osc.start(time || 0);
        },

        setEnvelope: function () {
            var now = this.context.currentTime;
            var attackEnd = now + (this.attack / 1000);
            var decay = (this.decay / 1000) + 0.001;

            this.envelope.gain.setValueAtTime(0, now);
            this.envelope.gain.linearRampToValueAtTime(1, attackEnd);
            this.envelope.gain.setTargetValueAtTime((this.sustain / 1000), attackEnd, decay);
        },

        stop: function (time) {
            time = time || this.context.currentTime;

            var release = time + (this.release / 1000);

            this.envelope.gain.cancelScheduledValues(time);
            this.envelope.gain.setValueAtTime(this.envelope.gain.value, time);
            this.envelope.gain.setTargetValueAtTime(0, time, (this.release / 1000));

            this.osc.stop(release);
        }
    };

    return Note;

});
