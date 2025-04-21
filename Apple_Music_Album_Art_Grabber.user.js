// ==UserScript==
// @name         Apple Music Album Art Grabber Pro+
// @namespace    https://github.com/Coconutat/browser-script-backup-Self-use/Apple_Music_Album_Art_Grabber.user.js
// @version      0.3
// @description  Apple Music专辑封面获取工具
// @author       Coconutat,Deepseek
// @match        https://music.apple.com/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 样式配置
    GM_addStyle(`
        .art-grabber-container {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            width: 450px;
            backdrop-filter: blur(8px);
        }
        .art-grabber-title {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .art-grabber-album-section {
            margin-bottom: 15px;
        }
        .art-grabber-album-compact {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 5px;
            color: #fff;
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .art-grabber-album-full {
            display: none;
            font-size: 14px;
            line-height: 1.4;
            max-height: 150px;
            overflow-y: auto;
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 4px;
            word-break: break-word;
            white-space: pre-wrap;
        }
        .art-grabber-album-full.active {
            display: block;
        }
        .art-grabber-url {
            word-break: break-all;
            margin: 15px 0;
            font-size: 13px;
            color: #66c2ff;
            line-height: 1.4;
        }
        .art-grabber-buttons {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .art-grabber-button {
            background: #0070c9;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        .art-grabber-button:hover {
            background: #0059a1;
            transform: translateY(-1px);
        }
        .art-grabber-button:active {
            transform: translateY(0);
        }
        .art-grabber-button.copy-name {
            background: #666;
        }
        .art-grabber-button.copy-name:hover {
            background: #555;
        }
    `);

    // 核心功能
    function initialize() {
        removeExistingUI();
        const albumName = getAlbumName();
        const imageUrl = getProcessedImageUrl();

        if (imageUrl) {
            createUI(albumName, imageUrl);
            return true;
        }
        return false;
    }

    function removeExistingUI() {
        const existingUI = document.querySelector('.art-grabber-container');
        if (existingUI) existingUI.remove();
    }

    // 获取专辑名称
    function getAlbumName() {
        try {
            const xpath = '/html/body/div/div/div[4]/main/div/div[1]/div/div/div[1]/h1/span[1]';
            const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            );
            return result.singleNodeValue?.textContent?.trim() || '';
        } catch (e) {
            console.warn('[Album Grabber] 专辑名称获取失败:', e);
            return '';
        }
    }

    // 获取处理后的图片URL
    function getProcessedImageUrl() {
        try {
            const xpath = '/html/body/div/div/div[4]/main/div/div[1]/div/div/div[3]/div[1]/div/picture/source[1]';
            const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            );
            const sourceNode = result.singleNodeValue;
            if (!sourceNode) return null;

            const srcset = sourceNode.getAttribute('srcset');
            if (!srcset) return null;

            const baseUrl = srcset.split(',')[0].trim().split(' ')[0];
            return baseUrl.replace(/\/(\d+x\d+bb)[^/]*(\..*?)$/, '/4000x4000bb-60.png');
        } catch (e) {
            console.error('[Album Grabber] 图片处理失败:', e);
            return null;
        }
    }

    // 创建增强UI
    function createUI(albumName, imageUrl) {
        const container = document.createElement('div');
        container.className = 'art-grabber-container';

        container.innerHTML = `
            <h3 class="art-grabber-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                专辑工具
            </h3>
            <div class="art-grabber-album-section">
                ${albumName ? `
                <div class="art-grabber-album-compact" title="点击展开完整名称">${albumName}</div>
                <div class="art-grabber-album-full">${albumName}</div>
                ` : ''}
            </div>
            <div class="art-grabber-url">${imageUrl}</div>
            <div class="art-grabber-buttons">
                <button class="art-grabber-button" id="copy-url">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    复制链接
                </button>
                <button class="art-grabber-button copy-name" id="copy-name">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v2h10V5h2v14z"/>
                    </svg>
                    复制名称
                </button>
                <button class="art-grabber-button" id="download-image">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    下载图片
                </button>
            </div>
        `;

        document.body.appendChild(container);

        // 专辑名展开/收起功能
        const compactName = container.querySelector('.art-grabber-album-compact');
        const fullName = container.querySelector('.art-grabber-album-full');
        if (compactName && fullName) {
            compactName.addEventListener('click', () => {
                fullName.classList.toggle('active');
            });
        }

        // 事件绑定
        bindEvents(container, albumName, imageUrl);
    }

    function bindEvents(container, albumName, imageUrl) {
        // 复制链接
        container.querySelector('#copy-url').addEventListener('click', () => {
            GM_setClipboard(imageUrl, 'text');
            showToast('✅ 链接已复制');
        });

        // 复制专辑名
        container.querySelector('#copy-name').addEventListener('click', () => {
            if (albumName) {
                GM_setClipboard(albumName, 'text');
                showToast('✅ 专辑名已复制');
            } else {
                showToast('⚠️ 未找到专辑名');
            }
        });

        // 下载图片
        container.querySelector('#download-image').addEventListener('click', () => {
            const fileName = albumName ?
                `${safeFileName(albumName)}.png` :
                `album_${Date.now()}.png`;

            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('⏬ 开始下载...');
        });
    }

    // 工具函数
    function safeFileName(name) {
        return name.replace(/[\\/:*?"<>|]/g, '_')
                   .replace(/\s+/g, ' ')
                   .substring(0, 100);
    }

    function showToast(message) {
        // 保持之前的toast实现
    }

    // 页面监听逻辑
    let observer;
    function initObserver() {
        observer = new MutationObserver((mutations) => {
            if (document.body) {
                initialize();
                observer.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // 启动逻辑
    if (document.readyState === 'complete') {
        initialize();
    } else {
        window.addEventListener('load', initialize);
        initObserver();
    }
})();
