// ==UserScript==
// @name         zd423|吾爱|果核|卡饭 精简去推广——Cocoontat修改版
// @namespace    "https://github.com/Coconutat/browser-script-backup-Self-use/zd423吾爱果核卡饭_精简去推广_modify.user.js"
// @version      0.9.8.12.7
// @description  页面精简去推广内容只留主内容，卡饭自动签到等功能，殁漂遥去推广请看介绍，不在此脚本
// @author       Aerozb，修改 by Cocoontat
// @match        http://bbs.zhiyoo.net/search.php?mod=forum&adv=yes
// @match        https://www.423down.com/*
// @match        https://www.52pojie.cn/search.php*
// @match        https://www.52pojie.cn/forum*
// @match        https://www.ghxi.com/*
// @match        https://www.ghxi.com/?btwaf*
// @match        https://bbs.kafan.cn/forum-65-1.html
// @include      https://acold.xyz/
// @updateURL    "https://raw.githubusercontent.com/Coconutat/browser-script-backup-Self-use/main/zd423吾爱果核卡饭_精简去推广_modify.user.js"
// @icon         https://www.423down.com/wp-content/themes/D7/img/favicon.ico
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    //每次进入前清除控制台信息
    console.clear();
    let url = window.location.href;

    //去除zd置顶推广内容
    //加入‘推荐’字符，去除新的广告 2022.07
    //加入‘限时’字符，去除新的广告 2022.08
    //加入‘纯净尊享’，‘免费纯净’字符，‘免费的资源搜索神器’字符，去除新的广告 2022.10
    //加入‘纯净尊享’，‘免费尊享版’字符，去除新的广告 2022.11
    //加入‘产品推广’字符，去除新的广告 2024.01
    if (url.indexOf('423down') != -1) {
        document.querySelector("#hasfixed > div.wrapper > div.sidebar > div:nth-child(2)").remove();
        let ul = document.querySelector("#hasfixed > div.wrapper > div.content-wrap > div > ul").children;
        for (let i = ul.length - 1; i > -1; i--) {
            let a = ul[i].querySelectorAll('a');
            for (let j = a.length - 1; j > -1; j--) {
                if (a[j].innerText.indexOf('默认分类') != -1 || a[j].innerText.indexOf('优惠') != -1 || a[j].innerText.indexOf('推荐') != -1 || a[j].innerText.indexOf('限时') != -1 || a[j].innerText.indexOf('纯净尊享') != -1 || a[j].innerText.indexOf('免费纯净') != -1 || a[j].innerText.indexOf('免费的资源搜索神器') != -1 || a[j].innerText.indexOf('免费尊享') != -1 || a[j].innerText.indexOf('产品推广') != -1) {
                    ul[i].remove();
                    break;
                }
            }
        }
    }

    //智友搜索按发布时间排序,精简多余内容
    else if (url.indexOf('http://bbs.zhiyoo.net/search') != -1) {
        document.querySelector("#scform > tbody > tr > td:nth-child(1) > h1 > img").remove();
        document.querySelector("#ct > div > div > div.sttl.mbn").remove();
        let order = document.getElementById('orderby1');
        if (order != null) {
            order.options[1].selected = true;
        }
    }
    //吾爱搜索按发布时间排序
    else if (url.indexOf('/www.52pojie.cn/search') != -1) {
        document.getElementById('orderby1').options[1].selected = true;
    }
    //吾爱去除所有官方置顶帖子
    else if (urlMacth('forum-41-') || urlMacth('forum-50-') || urlMacth('forum-8-') || urlMacth('forum-10-') || urlMacth('forum-10-')) {
        document.querySelector("#threadlisttableid").children[0].remove();
        let aList = document.querySelectorAll("#threadlisttableid tr > td.icn > a");
        for (let i = aList.length - 1; i > -1; i--) {
            let a = aList[i];
            if (a.getAttribute('title').indexOf('全局置顶主题') != -1) {
                a.closest('tbody').remove();
            }
        }
    }
    //吾爱去除所有官方置顶帖子
    else if (urlMacth('52pojie.cn/forum')) {
        let postList = document.querySelector("#threadlisttableid").children;
        for (let i = postList.length - 1; i > -1; i--) {
            let post = postList[i];
            if (post.querySelector("tr > th >em") == null) {
                post.remove();
            }
        }
    }
    //去除果核置顶推广内容，精简页面无用内容
    else if (url == 'https://www.ghxi.com/' || url.indexOf('://www.ghxi.com/?btwaf') != -1) {
        let ads = document.querySelectorAll("#modules-4 .item-sticky");
        for (let i = ads.length - 1; i > -1; i--) {
            ads[i].remove();
        }
        document.querySelector("#modules-13").remove();
        document.querySelector("#modules-15").remove();
        document.querySelector("#modules-18").remove();
        document.querySelector("#modules-2 > aside").remove();
        document.querySelector("#modules-16").remove();
        document.querySelector("#modules-17").remove();
        document.querySelector("#modules-14").remove();
        document.querySelector("#modules-7").remove();
        document.querySelector("body > footer").remove();
        //分享链接移除
        document.querySelector("body > div.action.action-style-0.action-color-0.action-pos-0 > div.action-item.j-share").remove();
        document.querySelector("#modules-2 > div").style.marginLeft = "15%";
        document.querySelector("body > footer").remove();

    }
    //精简果核帖子详情页面
    else if (url.indexOf('www.ghpym.com') != -1 && url.indexOf('.html') != -1) {
        // document.querySelector(".entry-bar-inner").remove();
        // document.querySelector(".entry-copyright").remove();
        // document.querySelector(".btn-zan").parentNode.parentNode.remove();
        // //分享链接移除
        // document.querySelector("body > div.action.action-style-0.action-color-0.action-pos-0.hide-gotop > div.action-item.j-share").remove();
        // let footer = document.querySelectorAll("container");
        // footer[footer.length - 1].remove();
    }
    //卡饭自动签到，只去除软件下载板块的版规和一个无用置顶内容
    else if (url.indexOf('https://bbs.kafan.cn/forum-65-1.html') != -1) {
        document.querySelector('.comeing_box').style.display = 'none';
        document.querySelectorAll('.bm')[2].style.display = 'none';
        //签到
        if (document.querySelector("#pper_b").style.display == 'none') {
            document.querySelector("#pper_a").click();
        }
    }

    function urlMacth(urlStr) {
        return url.indexOf(urlStr) != -1
    }
})();
