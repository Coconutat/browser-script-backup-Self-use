// ==UserScript==
// @name         zd423|吾爱|果核|卡饭 精简去推广 + 423Down 跳过中转（合并优化版）
// @namespace    https://github.com/Coconutat/browser-script-backup-Self-use
// @version      1.0.0
// @description  页面精简去推广只留主内容，卡饭自动签到；合并 423Down/PotPlayer 跳过 go.php 中转。安全判空优化版。
// @author       Aerozb, pana, Cocoontat
// @license      GNU GPLv3
// @icon         https://www.423down.com/wp-content/themes/D7/img/favicon.ico
// @updateURL    "https://raw.githubusercontent.com/Coconutat/browser-script-backup-Self-use/main/423down_ad_remove_go_bypass.js"
// @match        *://*.423down.com/*
// @match        *://*.potplayer.org/*
// @match        http://bbs.zhiyoo.net/search.php*
// @match        https://www.52pojie.cn/search.php*
// @match        https://www.52pojie.cn/forum*
// @match        https://www.ghxi.com/*
// @match        https://bbs.kafan.cn/forum-65-1.html*
// @match        *://www.ghpym.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const url = location.href;
    const has = (s) => url.includes(s);
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const remove = (sel, root = document) => {
        const el = $(sel, root);
        if (el) el.remove();
    };

    const removeAll = (sel, root = document) => {
        $$(sel, root).forEach(el => el.remove());
    };

    // 423Down 去推广
    function clean423down() {
        remove('#hasfixed > div.wrapper > div.sidebar > div:nth-child(2)');

        const ul = $('#hasfixed > div.wrapper > div.content-wrap > div > ul');
        if (!ul) return;

        const adKeywords = [
            '默认分类',
            '优惠',
            '莆田',
            '免费',
            '无广告',
            '推荐',
            '限时',
            '纯净尊享',
            '免费纯净',
            '免费的资源搜索神器',
            '免费尊享',
            '产品推广',
            '模型',
            '解锁',
            'codex'
        ];

        const items = Array.from(ul.children);

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            const links = item.querySelectorAll('a');

            for (const a of links) {
                const text = (a.textContent || '').trim();
                if (adKeywords.some(k => text.includes(k))) {
                    item.remove();
                    break;
                }
            }
        }
    }

    // 智友搜索按发布时间排序，精简多余内容
    function cleanZhiyoo() {
        remove('#scform > tbody > tr > td:nth-child(1) > h1 > img');
        remove('#ct > div > div > div.sttl.mbn');

        const order = document.getElementById('orderby1');
        if (order && order.options[1]) {
            order.options[1].selected = true;
        }
    }

    // 吾爱搜索按发布时间排序
    function order52pojieSearch() {
        const order = document.getElementById('orderby1');
        if (order && order.options[1]) {
            order.options[1].selected = true;
        }
    }

    // 吾爱论坛去官方置顶
    function clean52pojieForum() {
        const table = document.getElementById('threadlisttableid');
        if (!table) return;

        const specificForum = /forum-(41|50|8|10)-/.test(url);

        if (specificForum) {
            if (table.children[0]) {
                table.children[0].remove();
            }

            $$('#threadlisttableid tr > td.icn > a').forEach(a => {
                const title = a.getAttribute('title') || '';
                if (title.includes('全局置顶主题')) {
                    const tbody = a.closest('tbody');
                    if (tbody) tbody.remove();
                }
            });
        } else {
            Array.from(table.children).forEach(post => {
                if (!post.querySelector('tr > th > em')) {
                    post.remove();
                }
            });
        }
    }

    // 果核首页去推广、精简页面
    function cleanGhxi() {
        const isGhxiHome =
            location.hostname === 'www.ghxi.com' &&
            (location.pathname === '/' || url.includes('?btwaf'));

        if (!isGhxiHome) return;

        removeAll('#modules-4 .item-sticky');

        [
            '#modules-13',
            '#modules-15',
            '#modules-18',
            '#modules-2 > aside',
            '#modules-16',
            '#modules-17',
            '#modules-14',
            '#modules-7',
            'body > footer',
            'body > div.action.action-style-0.action-color-0.action-pos-0 > div.action-item.j-share'
        ].forEach(sel => remove(sel));

        const modules2 = document.querySelector('#modules-2 > div');
        if (modules2) {
            modules2.style.marginLeft = '15%';
        }
    }

    // 卡饭自动签到，并隐藏部分无用内容
    function kafanAutoSign() {
        const comeingBox = document.querySelector('.comeing_box');
        if (comeingBox) {
            comeingBox.style.display = 'none';
        }

        const bms = document.querySelectorAll('.bm');
        if (bms[2]) {
            bms[2].style.display = 'none';
        }

        const pperB = document.querySelector('#pper_b');
        const pperA = document.querySelector('#pper_a');

        if (pperB && pperA && pperB.style.display === 'none') {
            pperA.click();
        }
    }

    // 合并进来的 423Down / PotPlayer 跳过 go.php 中转
    function bypassGoLinks(root = document) {
        if (!root || !root.querySelectorAll) return;

        const links = root.querySelectorAll('a[href*="go.php?url"]');

        links.forEach(a => {
            const rawHref = a.getAttribute('href') || a.href || '';
            const text = (a.textContent || '').trim();

            let target = '';

            // 如果链接文字本身就是完整 URL，优先使用
            if (/^https?:\/\//i.test(text)) {
                target = text;
            } else {
                // 优先从原始 href 中截取 go.php?url= 后面的完整内容
                const rawMatch = rawHref.match(/go\.php\?url=(.+)$/i);
                if (rawMatch) {
                    target = rawMatch[1];
                } else {
                    try {
                        const u = new URL(rawHref, location.href);
                        target = u.searchParams.get('url') || '';
                    } catch (e) {
                        target = '';
                    }
                }

                // 兜底：普通 ?url= / &url=
                if (!target) {
                    const m = rawHref.match(/[?&]url=([^&]+)/i);
                    if (m) target = m[1];
                }

                try {
                    target = decodeURIComponent(target);
                } catch (e) {
                    // 解码失败就保留原值
                }
            }

            if (!target) return;

            target = target.trim();

            // 协议相对地址
            if (/^\/\//.test(target)) {
                target = location.protocol + target;
            }

            // 只写了域名的情况，补 http://
            if (
                !/^https?:\/\//i.test(target) &&
                /^[\w.-]+\.[a-z]{2,}(?::\d+)?(?:\/|$)/i.test(target)
            ) {
                target = 'http://' + target;
            }

            if (/^https?:\/\//i.test(target)) {
                a.href = target;
                a.setAttribute('data-go-bypassed', '1');
            }
        });
    }

    // 监听动态插入的链接，主要用于 423Down / PotPlayer
    function observeGoLinks() {
        if (!/(^|\.)423down\.com$|(^|\.)potplayer\.org$/i.test(location.hostname)) {
            return;
        }

        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;

                    if (node.matches && node.matches('a[href*="go.php?url"]')) {
                        bypassGoLinks(node.parentNode || document);
                    } else if (node.querySelectorAll) {
                        bypassGoLinks(node);
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    function main() {
        if (has('423down.com')) {
            clean423down();
        } else if (has('bbs.zhiyoo.net/search')) {
            cleanZhiyoo();
        } else if (has('52pojie.cn/search')) {
            order52pojieSearch();
        } else if (has('52pojie.cn/forum')) {
            clean52pojieForum();
        } else if (has('www.ghxi.com')) {
            cleanGhxi();
        } else if (has('www.ghpym.com') && has('.html')) {
            // 原脚本此处为空，保留占位
        } else if (has('bbs.kafan.cn/forum-65-1.html')) {
            kafanAutoSign();
        }

        // 所有匹配站点都执行一次，内部只处理 go.php?url 链接
        bypassGoLinks(document);
        observeGoLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main, { once: true });
    } else {
        main();
    }
})();