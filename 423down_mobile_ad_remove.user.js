// ==UserScript==
// @name         zd423(423down)移动版精简去推广
// @namespace    https://github.com/Coconutat/browser-script-backup-Self-use
// @version      0.1.alpha
// @description  页面精简去推广内容只留主内容，卡饭自动签到等功能，殁漂遥去推广请看介绍，不在此脚本
// @author       by Cocoontat
// @match        https://www.423down.com/*
// @namespace    https://raw.githubusercontent.com/Coconutat/browser-script-backup-Self-use/main/423down_mobile_ad_remove.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let url = window.location.href;

    if (url.indexOf('423down') != -1) {
        let li = document.querySelector("div#wrap > div.archive-list > ul.post-list").children;
        for (let i = li.length - 1; i > -1; i--) {
            let a = li[i].querySelectorAll('span');
            for (let j = a.length - 1; j > -1; j--) {
                if (a[j].innerText.indexOf('置顶') != -1){
                    li[i].remove();
                    break;
                }
            }
        }

    }
  })();