<!DOCTYPE html>
{{brisk_page_init framework="kernel"}}
<html>
<head lang="en">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <title>{{block name=title}}直达号{{/block}}</title>
    <script type="text/javascript" src="../static/js/ie.js?__inline"></script>
    <link rel="dns-prefetch" href="http://zhida.baidu.com/">
    <link rel="dns-prefetch" href="http://apps.bdimg.com/">
    <link rel="dns-prefetch" href="http://img.baidu.com/">
    <link rel="dns-prefetch" href="http://pim.baidu.com/">
    <link rel="stylesheet" type="text/css" href="../static/css/framework.css?__inline" />

    <!--[CSS_HOOK]-->

    <script type="text/javascript" src="../../../lib/js/jQuery.js"></script>
</head>
<body>
    <script type="text/javascript" src="http://__TOPBAR__/apis/topbar?version=old"></script>
    <script type="text/javascript" src="../static/js/header.js?__inline"></script>
    <div class="framework-page">
        {{include file="../widget/navbar/navbar.tpl"}}

        <div class="framework-right" id="main-content">
            {{block name=mainContent}}{{/block}}
        </div>
    </div>

    {{include file="../widget/ufo/ufo.tpl"}}

    {{include file="../widget/footer/footer.tpl"}}

</body>

<!--[JS_HOOK]-->
{{brisk_page_flush}}
</html>