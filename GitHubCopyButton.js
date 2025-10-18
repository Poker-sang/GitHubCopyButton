// ==UserScript==
// @name         Github copy clone command button
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Add a 1-click copy button with the "git clone --recurse-submodules ..." command, after the Code button on the GitHub repository page
// @author       Poker powered by Copilot
// @match        https://github.com/*
// @grant        GM_setClipboard
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    function getCloneCmd() {
        const match = location.pathname.match(/^\/([^\/]+)\/([^\/]+)(\/|$)/);
        if (!match) return null;
        return `git clone --recurse-submodules https://github.com/${match[1]}/${match[2]}.git`;
    }

    function copyCloneCmd(cmd) {
        if (!cmd) return;
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(cmd);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(cmd);
        }
        showTip(`Copied: ${cmd}`);
    }

    function showTip(msg) {
        const tip = document.createElement('div');
        tip.textContent = msg;
        tip.style.position = 'fixed';
        tip.style.top = '20px';
        tip.style.right = '20px';
        tip.style.background = '#28a745';
        tip.style.color = '#fff';
        tip.style.padding = '8px 16px';
        tip.style.borderRadius = '6px';
        tip.style.zIndex = 9999;
        tip.style.fontSize = '16px';
        tip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        document.body.appendChild(tip);
        setTimeout(() => tip.remove(), 1800);
    }

    function addCopyButton() {
        const cmd = getCloneCmd();
        if (!cmd) return;

        const codeBtn = Array.from(document.getElementsByClassName('prc-Button-ButtonBase-c50BI')).find(
            btn => btn.textContent.trim() === 'Code'
        );
        if (!codeBtn) return;
        if (document.getElementById('copy-clone-submodules-btn')) return;

        // SVG字符串多行可读
        const svg = `
<svg aria-hidden="true" focusable="false" class="octicon octicon-copy" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align: text-bottom;">
  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
</svg>
        `.trim();

        // 克隆Code按钮
        const copyBtn = codeBtn.cloneNode(true);
        copyBtn.id = 'copy-clone-submodules-btn';

        // 替换内容为SVG
        const contentSpan = copyBtn.querySelector('[data-component="buttonContent"]');
        if (contentSpan) {
            contentSpan.innerHTML = svg;
        } else {
            copyBtn.innerHTML = svg;
        }

        // 设置title为命令内容
        copyBtn.title = cmd;

        // 移除aria-haspopup等下拉相关属性
        copyBtn.removeAttribute('aria-haspopup');
        copyBtn.removeAttribute('aria-expanded');
        copyBtn.removeAttribute('aria-describedby');

        // 绑定复制事件
        copyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            copyCloneCmd(cmd);
        });

        // 插入到Code按钮后
        codeBtn.parentNode.insertBefore(copyBtn, codeBtn.nextSibling);
    }

    // 监听页面变化（支持pjax和动态加载）
    const observer = new MutationObserver(addCopyButton);
    observer.observe(document.body, { childList: true, subtree: true });
    addCopyButton();
})();
