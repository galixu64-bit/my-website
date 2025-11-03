

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
    console.log('changeLanguageSetting called with lang:', lang);

    if (!lang || (lang !== 'zh' && lang !== 'en')) {
        console.warn('Invalid language value:', lang);
        return;
    }

    if (window.i18n && typeof window.i18n.setLanguage === 'function') {
        console.log('Using i18n.setLanguage');
        window.i18n.setLanguage(lang);
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                console.log('强制更新页面内容');
                window.i18n.updatePage();
            }
            updateLanguageDisplay(lang);
            updateBrowserLanguageDisplay();
        }, 200);
        
        setTimeout(function() {
            if (window.i18n && typeof window.i18n.updatePage === 'function') {
                window.i18n.updatePage();
            }
            updateLanguageDisplay(lang);
        }, 500);
    } else if (window.switchLanguage && typeof window.switchLanguage === 'function') {
        console.log('Using window.switchLanguage');
        window.switchLanguage(lang);
        setTimeout(function() {
            updateLanguageDisplay(lang);
            updateBrowserLanguageDisplay();
        }, 100);
    } else {
        console.warn('No language switching method available');

        try {
            localStorage.setItem('language', lang);

            if (window.i18n) {
                window.i18n.currentLang = lang;
                if (typeof window.i18n.updatePage === 'function') {
                    window.i18n.updatePage();
                }
            }
            updateLanguageDisplay(lang);
            updateBrowserLanguageDisplay();
        } catch (e) {
            console.error('Failed to save language preference:', e);
        }
    }
    
    console.log('Language changed to:', lang);
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
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }

    const fullUser = getUserByUsernameSync(currentUser.username);
    if (fullUser && fullUser.email) {
        updateEmailDisplay(fullUser.email);
    }

    setTimeout(function() {
        let savedLang = localStorage.getItem('language');
        if (!savedLang) {
            if (window.detectBrowserLanguage && typeof window.detectBrowserLanguage === 'function') {
                savedLang = window.detectBrowserLanguage();
                console.log('从 detectBrowserLanguage 获取:', savedLang);
            } else {
                try {
                    const browserLang = navigator.language || navigator.userLanguage || 
                        (navigator.languages && navigator.languages[0]) || 'zh-CN';
                    const langCode = browserLang.toLowerCase().split('-')[0];
                    savedLang = (langCode === 'zh' || langCode === 'en') ? langCode : 'zh';
                    console.log('直接从浏览器解析语言:', savedLang);
                } catch (e) {
                    console.error('解析浏览器语言失败:', e);
                    savedLang = 'zh';
                }
            }
        }
        
        if (window.i18n) {
            if (window.i18n.currentLang !== savedLang && window.i18n.setLanguage) {
                window.i18n.setLanguage(savedLang);
            }
        }
        
        updateLanguageDisplay(savedLang);
        
        setTimeout(function() {
            updateBrowserLanguageDisplay();
        }, 200);

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = savedLang;
        }
    }, 200);

    window.addEventListener('languageChanged', function(e) {
        const lang = e.detail ? e.detail.lang : (localStorage.getItem('language') || 'zh');
        updateLanguageDisplay(lang);

        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = lang;
        }
    });
    
    if (window.i18n && typeof window.i18n.init === 'function') {
        window.i18n.init();
    }
}

function t(key) {
    return (window.i18n && typeof window.i18n.t === 'function') 
        ? window.i18n.t(key) 
        : key;
}

document.addEventListener('DOMContentLoaded', function() {
    initSettings();

    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {

        languageSelect.removeEventListener('change', handleLanguageChange);
        languageSelect.addEventListener('change', handleLanguageChange);
        console.log('Language select event listener attached');
    }
});

function handleLanguageChange(event) {
    const lang = event.target.value;
    console.log('Language select changed to:', lang);
    if (window.changeLanguageSetting) {
        window.changeLanguageSetting(lang);
    } else {
        console.error('changeLanguageSetting function not available');
    }
}

