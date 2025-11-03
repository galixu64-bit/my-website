
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
        let theme = 'system';
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'system' || savedTheme === 'light' || savedTheme === 'dark') {
                if (savedTheme === 'system') {
                    theme = detectSystemTheme();
                } else {
                    theme = savedTheme;
                }
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
                const systemTheme = detectSystemTheme();
                localStorage.setItem('theme', 'system');
                applyTheme(systemTheme);
            } else {
                localStorage.setItem('theme', theme);
                applyTheme(theme);
            }
            
            const event = new CustomEvent('themeChanged', { detail: { theme: theme } });
            window.dispatchEvent(event);
        }
    };
    
    window.getTheme = function() {
        try {
            return localStorage.getItem('theme') || 'system';
        } catch (e) {
            return 'system';
        }
    };
})();

