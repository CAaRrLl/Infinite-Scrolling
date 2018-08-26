function Timer() {
    this.time = 0;
}

Timer.prototype.start = function() {
    this.time = Date.now();
}

Timer.prototype.end = function(callback) {
    let cost = Date.now() - this.time;
    let ms, s, min, hour, day;
    ms = cost % 1000;
    cost = Math.floor(cost / 1000);
    s = cost % 60;
    cost = Math.floor(cost / 60);
    min = cost % 60;
    cost = Math.floor(cost / 60);
    hour = cost % 60;
    day = Math.floor(cost / 60);
    callback(`${day}天${hour}小时${min}分${s}秒${ms}毫秒`);
}

module.exports = new Timer();