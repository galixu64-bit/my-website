// 个人中心页面

// 设置用户信息
function setUserInfo() {
    const headerAvatar = document.getElementById('headerAvatar');
    const headerUserName = document.getElementById('headerUserName');
    
    // 检查登录状态
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    // 设置头部头像和名字
    const userInfo = document.querySelector('.user-info');
    if (userInfo) userInfo.style.display = 'flex';
    if (headerAvatar) {
        headerAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
    }
    if (headerUserName) {
        headerUserName.textContent = currentUser.username;
    }
    
    // 加载用户详细信息
    loadUserProfile(currentUser);
}

// 加载用户资料
function loadUserProfile(currentUser) {
    // 确保翻译已更新
    if (window.i18n && typeof window.i18n.updatePage === 'function') {
        window.i18n.updatePage();
    }
    
    // 获取完整用户信息（使用同步版本）
    const fullUser = getUserByUsernameSync ? getUserByUsernameSync(currentUser.username) : null;
    
    // 设置头像
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
    }
    
    // 设置用户名
    const profileUsername = document.getElementById('profileUsername');
    if (profileUsername) {
        profileUsername.textContent = currentUser.username;
    }
    
    // 显示开发者徽章
    const developerBadge = document.getElementById('developerBadge');
    if (developerBadge && currentUser.isDeveloper) {
        developerBadge.style.display = 'inline-block';
    }
    
    // 设置账户信息
    const infoUsername = document.getElementById('infoUsername');
    if (infoUsername) infoUsername.textContent = currentUser.username;
    
    const infoAccountType = document.getElementById('infoAccountType');
    if (infoAccountType) {
        // 获取翻译函数
        const t = (key) => {
            return (window.i18n && typeof window.i18n.t === 'function') 
                ? window.i18n.t(key) 
                : key;
        };
        infoAccountType.textContent = currentUser.isDeveloper 
            ? t('developerAccount') 
            : t('regularUser');
    }
    
    const infoEmail = document.getElementById('infoEmail');
    if (infoEmail) {
        if (fullUser && fullUser.email) {
            infoEmail.textContent = fullUser.email;
        } else {
            // 获取翻译
            const t = (key) => {
                return (window.i18n && typeof window.i18n.t === 'function') 
                    ? window.i18n.t(key) 
                    : '未设置';
            };
            infoEmail.textContent = t('emailNotSet');
        }
    }
    
    // 更新设置页面的邮箱显示（如果存在）
    if (typeof updateEmailDisplay === 'function') {
        updateEmailDisplay(fullUser ? fullUser.email : null);
    }
    
    // 设置注册时间
    const infoCreatedAt = document.getElementById('infoCreatedAt');
    if (infoCreatedAt && fullUser && fullUser.createdAt) {
        const date = new Date(fullUser.createdAt);
        // 根据当前语言设置日期格式
        const currentLang = (window.i18n && window.i18n.currentLang) || 'zh';
        const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
        infoCreatedAt.textContent = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // 加载统计数据
    loadUserStats(currentUser);
}

// 加载用户统计数据
function loadUserStats(currentUser) {
    // 获取所有资源
    let allResources = [];
    try {
        const localResources = getResourcesFromLocalStorage();
        if (localResources && localResources.length > 0) {
            allResources = localResources;
        } else {
            // 从文件加载
            fetch('resources.json', { cache: 'no-cache' })
                .then(response => response.json())
                .then(data => {
                    allResources = data;
                    calculateStats(currentUser, allResources);
                })
                .catch(() => {
                    calculateStats(currentUser, []);
                });
            return;
        }
    } catch (error) {
        console.error('加载资源失败:', error);
    }
    
    calculateStats(currentUser, allResources);
}

// 计算统计数据
function calculateStats(currentUser, allResources) {
    // 统计上传的资源
    const myResources = allResources.filter(r => {
        const author = r.author || r.uploadedBy;
        return author === currentUser.username;
    });
    
    const resourceCount = document.getElementById('resourceCount');
    if (resourceCount) {
        resourceCount.textContent = myResources.length;
    }
    
    // 统计评论数量
    let totalComments = 0;
    try {
        // 遍历所有资源ID，统计评论
        for (let resourceId = 1; resourceId <= 10000; resourceId++) {
            const commentsJson = localStorage.getItem(`comments_${resourceId}`);
            if (commentsJson) {
                const comments = JSON.parse(commentsJson);
                const myComments = comments.filter(c => c.author === currentUser.username);
                totalComments += myComments.length;
            }
        }
    } catch (error) {
        console.error('统计评论失败:', error);
    }
    
    const commentCount = document.getElementById('commentCount');
    if (commentCount) {
        commentCount.textContent = totalComments;
    }
    
    // 统计下载数（暂时为0，可以后续添加下载记录功能）
    const downloadCount = document.getElementById('downloadCount');
    if (downloadCount) {
        downloadCount.textContent = '0'; // 可以后续添加下载记录功能
    }
}

// 从 localStorage 读取资源
function getResourcesFromLocalStorage() {
    try {
        const stored = localStorage.getItem('resources');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        return null;
    }
}

// 登出功能
function logout() {
    if (confirm('确定要登出吗？')) {
        if (window.logoutAuth) {
            window.logoutAuth();
        } else {
            localStorage.removeItem('currentUser');
        }
        window.location.href = 'index.html';
    }
}

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    setUserInfo();
});

