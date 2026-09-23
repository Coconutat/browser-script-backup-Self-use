// ==UserScript==
// @name         SteamDB DLC Extractor
// @namespace    http://tampermonkey.net/
// @version      v1.5
// @description  精准提取SteamDB DLC页面#dlc区域的DLC列表
// @author       Coconutat , Deepseek v4.1
// @match        https://steamdb.info/app/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        defaultCreamApiMode: true,
        filePrefix: 'steamdb_dlc_list'
    };

    let isCreamApiMode = CONFIG.defaultCreamApiMode;
    let extractedData = [];

    window.addEventListener('load', function() {
        setTimeout(initUI, 1000);
    });

    function initUI() {
        if (document.getElementById('dlc-extractor-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'dlc-extractor-panel';
        panel.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: #1b2838; border: 1px solid #66c0f4;
            border-radius: 4px; padding: 10px; z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-family: Arial, sans-serif; color: #c7d5e0;
            display: flex; flex-direction: column; gap: 6px; min-width: 230px;
        `;

        const title = document.createElement('div');
        title.textContent = 'DLC 提取工具 v1.5';
        title.style.cssText = 'font-weight: bold; color: #66c0f4; text-align: center; font-size: 13px;';
        panel.appendChild(title);

        const toggleLabel = document.createElement('label');
        toggleLabel.style.cssText = 'display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px;';
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = isCreamApiMode;
        const toggleText = document.createElement('span');
        toggleText.textContent = isCreamApiMode ? 'CreamAPI 格式 (=)' : '纯文本格式 (Tab)';
        toggleInput.addEventListener('change', (e) => {
            isCreamApiMode = e.target.checked;
            toggleText.textContent = isCreamApiMode ? 'CreamAPI 格式 (=)' : '纯文本格式 (Tab)';
        });
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleText);
        panel.appendChild(toggleLabel);

        const scanBtn = makeBtn('① 扫描 DLC 数据', '#66c0f4', '#1b2838', scanPage);
        panel.appendChild(scanBtn);

        const exportBtn = makeBtn('② 导出到文件', '#4c6b22', '#d2e885', () => {
            if (extractedData.length === 0) { alert('请先扫描。'); return; }
            generateFile();
        });
        panel.appendChild(exportBtn);

        const status = document.createElement('div');
        status.id = 'dlc-status';
        status.style.cssText = 'font-size: 11px; color: #8f98a0; text-align: center; min-height: 14px;';
        status.textContent = '等待操作…';
        panel.appendChild(status);

        document.body.appendChild(panel);
    }

    function makeBtn(text, bg, color, handler) {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = `background:${bg};color:${color};border:none;padding:7px 10px;border-radius:3px;cursor:pointer;font-weight:bold;font-size:12px;`;
        b.addEventListener('click', handler);
        return b;
    }

    // ===== 核心：精准定位 #dlc 区域 =====
    function scanPage() {
        const status = document.getElementById('dlc-status');
        extractedData = [];

        // 精准锁定 DLC 区域
        const dlcPane = document.querySelector('div#dlc');

        if (!dlcPane) {
            status.textContent = '未找到 #dlc 区域，页面可能未加载完';
            status.style.color = '#ff6b6b';
            alert('未找到 #dlc 区域。请确认当前是 /dlc/ 页面，且页面已完全加载。');
            return;
        }

        const table = dlcPane.querySelector('table');
        if (!table) {
            status.textContent = '#dlc 区域内没有表格';
            status.style.color = '#ff6b6b';
            return;
        }

        // 优先用 tr.app 定位 DLC 行（每行都有 data-appid 属性）
        let rows = table.querySelectorAll('tbody tr.app');
        if (rows.length === 0) {
            rows = table.querySelectorAll('tbody tr');
        }

        rows.forEach(row => {
            // 最可靠：直接读 data-appid 属性
            let appId = row.getAttribute('data-appid');
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return;

            // 备用：从链接提取
            if (!appId) {
                const link = cells[0].querySelector('a[href*="/app/"]');
                if (link) {
                    const m = link.href.match(/\/app\/(\d+)/);
                    if (m) appId = m[1];
                }
            }
            // 再备用：从第一列文本提取
            if (!appId) {
                const t = cells[0].textContent.trim();
                if (/^\d+$/.test(t)) appId = t;
            }

            const name = cells[1].textContent.trim();

            if (!appId || !/^\d+$/.test(appId) || !name) return;

            extractedData.push({ id: appId, name });
        });

        if (extractedData.length === 0) {
            status.textContent = '未提取到 DLC 行';
            status.style.color = '#ff6b6b';
            return;
        }

        status.textContent = `✓ 已提取 ${extractedData.length} 条 DLC`;
        status.style.color = '#a4d007';
        console.log(`已提取 ${extractedData.length} 条：`, extractedData);
    }

    // ===== 导出 =====
    function generateFile() {
        let content = '';
        const modeText = isCreamApiMode ? 'creamapi' : 'plain';
        extractedData.forEach(item => {
            content += isCreamApiMode ? `${item.id} = ${item.name}\n` : `${item.id}\t${item.name}\n`;
        });

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${CONFIG.filePrefix}_${modeText}_${timestamp}.txt`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        document.getElementById('dlc-status').textContent = `✓ 已导出 ${extractedData.length} 条`;
    }
})();