

function setUserInfo() {
    const headerAvatar = document.getElementById('headerAvatar');
    const headerUserName = document.getElementById('headerUserName');

    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }

    const userInfo = document.querySelector('.user-info');
    if (userInfo) userInfo.style.display = 'flex';
    if (headerAvatar) {
        headerAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
    }
    if (headerUserName) {
        headerUserName.textContent = currentUser.username;
    }

    loadUserProfile(currentUser);
}

function loadUserProfile(currentUser, skipStats = false) {

    if (window.i18n && typeof window.i18n.updatePage === 'function') {
        window.i18n.updatePage();
    }

    const fullUser = getUserByUsernameSync ? getUserByUsernameSync(currentUser.username) : null;

    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
    }

    const profileUsername = document.getElementById('profileUsername');
    if (profileUsername) {
        profileUsername.textContent = currentUser.username;
    }

    const developerBadge = document.getElementById('developerBadge');
    if (developerBadge && currentUser.isDeveloper) {
        developerBadge.style.display = 'inline-block';
    }

    const infoUsername = document.getElementById('infoUsername');
    if (infoUsername) infoUsername.textContent = currentUser.username;
    
    const infoAccountType = document.getElementById('infoAccountType');
    if (infoAccountType) {

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

            const t = (key) => {
                return (window.i18n && typeof window.i18n.t === 'function') 
                    ? window.i18n.t(key) 
                    : '未设置';
            };
            infoEmail.textContent = t('emailNotSet');
        }
    }

    if (typeof updateEmailDisplay === 'function') {
        updateEmailDisplay(fullUser ? fullUser.email : null);
    }

    const infoCreatedAt = document.getElementById('infoCreatedAt');
    if (infoCreatedAt && fullUser && fullUser.createdAt) {
        const date = new Date(fullUser.createdAt);

        const currentLang = (window.i18n && window.i18n.currentLang) || 'zh';
        const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
        infoCreatedAt.textContent = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (!skipStats) {
        loadUserStats(currentUser);
    }
}

let cachedResources = null;
let loadingResources = false;

function loadUserStats(currentUser) {

    if (loadingResources) {
        console.log('Resources already loading, skipping...');
        return;
    }

    let allResources = [];
    try {
        const localResources = getResourcesFromLocalStorage();
        if (localResources && localResources.length > 0) {
            allResources = localResources;
            cachedResources = allResources;
            calculateStats(currentUser, allResources);
            return;
        }

        if (cachedResources && cachedResources.length > 0) {
            console.log('Using cached resources');
            calculateStats(currentUser, cachedResources);
            return;
        }

        loadingResources = true;
        fetch('resources.json', { cache: 'no-cache' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load resources.json');
                }
                return response.json();
            })
            .then(data => {
                allResources = data;
                cachedResources = data; 
                loadingResources = false; 
                calculateStats(currentUser, allResources);
            })
            .catch((error) => {
                loadingResources = false; 
                console.error('Failed to load resources:', error);

                calculateStats(currentUser, []);
            });
        return; 
    } catch (error) {
        console.error('加载资源失败:', error);
        calculateStats(currentUser, []);
    }
}

function calculateStats(currentUser, allResources) {

    const myResources = allResources.filter(r => {
        const author = r.author || r.uploadedBy;
        return author === currentUser.username;
    });
    
    const resourceCount = document.getElementById('resourceCount');
    if (resourceCount) {
        resourceCount.textContent = myResources.length;
    }

    let totalComments = 0;
    try {

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

    const downloadCount = document.getElementById('downloadCount');
    if (downloadCount) {
        downloadCount.textContent = '0'; 
    }
}

function getResourcesFromLocalStorage() {
    try {
        const stored = localStorage.getItem('resources');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        return null;
    }
}

function loadAllUsers() {
    const display = document.getElementById('allUsersDisplay');
    const list = document.getElementById('allUsersList');
    
    if (!display || !list) return;
    
    if (display.style.display === 'none') {

        const users = getAllUsersSync ? getAllUsersSync() : [];
        
        const t = (key) => {
            return (window.i18n && typeof window.i18n.t === 'function') 
                ? window.i18n.t(key) 
                : key;
        };
        
        if (users.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">暂无用户数据</p>';
        } else {
            list.innerHTML = `
                <div style="display: grid; gap: 15px;">
                    ${users.map(user => {
                        const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知';
                        return `
                            <div style="background: var(--bg-card); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <div>
                                        <strong style="color: var(--accent-color);">${escapeHtml(user.username || '未命名')}</strong>
                                        ${user.isDeveloper ? '<span style="color: var(--accent-color); margin-left: 10px;">⭐ 开发者</span>' : ''}
                                    </div>
                                    <span style="color: var(--text-muted); font-size: 0.85em;">ID: ${user.id || 'N/A'}</span>
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.9em; margin-top: 8px;">
                                    <div><strong>${t('email')}:</strong> ${escapeHtml(user.email || t('emailNotSet'))}</div>
                                    <div><strong>${t('registerTime')}:</strong> ${date}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        display.style.display = 'block';
    } else {
        display.style.display = 'none';
    }
}

function exportAllUsers() {
    if (typeof exportUsersToJSON === 'function') {
        exportUsersToJSON();
    } else if (window.exportUsersToJSON) {
        window.exportUsersToJSON();
    }
}

function showUserDataJSON() {
    const users = getAllUsersSync ? getAllUsersSync() : (window.getAllUsersSync ? window.getAllUsersSync() : []);
    const jsonDisplay = document.getElementById('jsonDisplay');
    const jsonContent = document.getElementById('jsonContent');
    
    if (!jsonDisplay || !jsonContent) return;
    
    const jsonString = JSON.stringify(users, null, 2);
    jsonContent.textContent = jsonString;
    jsonDisplay.style.display = 'block';
    
    jsonContent.scrollTop = 0;
}

function copyAllUsersJSON() {
    const users = getAllUsersSync ? getAllUsersSync() : (window.getAllUsersSync ? window.getAllUsersSync() : []);
    const jsonString = JSON.stringify(users, null, 2);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(function() {
            alert('用户数据JSON已复制到剪贴板！');
        }).catch(function(err) {
            console.error('复制失败:', err);
            fallbackCopyJSON(jsonString);
        });
    } else {
        fallbackCopyJSON(jsonString);
    }
}

function fallbackCopyJSON(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('用户数据JSON已复制到剪贴板！');
    } catch (err) {
        alert('复制失败，请手动选择并复制');
    }
    document.body.removeChild(textArea);
}

window.showUserDataJSON = showUserDataJSON;
window.copyAllUsersJSON = copyAllUsersJSON;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

document.addEventListener('DOMContentLoaded', function() {
    setUserInfo();

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isDeveloper) {
        const devSection = document.getElementById('developerSection');
        if (devSection) {
            devSection.style.display = 'block';
        }
    }
});
