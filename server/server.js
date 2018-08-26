const http = require('http');
const initDB = require('./db').initTable;
const getEssay = require('./db').getEssay;

const port = 8080;

function parseUrl(query) {
    let info = query.split('?');
    let url = info[0];
    let params = {};
    if(info.length > 1) {
        let querySplices = info[1].split('&');
        querySplices.forEach((splice) => {
            let spliceInfo = splice.split('=');
            params[spliceInfo[0]] = spliceInfo[1];
        });
    }
    return {url, params};
}

initDB();

http.createServer((req, res) => {
    const {url, params} = parseUrl(req.url);

    /*
    api: /api/essay/list
    params: {
        page: number //当前页码
        size: number //每页条目
    }
    */

    if(url === '/api/essay/list') {
        if(!params.page || !params.size) {
            res.writeHead(400);
            res.end();
            return;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        getEssay(params.page, params.size)
        .then(result => {
            const body = JSON.stringify(result);
            res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
            res.end(body);
        })
        .catch(error => {
            res.writeHead(500);
            res.end();
            throw Error(error);
        })
        return;
    }

    res.writeHead(404);
    res.end();

}).listen(port);

console.info('server start success, listening:', port);