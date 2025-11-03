
(function() {
    'use strict';

    function detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.remove('light-theme');
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
            root.classList.add('light-theme');
        }

        try {
            localStorage.setItem('theme', theme);
        } catch (e) {

        }
    }

    function initTheme() {

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

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', function(e) {

                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme || savedTheme === 'system') {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

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

