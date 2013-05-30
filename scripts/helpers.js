define('helpers', function () {

    // polluting the base...with eloquence!
    Number.prototype.clamp = function(min, max) {
        return Math.min(max, Math.max(min, this));
    };

    Number.prototype.map = function(istart, istop, ostart, ostop) {
        var num = ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
        return ostart < ostop ? ~~num.clamp(ostart, ostop) : ~~num.clamp(ostop, ostart);
    };

});
