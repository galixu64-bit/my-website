

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
            console.log('使用 window.getBrowserLanguage:', browserLang);
        } else {
            try {
                browserLang = navigator.language || navigator.userLanguage || 
                    (navigator.languages && navigator.languages[0]) || 'zh-CN';
                console.log('直接从 navigator 获取:', browserLang);
            } catch (e) {
                console.error('无法从 navigator 获取语言:', e);
            }
        }
        
        if (window.detectBrowserLanguage && typeof window.detectBrowserLanguage === 'function') {
            detectedLang = window.detectBrowserLanguage();
            console.log('使用 window.detectBrowserLanguage:', detectedLang);
        } else {
            try {
                const langCode = browserLang.toLowerCase().split('-')[0];
                detectedLang = (langCode === 'zh' || langCode === 'en') ? langCode : 'zh';
                console.log('从浏览器语言代码解析:', detectedLang);
            } catch (e) {
                console.error('无法解析浏览器语言:', e);
            }
        }

        const detectedName = detectedLang === 'zh' ? '中文' : 'English';
        browserLangDisplay.textContent = `${browserLang} (${detectedName})`;

        const currentLang = localStorage.getItem('language') || 'zh';
        if (detectedLang !== currentLang) {
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
        console.log('初始化语言设置...');
        console.log('window.i18n 是否存在:', !!window.i18n);
        console.log('window.detectBrowserLanguage 是否存在:', typeof window.detectBrowserLanguage);
        console.log('window.getBrowserLanguage 是否存在:', typeof window.getBrowserLanguage);
        
        let savedLang = localStorage.getItem('language');
        console.log('localStorage 中的语言:', savedLang);
        
        if (!savedLang) {
            if (window.detectBrowserLanguage && typeof window.detectBrowserLanguage === 'function') {
                savedLang = window.detectBrowserLanguage();
                console.log('从 detectBrowserLanguage 获取:', savedLang);
                if (savedLang) {
                    localStorage.setItem('language', savedLang);
                }
            } else {
                try {
                    const browserLang = navigator.language || navigator.userLanguage || 
                        (navigator.languages && navigator.languages[0]) || 'zh-CN';
                    const langCode = browserLang.toLowerCase().split('-')[0];
                    savedLang = (langCode === 'zh' || langCode === 'en') ? langCode : 'zh';
                    console.log('直接从浏览器解析语言:', savedLang, '来自:', browserLang);
                    localStorage.setItem('language', savedLang);
                } catch (e) {
                    console.error('解析浏览器语言失败:', e);
                    savedLang = 'zh';
                }
            }
        }
        
        if (!savedLang) {
            savedLang = 'zh';
        }
        
        console.log('最终使用的语言:', savedLang);
        
        if (window.i18n) {
            console.log('i18n.currentLang:', window.i18n.currentLang);
            if (window.i18n.currentLang !== savedLang) {
                console.log('语言不匹配，调用 setLanguage');
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
            console.warn('i18n 未定义，直接设置 localStorage');
            localStorage.setItem('language', savedLang);
        }
        
        updateLanguageDisplay(savedLang);
        updateBrowserLanguageDisplay();

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = savedLang;
            console.log('设置语言选择器值为:', savedLang);
        }
    }

    setTimeout(function() {
        initLanguageSettings();
    }, 100);

    setTimeout(function() {
        updateBrowserLanguageDisplay();
    }, 500);

    window.addEventListener('languageChanged', function(e) {
        const lang = e.detail ? e.detail.lang : (localStorage.getItem('language') || 'zh');
        console.log('收到 languageChanged 事件，语言:', lang);
        updateLanguageDisplay(lang);
        updateBrowserLanguageDisplay();

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = lang;
        }
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                console.log('在事件监听器中强制更新页面内容');
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

