// ==UserScript==
// @name         Apple Music Album Art Grabber
// @namespace    https://github.com/Coconutat/browser-script-backup-Self-use/Apple_Music_Album_Art_Grabber.user.js
// @version      0.1
// @description  获取并转换Apple Music专辑封面链接
// @author       Coconutat,Deepseek
// @match        https://music.apple.com/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加UI样式
    GM_addStyle(`
        .art-grabber-container {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            max-width: 400px;
        }
        .art-grabber-title {
            margin: 0 0 10px 0;
            font-size: 16px;
            color: #fff;
        }
        .art-grabber-url {
            word-break: break-all;
            margin: 10px 0;
            font-size: 12px;
            color: #66c2ff;
        }
        .art-grabber-buttons {
            display: flex;
            gap: 10px;
        }
        .art-grabber-button {
            background: #0070c9;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        }
        .art-grabber-button:hover {
            background: #0059a1;
        }
    `);

    function createUI(imageUrl) {
        const container = document.createElement('div');
        container.className = 'art-grabber-container';

        container.innerHTML = `
            <h3 class="art-grabber-title">专辑封面抓取器</h3>
            <div class="art-grabber-url">${imageUrl}</div>
            <div class="art-grabber-buttons">
                <button class="art-grabber-button" id="copy-url">复制链接</button>
                <button class="art-grabber-button" id="download-image">下载图片</button>
            </div>
        `;

        document.body.appendChild(container);

        // 复制功能
        container.querySelector('#copy-url').addEventListener('click', () => {
            GM_setClipboard(imageUrl, 'text');
            alert('链接已复制到剪贴板！');
        });

        // 下载功能
        container.querySelector('#download-image').addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'album_artwork.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    function processImageUrl(srcset) {
        // 获取第一个有效的图片URL
        const baseUrl = srcset.split(',')[0].trim().split(' ')[0];
        // 转换尺寸和格式
        return baseUrl.replace(/\/(\d+x\d+bb)[^/]*(\..*?)$/, '/4000x4000bb-60.png');
    }

    function findAlbumArt() {
        const xpath = '/html/body/div/div/div[4]/main/div/div[1]/div/div/div[3]/div[1]/div/picture/source[1]';
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        if (result.singleNodeValue) {
            const srcset = result.singleNodeValue.getAttribute('srcset');
            if (srcset) {
                const processedUrl = processImageUrl(srcset);
                createUI(processedUrl);
                return true;
            }
        }
        return false;
    }

    // 等待页面加载
    const observer = new MutationObserver(() => {
        if (findAlbumArt()) {
            observer.disconnect();
        }
    });

    // 开始观察DOM变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初始检查
    if (findAlbumArt()) {
        observer.disconnect();
    }
})();
