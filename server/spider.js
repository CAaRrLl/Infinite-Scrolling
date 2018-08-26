const superagent = require('superagent');
const cheerio = require('cheerio');
const insert = require('./db').insertData;

const targetUrl = 'https://www.jianshu.com/';
const trendApi = 'trending_notes';

const trendNum = 100;

let collectData = {};

function collect(target, id, title, img, text) {
    if(target[id]) return;
    target[id] = {title, img, text};
    insert(id, img, title, text);
}

function getInit(option) {
    return option.page && option.seen_snote_ids?
    new Promise((resolve) => {
        let url = `${targetUrl}?seen_snote_ids[]=${option.seen_snote_ids.join(',')}&page=${option.page}`;
        let get = superagent.get(url);
        if(option.page > 1) {
            get.set('X-INFINITESCROLL', 'true');
        }
        get
        .set('User-Agent', 'Chrome/68.0.3440.106 Safari/537.36')
        .timeout({ response: 5000 })
        .then((res, err) => {
            if(err) {
                throw Error(err);
            }
            let $ = cheerio.load(res.text);
            let list = option.page > 1? $('li') : $('.note-list li');
            option.seen_snote_ids.push(...getNextNoteIds($, list));
            option.page++;
            resolve(option);
        })
    }): null;
}

function getNextNoteIds($, list) {
    let seen_snote_ids = [];
    list.each((_, element) => {
        let li = $(element);
        let note_id,
            img_src,
            title,
            text;

        note_id = li.attr('data-note-id');
        seen_snote_ids.push(note_id);

        if(collectData[note_id]) return;

        img_src = li.find('.wrap-img img').attr('src');
        if(!img_src) return;

        title = li.find('.content .title').text();
        text = li.find('.content .abstract').text();

        collect(collectData, note_id, title, img_src, text);
        // console.log(collectData[note_id]);
    });
    return seen_snote_ids;
}

function trendMore(option) {
    return option.page && option.seen_snote_ids ?
    new Promise((resolve) => {
        superagent
        .post(targetUrl + trendApi)
        .timeout({ response: 5000 })
        .set('X-PJAX', 'true')
        .set('User-Agent', 'Chrome/68.0.3440.106 Safari/537.36')
        .send(`seen_snote_ids[]=${option.seen_snote_ids.join(',')}`)
        .end((err, res) => {
            if(err) {
                process.exit(); 
            }
            let $ = cheerio.load(res.text);
            option.seen_snote_ids.push(...getNextNoteIds($, $('li')));
            option.page++;
            resolve(option);
        });
    }): null;
}

let trendOper = getInit({
    url: targetUrl, 
    page:1, 
    seen_snote_ids: []
})
.then(getInit)
.then(getInit);

for(let i = 0; i < trendNum; i++) {
    trendOper = trendOper.then(trendMore);
}
trendOper.then(() => process.exit());