const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'jijinping',
    password: 'jijinping',
    database: 'my_spider_data'
});

connect();

function connect() {
    connection.connect();

    connection.on('error', function(err) {
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('db error执行重连:'+err.message);
            connect();
        } else {
            throw Error(error);;
        }
    });
}

exports.db = connection;
exports.initTable = function() {
    const sql = 
    `create table if not exists essay(
        id varchar(20) not null,
        img varchar(300) not null,
        title varchar(100) not null,
        text varchar(300) not null,
        date bigint not null,
        primary key(id)
    )`;
    connection.query(sql, (error, result, fields) => {
        if(error) {
            throw Error(error);
        }
    });
};
exports.insertData = function(node_id, img, title, text) {
    const sql = `insert into essay (id, img, title, text, date) values(?, ?, ?, ?, ?)`;
    const date = Date.now();

    connection.query(sql, [node_id, img, title, text, date], (error, result, fields) => {
        if(error) {
            return;
        }
        console.log('新增一条')
    });
};
exports.getEssay = function(page, size) {
    return new Promise((resolve, reject) => {
        const sql = `select id, img, title, text from essay order by date limit ?, ?`;
        size = +size;
        page = (+page - 1) * size;
        connection.query(sql, [page, size], (error, result, fields) => {
            if(error) {
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}