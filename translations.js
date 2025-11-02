// 多语言翻译文件
const translations = {
    zh: {
        // 通用
        'login': '登录',
        'logout': '登出',
        'register': '注册',
        'cancel': '取消',
        'submit': '提交',
        'save': '保存',
        'delete': '删除',
        'edit': '编辑',
        'back': '返回',
        'search': '搜索',
        'filter': '筛选',
        'reset': '重置',
        'confirm': '确认',
        'close': '关闭',
        'loading': '加载中...',
        'error': '错误',
        'success': '成功',
        
        // 导航和页面
        'siteName': 'dragbit',
        'siteDescription': '优质资源，免费下载',
        'home': '首页',
        'myResources': '我的资源',
        'addResource': '添加资源',
        'profile': '个人中心',
        'loginRequired': '需要登录',
        'loginRequiredMessage': '您需要登录才能查看资源\n请登录或注册',
        
        // 资源相关
        'resources': '资源',
        'allCategories': '全部',
        'software': '软件',
        'document': '文档',
        'media': '媒体',
        'website': '网站',
        'other': '其他',
        'searchPlaceholder': '搜索资源...',
        'addResourceButton': '+ 添加资源',
        'visitWebsite': '访问网站',
        'download': '下载',
        'viewDetails': '查看详情',
        'comments': '评论',
        'uploadedBy': '发布者',
        'uploadedAt': '发布时间',
        'tags': '标签',
        'category': '分类',
        'description': '描述',
        'author': '作者',
        'noCommentsYet': '暂无评论，快来发表第一条评论吧！',
        'loginToComment': '请登录后评论',
        
        // 登录页面
        'loginTitle': '登录资源库',
        'loginSubtitle': '账号登录，畅享高质量资源免费下载！',
        'username': '用户名',
        'password': '密码',
        'usernamePlaceholder': '输入用户名（3-20个字符）',
        'passwordPlaceholder': '输入密码（至少6个字符）',
        'confirmPasswordPlaceholder': '再次输入密码',
        'loginButton': '登录',
        'registerButton': '注册',
        'demoAccount': '演示账号：',
        'or': '或',
        
        // 注册页面
        'registerTitle': '✨ 注册',
        'registerSubtitle': '创建账户开始使用',
        'confirmPassword': '确认密码',
        'email': '邮箱',
        'verificationCode': '验证码',
        'sendCode': '发送验证码',
        'codeSentTo': '验证码将发送到此邮箱',
        'registerSubmit': '注册',
        'alreadyHaveAccount': '已有账户？',
        'loginNow': '立即登录',
        'backToHome': '← 返回首页',
        'enterCode': '请输入验证码',
        
        // 注册验证错误消息
        'usernameLengthError': '用户名长度必须在3-20个字符之间',
        'passwordLengthError': '密码长度至少6个字符',
        'passwordMismatch': '两次输入的密码不一致',
        'emailRequired': '请输入邮箱地址',
        'emailInvalid': '请输入有效的邮箱地址',
        'codeRequired': '请输入验证码',
        'codeError': '验证码错误',
        'codeExpired': '验证码已过期，请重新发送',
        'codeNotSent': '请先发送验证码',
        'codeVerificationFailed': '验证码验证功能未初始化，请刷新页面重试',
        'registerSuccess': '注册成功！正在跳转到登录页面...',
        'registerFailed': '注册失败',
        'registerFailedRetry': '注册失败，请稍后重试',
        'codeSentSuccess': '验证码已发送到您的邮箱，请查收！',
        'codeSendFailed': '邮件发送失败。',
        'codeSendFailedConfig': '请检查模板配置或变量名称是否正确。',
        'codeSendFailedAuth': '认证失败，请检查 Public Key 是否正确。',
        'codeSendFailedError': '错误代码：{status}，详细信息：{details}',
        'verificationCodeMessage': '您的验证码是：{code}，有效期为5分钟。',
        'codeCountdown': '{seconds}秒后可重新发送',
        
        // 我的资源页面
        'myResourcesTitle': '我的资源',
        'myResourcesSubtitle': '这里展示你在dragbit上传的所有资源',
        'noMyResources': '你还没有上传任何资源',
        'addFirstResource': '添加第一个资源',
        'backToMain': '返回主页',
        
        // 添加资源页面
        'addResourceTitle': '➕ 添加资源',
        'addResourceSubtitle': '资源将收录在 dragbit —— 一个优质资源网站',
        'addNewResource': '添加新资源',
        'resourceName': '资源名称',
        'resourceDescription': '资源描述',
        'resourceDetails': '详细说明',
        'resourceTags': '标签（用逗号分隔）',
        'exampleTags': '例如：免费,开源,Windows,中文',
        'tagsHelp': '输入多个标签，用逗号分隔，例如：免费,开源,Windows',
        'displayImage': '展示图片URL',
        'displayVideo': '展示视频URL',
        'displayImagePlaceholder': '输入图片URL（可选）',
        'displayVideoPlaceholder': '输入视频URL（可选）',
        'imageHelp': '支持 jpg, png, gif 格式',
        'videoHelp': '支持 YouTube, Bilibili, 或其他视频链接',
        'resourceLink': '资源链接',
        'resourceLinkPlaceholder': 'https://example.com 或 file:///path/to/file',
        'resourceLinkHelp': '网站链接或本地文件路径',
        'categorySelect': '分类',
        'iconSelect': '图标',
        'submitResource': '提交',
        'backToDragbit': '← 返回 dragbit',
        
        // 个人中心页面
        'profileTitle': '个人中心',
        'profileSubtitle': '管理你的账户信息',
        'member': '会员',
        'totalResources': '总资源数',
        'totalComments': '总评论数',
        'downloadCount': '资源下载数',
        'accountInfo': '账户信息',
        'registerTime': '注册时间',
        'accountType': '账户类型',
        'developerAccount': '⭐ 开发者账户',
        'regularUser': '👤 普通用户',
        'changeAvatar': '更换头像',
        'accountSettings': '账户设置',
        'changePassword': '修改密码',
        'currentPassword': '当前密码',
        'newPassword': '新密码',
        'confirmNewPassword': '确认新密码',
        'newEmail': '新邮箱',
        'language': '语言',
        'currentPasswordRequired': '请输入当前密码',
        'currentPasswordError': '当前密码错误',
        'passwordSameError': '新密码不能与当前密码相同',
        'passwordChangeSuccess': '密码修改成功！',
        'emailSameError': '新邮箱不能与当前邮箱相同',
        'emailChangeSuccess': '邮箱修改成功！',
        'emailNotSet': '未设置',
        'userNotFound': '用户未找到',
        'currentLanguage': '当前语言',
        'browserLanguage': '浏览器语言',
        'selectLanguage': '选择语言',
        
        // Other
        'copyright': '© 2024 dragbit | Made with ❤️',
    },
    en: {
        // Common
        'login': 'Login',
        'logout': 'Logout',
        'register': 'Register',
        'cancel': 'Cancel',
        'submit': 'Submit',
        'save': 'Save',
        'delete': 'Delete',
        'edit': 'Edit',
        'back': 'Back',
        'search': 'Search',
        'filter': 'Filter',
        'reset': 'Reset',
        'confirm': 'Confirm',
        'close': 'Close',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        
        // Navigation and Pages
        'siteName': 'dragbit',
        'siteDescription': 'High-quality resources, free download',
        'home': 'Home',
        'myResources': 'My Resources',
        'addResource': 'Add Resource',
        'profile': 'Profile',
        'loginRequired': 'Login Required',
        'loginRequiredMessage': 'You need to login to view resources\nPlease login or register',
        
        // Resources
        'resources': 'Resources',
        'allCategories': 'All',
        'software': 'Software',
        'document': 'Document',
        'media': 'Media',
        'website': 'Website',
        'other': 'Other',
        'searchPlaceholder': 'Search resources...',
        'addResourceButton': '+ Add Resource',
        'visitWebsite': 'Visit Website',
        'download': 'Download',
        'viewDetails': 'View Details',
        'comments': 'Comments',
        'uploadedBy': 'Uploaded By',
        'uploadedAt': 'Uploaded At',
        'tags': 'Tags',
        'category': 'Category',
        'description': 'Description',
        'author': 'Author',
        'noCommentsYet': 'No comments yet. Be the first to comment!',
        'loginToComment': 'Please login to comment',
        
        // Login Page
        'loginTitle': 'Login',
        'loginSubtitle': 'Account login to enjoy high-quality free resources!',
        'username': 'Username',
        'password': 'Password',
        'usernamePlaceholder': 'Enter username (3-20 characters)',
        'passwordPlaceholder': 'Enter password (at least 6 characters)',
        'confirmPasswordPlaceholder': 'Enter password again',
        'loginButton': 'Login',
        'registerButton': 'Register',
        'demoAccount': 'Demo Account:',
        'or': 'or',
        
        // Register Page
        'registerTitle': '✨ Register',
        'registerSubtitle': 'Create an account to get started',
        'confirmPassword': 'Confirm Password',
        'email': 'Email',
        'verificationCode': 'Verification Code',
        'sendCode': 'Send Code',
        'codeSentTo': 'Verification code will be sent to this email',
        'registerSubmit': 'Register',
        'alreadyHaveAccount': 'Already have an account?',
        'loginNow': 'Login Now',
        'backToHome': '← Back to Home',
        'enterCode': 'Enter verification code',
        
        // Register validation error messages
        'usernameLengthError': 'Username must be between 3-20 characters',
        'passwordLengthError': 'Password must be at least 6 characters',
        'passwordMismatch': 'Passwords do not match',
        'emailRequired': 'Please enter your email address',
        'emailInvalid': 'Please enter a valid email address',
        'codeRequired': 'Please enter verification code',
        'codeError': 'Verification code is incorrect',
        'codeExpired': 'Verification code has expired, please resend',
        'codeNotSent': 'Please send verification code first',
        'codeVerificationFailed': 'Verification code feature not initialized, please refresh the page',
        'registerSuccess': 'Registration successful! Redirecting to login page...',
        'registerFailed': 'Registration failed',
        'registerFailedRetry': 'Registration failed, please try again later',
        'codeSentSuccess': 'Verification code has been sent to your email, please check!',
        'codeSendFailed': 'Failed to send email.',
        'codeSendFailedConfig': 'Please check if template configuration or variable names are correct.',
        'codeSendFailedAuth': 'Authentication failed, please check if Public Key is correct.',
        'codeSendFailedError': 'Error code: {status}, Details: {details}',
        'verificationCodeMessage': 'Your verification code is: {code}, valid for 5 minutes.',
        'codeCountdown': '{seconds} seconds before resending',
        
        // My Resources Page
        'myResourcesTitle': 'My Resources',
        'myResourcesSubtitle': 'All resources you uploaded on dragbit',
        'noMyResources': 'You have not uploaded any resources yet',
        'addFirstResource': 'Add Your First Resource',
        'backToMain': 'Back to Home',
        
        // Add Resource Page
        'addResourceTitle': '➕ Add Resource',
        'addResourceSubtitle': 'Resources will be added to dragbit - a quality resource website',
        'addNewResource': 'Add New Resource',
        'resourceName': 'Resource Name',
        'resourceDescription': 'Resource Description',
        'resourceDetails': 'Details',
        'resourceTags': 'Tags (comma separated)',
        'exampleTags': 'Example: Free,Open Source,Windows,Chinese',
        'tagsHelp': 'Enter multiple tags separated by commas, e.g.: Free,Open Source,Windows',
        'displayImage': 'Display Image URL',
        'displayVideo': 'Display Video URL',
        'displayImagePlaceholder': 'Enter image URL (optional)',
        'displayVideoPlaceholder': 'Enter video URL (optional)',
        'imageHelp': 'Supports jpg, png, gif formats',
        'videoHelp': 'Supports YouTube, Bilibili, or other video links',
        'resourceLink': 'Resource Link',
        'resourceLinkPlaceholder': 'https://example.com or file:///path/to/file',
        'resourceLinkHelp': 'Website link or local file path',
        'categorySelect': 'Category',
        'iconSelect': 'Icon',
        'submitResource': 'Submit',
        'backToDragbit': '← Back to dragbit',
        
        // Profile Page
        'profileTitle': 'Profile',
        'profileSubtitle': 'Manage your account information',
        'member': 'Member',
        'totalResources': 'Total Resources',
        'totalComments': 'Total Comments',
        'downloadCount': 'Download Count',
        'accountInfo': 'Account Information',
        'registerTime': 'Register Time',
        'accountType': 'Account Type',
        'developerAccount': '⭐ Developer Account',
        'regularUser': '👤 Regular User',
        'changeAvatar': 'Change Avatar',
        'accountSettings': 'Account Settings',
        'changePassword': 'Change Password',
        'currentPassword': 'Current Password',
        'newPassword': 'New Password',
        'confirmNewPassword': 'Confirm New Password',
        'newEmail': 'New Email',
        'language': 'Language',
        'currentPasswordRequired': 'Please enter current password',
        'currentPasswordError': 'Current password is incorrect',
        'passwordSameError': 'New password cannot be the same as current password',
        'passwordChangeSuccess': 'Password changed successfully!',
        'emailSameError': 'New email cannot be the same as current email',
        'emailChangeSuccess': 'Email changed successfully!',
        'emailNotSet': 'Not set',
        'userNotFound': 'User not found',
        'currentLanguage': 'Current Language',
        'browserLanguage': 'Browser Language',
        'selectLanguage': 'Select Language',
        
        // Other
        'copyright': '© 2024 dragbit | Made with ❤️',
    }
};

// 语言工具对象
(function() {
    'use strict';
    
    // 自动检测浏览器语言
    // 检测浏览器语言
    function detectBrowserLanguage() {
        try {
            // 获取浏览器语言（优先级：language > userLanguage > languages[0]）
            const browserLang = (navigator.language || navigator.userLanguage || 
                (navigator.languages && navigator.languages[0]) || 'zh-CN').toLowerCase();
            
            // 支持的语言列表
            const supportedLangs = ['zh', 'en'];
            
            // 检查完整语言代码（如 zh-cn, en-us, zh-tw）
            if (browserLang) {
                const langCode = browserLang.split('-')[0];
                if (supportedLangs.includes(langCode)) {
                    return langCode;
                }
            }
        } catch (e) {
            console.warn('无法检测浏览器语言:', e);
        }
        
        // 默认返回中文
        return 'zh';
    }
    
    // 获取浏览器语言（用于显示）
    function getBrowserLanguage() {
        try {
            const browserLang = (navigator.language || navigator.userLanguage || 
                (navigator.languages && navigator.languages[0]) || 'zh-CN');
            return browserLang;
        } catch (e) {
            return 'zh-CN';
        }
    }
    
    // 获取当前语言（优先级：localStorage > 浏览器语言 > 默认中文）
    let currentLang = 'zh';
    let browserDetectedLang = detectBrowserLanguage();
    
    try {
        const savedLang = localStorage.getItem('language');
        if (savedLang && translations[savedLang]) {
            // 使用保存的语言
            currentLang = savedLang;
        } else {
            // 如果没有保存的语言，使用检测到的浏览器语言
            currentLang = browserDetectedLang;
            // 保存检测到的语言
            try {
                localStorage.setItem('language', currentLang);
            } catch (e) {
                // 忽略存储错误
            }
        }
        
        // 确保语言有效
        if (!translations[currentLang]) {
            currentLang = 'zh';
        }
    } catch (e) {
        currentLang = 'zh';
    }
    
    // 导出浏览器语言检测函数
    window.getBrowserLanguage = getBrowserLanguage;
    window.detectBrowserLanguage = detectBrowserLanguage;
    
    // 创建 i18n 对象
    const i18n = {
        currentLang: currentLang,
        
        setLanguage: function(lang) {
            if (translations[lang]) {
                this.currentLang = lang;
                try {
                    localStorage.setItem('language', lang);
                } catch (e) {
                    // 忽略 localStorage 错误
                }
                this.updatePage();
            }
        },
        
        t: function(key) {
            return translations[this.currentLang] && translations[this.currentLang][key] 
                || translations['zh'][key] 
                || key;
        },
        
        updatePage: function() {
            // 更新 data-i18n
            document.querySelectorAll('[data-i18n]').forEach(function(el) {
                const key = el.getAttribute('data-i18n');
                if (key) {
                    el.textContent = i18n.t(key);
                }
            });
            
            // 更新 data-i18n-placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
                const key = el.getAttribute('data-i18n-placeholder');
                if (key) {
                    el.placeholder = i18n.t(key);
                }
            });
            
            // 更新 data-i18n-title
            document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
                const key = el.getAttribute('data-i18n-title');
                if (key) {
                    el.title = i18n.t(key);
                }
            });
            
            // 更新 HTML lang 属性
            if (document.documentElement) {
                document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
            }
            
            // 触发语言变更事件
            try {
                window.dispatchEvent(new CustomEvent('languageChanged', { 
                    detail: { lang: this.currentLang } 
                }));
            } catch (e) {
                // 忽略事件分发错误
            }
        },
        
        init: function() {
            this.updatePage();
        }
    };
    
    // 导出到全局
    window.i18n = i18n;
    window.translations = translations;
    
    console.log('✓ i18n 已加载，当前语言:', currentLang);
})();
