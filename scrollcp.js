/*
$scrollcp(selector: string, options: {
    url: string,
    data: object,
})
*/
(function(win) {
    function Scroll(id, options) {
        this.containerSelector = id;
        this.ulId = 'ul-box';   
        this.threshold = 50;        //滚动阀值
        this.url = options.url;
        this.data = options.data;
        this.cache = [];            //缓存dom节点,用于懒加载
        this.isFetching = false;
    }

    Scroll.prototype.init = function() {
        var div = document.createElement('div');
        var ul = document.createElement('ul');
        ul.id = this.ulId;
        div.appendChild(ul);
        var container = document.querySelector(this.containerSelector);
        container.appendChild(div);

        this.initStyle();

        this.fetchData(() => {
            this.handleScroll();
            this.startLazyLoad();
        });
    }

    Scroll.prototype.fetchData = function(callback) {
        getJSON(this.url, this.data)
        .then(resData => {
            var body = JSON.parse(resData);
            var ul = document.getElementById(this.ulId);
            var list = this.createList(body);
            this.updateCache(list);
            ul.appendChild(list);
            this.isFetching = false;
            if(callback) {
                callback.call(this, body);
            }
        })
        .catch(error => {
            throw Error(error);
        });
    }

    Scroll.prototype.createList = function(data) {
        var fragment = document.createDocumentFragment();
        data.forEach(function(list) {
            var li = document.createElement('li');
            li.className = 'my-list';
            li.id = `li-${list.id}`;
            li.innerHTML = `
                <img class='my-img' data-src=${list.img}/>
                <div class='content'>
                    <h3>${list.title}</h3>
                    <p>${list.text}</p>
                </div>
            `;
            fragment.appendChild(li);
        });
        return fragment;
    }

    Scroll.prototype.handleScroll = function() {
        var context = this;
        window.onscroll = throttle(function() {
            if(isReachBottom(context.threshold) && !context.isFetching) {
                context.isFetching = true;
                context.data.page++;
                context.fetchData();
            }
            context.startLazyLoad();
        }, 100);
    }

    Scroll.prototype.startLazyLoad = function() {
        this.cache.forEach(function(item) {
            if(isVisible(item.id)) {
                var imgNode = item.img;
                const src = `https:${imgNode.dataset.src}`;

                var img = new Image();
                img.onload = function() {
                    imgNode.src = src;
                    imgNode.style.opacity = 1;
                }
                img.src = src;
            }
        });
    }

    Scroll.prototype.updateCache = function(node) {
        var list = node.querySelectorAll('.my-list');
        var cache = this.cache = [];
        list.forEach(function(item) {
            cache.push({
                id: item.id,
                img: item.querySelector('.my-img'),
                node: item
            })
        });
    }

    Scroll.prototype.initStyle = function() {
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.innerHTML = `
            body {
                margin: 0;
            }
            #ul-box {
                list-style: none;
                padding: 0;
            }
            .my-list {
                border-radius: 4px;
                height: 120px;
                font-size: 12px;
                margin-bottom: 5px;
                padding-left: 5px;
                padding-right: 5px;
                box-shadow: 0px 1px 4px 0px #d2d2d2;
            } 
            .my-img {
                width: 90px;
                height: 72px;
                float: left;
                position: relative;
                top:24px;
                margin-right: 10px;
                opacity: 0;
                transition: opacity 1s;
            }
            .content {
                position: relative;
                top: 15px;
            }
            .content > h3 {
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .content > p {
                margin: 0;
            }
        `;
        document.head.appendChild(style);
    }

    function isVisible(id) {
        var target;
        var offsetTop;
        var offsetHeight;
        var scrollTop;
        var clientHeight;
        
        target = document.getElementById(id);
        offsetTop = target.offsetTop;
        offsetHeight = target.offsetHeight;
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

        return offsetTop < clientHeight + scrollTop && offsetTop + offsetHeight > scrollTop;
    }

    function isReachBottom(threshold) {
        var scrollTop;
        var clientHeight;
        var bodyHeight;

        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        bodyHeight = document.body.offsetHeight;

        return scrollTop + clientHeight >= bodyHeight - threshold;
    }

    function throttle(func, delay) {
        var time = null;
        return function() {
            var args = [].slice.call(arguments);
            var context = this;
            if(!time) {
                time = setTimeout(function() {
                    func.apply(context, args);
                    time = null;
                }, delay);
            }
        }
    }

    function getJSON(url, json) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            url = `${url}?${getUrlQuery(json)}`;
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        resolve(xhr.responseText);
                    } else {
                        reject({code: xhr.status, msg: xhr.statusText});
                    }
                }
            };
            xhr.send();
        });
    }

    function getUrlQuery(object) {
        var query;
        for(const key in object) {
            const param = `${key}=${object[key]}`;
            if(!query) {
                query = param;
                continue;
            }
            query += `&${param}`
        }
        return query;
    }

    function scrollcp(selector, options) {
        (new Scroll(selector, options)).init();
    }

    win.$scrollcp = scrollcp;
})(window);