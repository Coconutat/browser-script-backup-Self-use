// ==UserScript==
// @name         zd423(423down)移动版精简去推广
// @namespace    https://github.com/Coconutat/browser-script-backup-Self-use/423down_mobile_ad_remove.user.js
// @version      0.1.alpha
// @description  zd423(423down)移动版精简去推广
// @author       by Cocoontat
// @match        https://www.423down.com/*
// @updateURL    https://raw.githubusercontent.com/Coconutat/browser-script-backup-Self-use/main/423down_mobile_ad_remove.user.js
// @icon         https://www.423down.com/wp-content/themes/D7/img/favicon.ico
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
