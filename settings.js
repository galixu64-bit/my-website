

function togglePasswordChange() {
    const form = document.getElementById('passwordChangeForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';

        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        hideMessage('passwordMessage');
    } else {
        form.style.display = 'none';
    }
}

function toggleEmailChange() {
    const form = document.getElementById('emailChangeForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';

        document.getElementById('newEmail').value = '';
        hideMessage('emailMessage');
    } else {
        form.style.display = 'none';
    }
}

function savePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    const t = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : key;
    };

    if (!currentPassword) {
        showMessage('passwordMessage', t('currentPasswordRequired'), 'error');
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showMessage('passwordMessage', t('passwordLengthError'), 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('passwordMessage', t('passwordMismatch'), 'error');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('passwordMessage', t('loginRequired'), 'error');
        return;
    }

    const fullUser = getUserByUsernameSync(currentUser.username);
    if (!fullUser) {
        showMessage('passwordMessage', t('userNotFound'), 'error');
        return;
    }

    if (fullUser.password !== currentPassword) {
        showMessage('passwordMessage', t('currentPasswordError'), 'error');
        return;
    }

    if (fullUser.password === newPassword) {
        showMessage('passwordMessage', t('passwordSameError'), 'error');
        return;
    }

    fullUser.password = newPassword;
    saveUserToDatabase(fullUser);

    showMessage('passwordMessage', t('passwordChangeSuccess'), 'success');

    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';

    setTimeout(() => {
        togglePasswordChange();
    }, 3000);
}

function saveEmail() {
    const newEmail = document.getElementById('newEmail').value.trim();

    const t = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : key;
    };

    if (!newEmail) {
        showMessage('emailMessage', t('emailRequired'), 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showMessage('emailMessage', t('emailInvalid'), 'error');
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('emailMessage', t('loginRequired'), 'error');
        return;
    }

    const fullUser = getUserByUsernameSync(currentUser.username);
    if (!fullUser) {
        showMessage('emailMessage', t('userNotFound'), 'error');
        return;
    }

    if (fullUser.email === newEmail) {
        showMessage('emailMessage', t('emailSameError'), 'error');
        return;
    }

    fullUser.email = newEmail;
    saveUserToDatabase(fullUser);

    updateEmailDisplay(newEmail);

    showMessage('emailMessage', t('emailChangeSuccess'), 'success');

    document.getElementById('newEmail').value = '';

    setTimeout(() => {
        toggleEmailChange();
    }, 3000);
}

function updateEmailDisplay(email) {
    const getTranslation = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : '未设置';
    };
    
    const emailDisplay = document.getElementById('currentEmailDisplay');
    if (emailDisplay) {
        emailDisplay.textContent = email || getTranslation('emailNotSet');
    }

    const infoEmail = document.getElementById('infoEmail');
    if (infoEmail) {
        infoEmail.textContent = email || getTranslation('emailNotSet');
    }
}

window.updateEmailDisplay = updateEmailDisplay;

function changeLanguageSetting(lang) {
    console.log('=== changeLanguageSetting 开始 ===');
    console.log('参数 lang:', lang);
    console.log('window.i18n 是否存在:', !!window.i18n);
    console.log('window.i18n.setLanguage 是否存在:', window.i18n ? typeof window.i18n.setLanguage : 'N/A');

    if (!lang || (lang !== 'zh' && lang !== 'en')) {
        console.warn('Invalid language value:', lang);
        return;
    }

    try {
        localStorage.setItem('language', lang);
        console.log('语言已保存到 localStorage:', lang);
    } catch (e) {
        console.error('保存语言到 localStorage 失败:', e);
    }

    if (window.i18n && typeof window.i18n.setLanguage === 'function') {
        console.log('使用 i18n.setLanguage');
        window.i18n.setLanguage(lang);
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                console.log('第一次强制更新页面内容');
                window.i18n.updatePage();
            }
            updateLanguageDisplay(lang);
            updateBrowserLanguageDisplay();
        }, 300);
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                console.log('第二次更新页面内容');
                window.i18n.updatePage();
            }
            updateLanguageDisplay(lang);
        }, 700);
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                console.log('第三次更新页面内容（确保所有元素都更新）');
                window.i18n.updatePage();
            }
        }, 1000);
    } else if (window.switchLanguage && typeof window.switchLanguage === 'function') {
        console.log('使用 window.switchLanguage');
        window.switchLanguage(lang);
        setTimeout(function() {
            updateLanguageDisplay(lang);
            updateBrowserLanguageDisplay();
        }, 100);
    } else {
        console.warn('没有可用的语言切换方法，直接更新');

        if (window.i18n) {
            window.i18n.currentLang = lang;
            if (typeof window.i18n.updatePage === 'function') {
                window.i18n.updatePage();
            }
        }
        updateLanguageDisplay(lang);
        updateBrowserLanguageDisplay();
    }
    
    console.log('=== changeLanguageSetting 完成，语言已改为:', lang, '===');
}

window.changeLanguageSetting = changeLanguageSetting;

function updateLanguageDisplay(lang) {
    const getTranslation = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : key;
    };
    
    const langDisplay = document.getElementById('currentLanguageDisplay');
    if (langDisplay) {
        langDisplay.textContent = lang === 'zh' ? '中文' : 'English';
    }

    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = lang;
    }

    updateBrowserLanguageDisplay();
}

function initThemeSettings() {
    console.log('初始化主题设置...');
    
    if (typeof window.getTheme === 'function') {
        const currentTheme = window.getTheme();
        console.log('当前主题:', currentTheme);
        
        updateThemeDisplay(currentTheme);
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = currentTheme || 'system';
        }
    } else {
        console.warn('window.getTheme 函数不可用');
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            const root = document.documentElement;
            if (root.classList.contains('dark-theme')) {
                themeSelect.value = 'dark';
                updateThemeDisplay('dark');
            } else if (root.classList.contains('light-theme')) {
                themeSelect.value = 'light';
                updateThemeDisplay('light');
            } else {
                themeSelect.value = 'system';
                updateThemeDisplay('system');
            }
        }
    }
}

function updateThemeDisplay(theme) {
    const getTranslation = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : key;
    };
    
    const themeDisplay = document.getElementById('currentThemeDisplay');
    if (themeDisplay) {
        let themeText = '';
        if (theme === 'system') {
            themeText = getTranslation('themeSystem');
        } else if (theme === 'light') {
            themeText = getTranslation('themeLight');
        } else if (theme === 'dark') {
            themeText = getTranslation('themeDark');
        } else {
            themeText = theme || '-';
        }
        themeDisplay.textContent = themeText;
    }
}

function handleThemeSelectChange(theme) {
    console.log('切换主题:', theme);
    
    if (typeof window.setTheme === 'function') {
        window.setTheme(theme);
        updateThemeDisplay(theme);
        console.log('主题已切换为:', theme);
        
        const event = new CustomEvent('themeChanged', { detail: { theme: theme } });
        window.dispatchEvent(event);
    } else {
        console.warn('window.setTheme 函数不可用');
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.remove('light-theme');
            root.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            updateThemeDisplay('dark');
        } else if (theme === 'light') {
            root.classList.remove('dark-theme');
            root.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            updateThemeDisplay('light');
        } else {
            const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            if (systemTheme === 'dark') {
                root.classList.remove('light-theme');
                root.classList.add('dark-theme');
            } else {
                root.classList.remove('dark-theme');
                root.classList.add('light-theme');
            }
            localStorage.setItem('theme', 'system');
            updateThemeDisplay('system');
        }
        
        const event = new CustomEvent('themeChanged', { detail: { theme: theme } });
        window.dispatchEvent(event);
    }
}

window.handleThemeSelectChange = handleThemeSelectChange;

function updateBrowserLanguageDisplay() {
    const browserLangDisplay = document.getElementById('browserLanguageDisplay');
    if (!browserLangDisplay) {
        console.warn('browserLanguageDisplay element not found');
        return;
    }
    
    try {
        let browserLang = 'zh-CN';
        let detectedLang = 'zh';
        
        if (window.getBrowserLanguage && typeof window.getBrowserLanguage === 'function') {
            browserLang = window.getBrowserLanguage();
        } else {
            try {
                browserLang = navigator.language || navigator.userLanguage || 
                    (navigator.languages && navigator.languages[0]) || 'zh-CN';
            } catch (e) {
            }
        }
        
        if (window.detectBrowserLanguage && typeof window.detectBrowserLanguage === 'function') {
            detectedLang = window.detectBrowserLanguage();
        } else {
            try {
                const langCode = browserLang.toLowerCase().split('-')[0];
                detectedLang = (langCode === 'zh' || langCode === 'en') ? langCode : 'zh';
            } catch (e) {
            }
        }

        const detectedName = detectedLang === 'zh' ? '中文' : 'English';
        browserLangDisplay.textContent = `${browserLang} (${detectedName})`;

        const currentLang = localStorage.getItem('language') || 'zh';
        if (false && detectedLang !== currentLang) {
            browserLangDisplay.style.color = '#888';
            browserLangDisplay.title = '浏览器检测到的语言与当前设置不同';
        } else {
            browserLangDisplay.style.color = '#10b981';
        }
    } catch (e) {
        console.error('更新浏览器语言显示失败:', e);
        browserLangDisplay.textContent = '无法检测';
    }
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = 'settings-message ' + type;
        messageEl.style.display = 'block';

        setTimeout(() => {
            hideMessage(elementId);
        }, type === 'error' ? 5000 : 3000);
    }
}

function hideMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.style.display = 'none';
        messageEl.className = 'settings-message';
        messageEl.textContent = '';
    }
}

function getJSONStorageInputs() {
    return {
        apiKeyInput: document.getElementById('jsonStorageApiKey'),
        binIdInput: document.getElementById('jsonStorageBinId'),
        messageDiv: document.getElementById('jsonStorageMessage')
    };
}

function initJSONStorageSettings() {
    const { apiKeyInput, binIdInput, messageDiv } = getJSONStorageInputs();
    if (!apiKeyInput || !binIdInput) {
        return;
    }

    if (window.jsonStorage && typeof window.jsonStorage.loadConfig === 'function') {
        const config = window.jsonStorage.loadConfig();
        if (config) {
            if (config.apiKey) {
                apiKeyInput.value = config.apiKey;
            }
            if (config.binId) {
                binIdInput.value = config.binId;
            }
        }
    }

    if (messageDiv) {
        messageDiv.style.display = 'none';
        messageDiv.className = 'settings-message';
        messageDiv.textContent = '';
    }
}

window.saveJSONStorageConfig = function() {
    const { apiKeyInput, binIdInput, messageDiv } = getJSONStorageInputs();
    if (!apiKeyInput || !messageDiv) {
        return;
    }

    const apiKey = (apiKeyInput.value || '').trim();
    const binId = (binIdInput && binIdInput.value ? binIdInput.value.trim() : '') || null;

    if (!apiKey) {
        showMessage('jsonStorageMessage', '请先填写 API Key', 'error');
        return;
    }

    if (!window.jsonStorage || typeof window.jsonStorage.setConfig !== 'function') {
        showMessage('jsonStorageMessage', '配置失败：jsonStorage 未初始化', 'error');
        return;
    }

    try {
        window.jsonStorage.setConfig(binId, apiKey);
        if (binIdInput && binId) {
            binIdInput.value = binId;
        }
        showMessage('jsonStorageMessage', '✅ 配置已保存！', 'success');
    } catch (error) {
        showMessage('jsonStorageMessage', '保存配置失败：' + (error.message || '未知错误'), 'error');
    }
};

window.testJSONStorageConnection = async function() {
    const { apiKeyInput, binIdInput, messageDiv } = getJSONStorageInputs();
    if (!apiKeyInput || !messageDiv) {
        return;
    }

    const apiKey = (apiKeyInput.value || '').trim();
    let binId = (binIdInput && binIdInput.value ? binIdInput.value.trim() : '') || null;

    if (!apiKey) {
        showMessage('jsonStorageMessage', '请先填写 API Key', 'error');
        return;
    }

    if (!window.jsonStorage) {
        showMessage('jsonStorageMessage', '测试失败：jsonStorage 未加载', 'error');
        return;
    }

    try {
        showMessage('jsonStorageMessage', '正在测试连接...', '');
        window.jsonStorage.setConfig(binId, apiKey);

        let result;
        if (binId) {
            result = await window.jsonStorage.load();
        } else {
            result = await window.jsonStorage.create([]);
            if (result.success && result.binId) {
                binId = result.binId;
                if (binIdInput) {
                    binIdInput.value = binId;
                }
                window.jsonStorage.setConfig(binId, apiKey);
            }
        }

        if (result && result.success) {
            const count = Array.isArray(result.data) ? result.data.length : (result.data?.record ? result.data.record.length : 0);
            showMessage('jsonStorageMessage', `✅ 连接成功！当前资源数量：${count}`, 'success');
        } else {
            showMessage('jsonStorageMessage', `❌ 连接失败：${result ? result.error : '未知错误'}`, 'error');
        }
    } catch (error) {
        showMessage('jsonStorageMessage', '❌ 测试失败：' + (error.message || '未知错误'), 'error');
    }
};

function initSettings() {
    console.log('initSettings 开始执行');
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.warn('用户未登录，无法初始化设置');
        return;
    }

    const fullUser = getUserByUsernameSync(currentUser.username);
    if (fullUser && fullUser.email) {
        updateEmailDisplay(fullUser.email);
    }

    function initLanguageSettings() {
        let savedLang = localStorage.getItem('language');
        
        if (!savedLang) {
            if (window.detectBrowserLanguage && typeof window.detectBrowserLanguage === 'function') {
                savedLang = window.detectBrowserLanguage();
                if (savedLang) {
                    localStorage.setItem('language', savedLang);
                }
            } else {
                try {
                    const browserLang = navigator.language || navigator.userLanguage || 
                        (navigator.languages && navigator.languages[0]) || 'zh-CN';
                    const langCode = browserLang.toLowerCase().split('-')[0];
                    savedLang = (langCode === 'zh' || langCode === 'en') ? langCode : 'zh';
                    localStorage.setItem('language', savedLang);
                } catch (e) {
                    savedLang = 'zh';
                }
            }
        }
        
        if (!savedLang) {
            savedLang = 'zh';
        }
        
        if (window.i18n) {
            if (window.i18n.currentLang !== savedLang) {
                if (window.i18n.setLanguage) {
                    window.i18n.setLanguage(savedLang);
                } else {
                    window.i18n.currentLang = savedLang;
                }
            }
            
            if (typeof window.i18n.init === 'function') {
                window.i18n.init();
            }
        } else {
            localStorage.setItem('language', savedLang);
        }
        
        updateLanguageDisplay(savedLang);
        updateBrowserLanguageDisplay();

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = savedLang;
        }
    }

    setTimeout(function() {
        initLanguageSettings();
    }, 100);

    setTimeout(function() {
        updateBrowserLanguageDisplay();
    }, 500);

    initJSONStorageSettings();

    const btnSaveJSON = document.getElementById('btnSaveJSONStorage');
    if (btnSaveJSON) {
        btnSaveJSON.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof window.saveJSONStorageConfig === 'function') {
                window.saveJSONStorageConfig();
            }
        });
    }

    const btnTestJSON = document.getElementById('btnTestJSONStorage');
    if (btnTestJSON) {
        btnTestJSON.addEventListener('click', async function (e) {
            e.preventDefault();
            if (typeof window.testJSONStorageConnection === 'function') {
                await window.testJSONStorageConnection();
            }
        });
    }

    window.addEventListener('languageChanged', function(e) {
        const lang = e.detail ? e.detail.lang : (localStorage.getItem('language') || 'zh');
        updateLanguageDisplay(lang);
        updateBrowserLanguageDisplay();

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = lang;
        }
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                window.i18n.updatePage();
            }
        }, 100);
    });
    
    if (window.i18n) {
        if (typeof window.i18n.init === 'function') {
            window.i18n.init();
        }
        
        setTimeout(function() {
            updateBrowserLanguageDisplay();
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                window.i18n.updatePage();
            }
        }, 500);
    } else {
        console.warn('i18n 未加载，延迟重试...');
        setTimeout(function() {
            if (window.i18n) {
                updateBrowserLanguageDisplay();
            } else {
                console.error('i18n 仍未加载');
            }
        }, 1000);
    }
}

function t(key) {
    return (window.i18n && typeof window.i18n.t === 'function') 
        ? window.i18n.t(key) 
        : key;
}

