// 主题色系统 - 跟随浏览器颜色设置
(function() {
    'use strict';
    
    // 检测系统主题
    function detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    // 应用主题
    function applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.remove('light-theme');
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
            root.classList.add('light-theme');
        }
        
        // 保存主题偏好（可选，允许用户手动覆盖）
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            // 忽略存储错误
        }
    }
    
    // 初始化主题
    function initTheme() {
        // 优先使用保存的主题，否则使用系统主题
        let theme = 'dark';
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                theme = savedTheme;
            } else {
                theme = detectSystemTheme();
            }
        } catch (e) {
            theme = detectSystemTheme();
        }
        
        applyTheme(theme);
        
        // 监听系统主题变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', function(e) {
                // 只有在用户没有手动设置主题时才跟随系统
                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme || savedTheme === 'system') {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    // 页面加载时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
    
    // 暴露手动切换主题的函数（供高级用户使用）
    window.setTheme = function(theme) {
        if (theme === 'dark' || theme === 'light' || theme === 'system') {
            if (theme === 'system') {
                theme = detectSystemTheme();
                localStorage.setItem('theme', 'system');
            } else {
                localStorage.setItem('theme', theme);
            }
            applyTheme(theme);
        }
    };
    
    window.getTheme = function() {
        return localStorage.getItem('theme') || 'system';
    };
})();

