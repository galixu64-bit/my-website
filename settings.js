// 设置页面功能

// 切换密码修改表单显示
function togglePasswordChange() {
    const form = document.getElementById('passwordChangeForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        // 清空输入框
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        hideMessage('passwordMessage');
    } else {
        form.style.display = 'none';
    }
}

// 切换邮箱修改表单显示
function toggleEmailChange() {
    const form = document.getElementById('emailChangeForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        // 清空输入框
        document.getElementById('newEmail').value = '';
        hideMessage('emailMessage');
    } else {
        form.style.display = 'none';
    }
}

// 保存密码
function savePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // 获取翻译函数
    const t = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : key;
    };
    
    // 验证
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
    
    // 获取当前用户
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('passwordMessage', t('loginRequired'), 'error');
        return;
    }
    
    // 获取完整用户信息
    const fullUser = getUserByUsernameSync(currentUser.username);
    if (!fullUser) {
        showMessage('passwordMessage', t('userNotFound'), 'error');
        return;
    }
    
    // 验证当前密码
    if (fullUser.password !== currentPassword) {
        showMessage('passwordMessage', t('currentPasswordError'), 'error');
        return;
    }
    
    // 检查新旧密码是否相同
    if (fullUser.password === newPassword) {
        showMessage('passwordMessage', t('passwordSameError'), 'error');
        return;
    }
    
    // 更新密码
    fullUser.password = newPassword;
    saveUserToDatabase(fullUser);
    
    // 显示成功消息
    showMessage('passwordMessage', t('passwordChangeSuccess'), 'success');
    
    // 清空输入框
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    // 3秒后隐藏表单
    setTimeout(() => {
        togglePasswordChange();
    }, 3000);
}

// 保存邮箱
function saveEmail() {
    const newEmail = document.getElementById('newEmail').value.trim();
    
    // 获取翻译函数
    const t = (key) => {
        return (window.i18n && typeof window.i18n.t === 'function') 
            ? window.i18n.t(key) 
            : key;
    };
    
    // 验证
    if (!newEmail) {
        showMessage('emailMessage', t('emailRequired'), 'error');
        return;
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showMessage('emailMessage', t('emailInvalid'), 'error');
        return;
    }
    
    // 获取当前用户
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showMessage('emailMessage', t('loginRequired'), 'error');
        return;
    }
    
    // 获取完整用户信息
    const fullUser = getUserByUsernameSync(currentUser.username);
    if (!fullUser) {
        showMessage('emailMessage', t('userNotFound'), 'error');
        return;
    }
    
    // 检查邮箱是否相同
    if (fullUser.email === newEmail) {
        showMessage('emailMessage', t('emailSameError'), 'error');
        return;
    }
    
    // 更新邮箱
    fullUser.email = newEmail;
    saveUserToDatabase(fullUser);
    
    // 更新显示
    updateEmailDisplay(newEmail);
    
    // 显示成功消息
    showMessage('emailMessage', t('emailChangeSuccess'), 'success');
    
    // 清空输入框
    document.getElementById('newEmail').value = '';
    
    // 3秒后隐藏表单
    setTimeout(() => {
        toggleEmailChange();
    }, 3000);
}

// 更新邮箱显示
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
    
    // 同时更新账户信息部分的邮箱显示
    const infoEmail = document.getElementById('infoEmail');
    if (infoEmail) {
        infoEmail.textContent = email || getTranslation('emailNotSet');
    }
}

// 导出函数到全局作用域，供 profile.js 调用
window.updateEmailDisplay = updateEmailDisplay;

// 修改语言设置
function changeLanguageSetting(lang) {
    if (window.switchLanguage) {
        window.switchLanguage(lang);
        // 更新语言显示
        updateLanguageDisplay(lang);
    }
}

// 更新语言显示
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
    
    // 更新下拉框
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = lang;
    }
    
    // 更新浏览器语言显示
    updateBrowserLanguageDisplay();
}

// 更新浏览器语言显示
function updateBrowserLanguageDisplay() {
    const browserLangDisplay = document.getElementById('browserLanguageDisplay');
    if (browserLangDisplay && window.getBrowserLanguage) {
        try {
            const browserLang = window.getBrowserLanguage();
            const detectedLang = window.detectBrowserLanguage ? window.detectBrowserLanguage() : 'zh';
            
            // 显示浏览器语言和检测结果
            const detectedName = detectedLang === 'zh' ? '中文' : 'English';
            browserLangDisplay.textContent = `${browserLang} (${detectedName})`;
            
            // 如果检测到的语言与当前语言不同，添加提示
            const currentLang = localStorage.getItem('language') || 'zh';
            if (detectedLang !== currentLang) {
                browserLangDisplay.style.color = '#888';
                browserLangDisplay.title = '浏览器检测到的语言与当前设置不同';
            } else {
                browserLangDisplay.style.color = '#10b981';
            }
        } catch (e) {
            browserLangDisplay.textContent = '无法检测';
        }
    }
}

// 显示消息
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = 'settings-message ' + type;
        messageEl.style.display = 'block';
        
        // 如果是错误消息，5秒后自动隐藏；成功消息3秒后隐藏
        setTimeout(() => {
            hideMessage(elementId);
        }, type === 'error' ? 5000 : 3000);
    }
}

// 隐藏消息
function hideMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.style.display = 'none';
        messageEl.className = 'settings-message';
        messageEl.textContent = '';
    }
}

// 初始化设置页面
function initSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }
    
    // 获取完整用户信息
    const fullUser = getUserByUsernameSync(currentUser.username);
    if (fullUser && fullUser.email) {
        updateEmailDisplay(fullUser.email);
    }
    
    // 初始化语言显示（延迟一点确保 i18n 已加载）
    setTimeout(() => {
        const savedLang = localStorage.getItem('language') || 'zh';
        updateLanguageDisplay(savedLang);
        
        // 设置下拉框的值
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = savedLang;
        }
    }, 100);
    
    // 监听语言切换事件
    window.addEventListener('languageChanged', function(e) {
        const lang = e.detail ? e.detail.lang : (localStorage.getItem('language') || 'zh');
        updateLanguageDisplay(lang);
        
        // 更新下拉框
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = lang;
        }
    });
}

// 获取翻译函数（辅助函数）
function t(key) {
    return (window.i18n && typeof window.i18n.t === 'function') 
        ? window.i18n.t(key) 
        : key;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
});

