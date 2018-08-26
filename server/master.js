const child_process = require('child_process');
const timer = require('./timer');

let spiderProcess = child_process.fork('spider.js');
console.info('spider start success');
timer.start();
let serverProcess = child_process.fork('server.js');

function start(process, name) {
    process.on('close', (code) => {
        console.info(name, 'exit, code:', code);
        timer.end((time) => {
            console.info(name, 'cost:', time);
        });
        spiderProcess = child_process.fork('spider.js');
        start(spiderProcess, 'spider');
        console.info(name, 'restart success');
    });
}

start(spiderProcess, 'spider');

start(serverProcess, 'server');