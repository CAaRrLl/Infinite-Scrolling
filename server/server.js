const http = require('http');
const initDB = require('./db').initTable;
const fs = require('fs');
const getEssay = require('./db').getEssay;

const port = process.env.PORT || 8080;

const staticUrl = '/infinite/scroll';

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

function dealStatic(url, res) {
    let fileUrl = url.split(staticUrl)[1];
    if(fileUrl === '/show') {
        fileUrl = '../index.html';
    } else {
        fileUrl = `..${fileUrl}`;
    }
    fs.readFile(fileUrl, (err, data) => {
        if(err) {
            res.writeHead(500);
            res.end();
            throw Error(err);
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    })
    return;
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

    if(url.indexOf(staticUrl) == 0) {
        dealStatic(url, res);
        return;
    }

    res.writeHead(404);
    res.end();

}).listen(port);

console.info('server start success, listening:', port);