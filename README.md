# Infinite-Scrolling
无限滚动加载组件

- 封装原生ajax
- 设置预加载阀值
- DOM节点缓存
- 图片懒加载优化
- 节流优化
- 爬取简书文章列表作为数据来源

```javascript
<html>
    <head>
        <title>无限滚动展示</title>
        <meta charset='utf-8'>
        <meta name='viewport' content='initial-scale=1,width=device-width' />
        <script type='text/javascript' src='scrollcp.js'></script>
    </head>
    <body>
        <div id="forscrolling"></div>
        <script>
            $scrollcp('#forscrolling', {
                url: '/api/essay/list',
                data: {
                    page: 1,
                    size: 8,
                }
            });
        </script>
    </body>
</html>
```
