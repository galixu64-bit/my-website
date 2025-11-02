// 我的资源页面

// 设置用户信息
function setUserInfo() {
    const avatarImg = document.getElementById('avatar');
    const userNameElement = document.getElementById('userName');
    const userInfo = document.getElementById('userInfo');
    
    // 检查登录状态
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    // 已登录，显示头像和名字
    if (userInfo) userInfo.style.display = 'flex';
    if (avatarImg) {
        avatarImg.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
    }
    if (userNameElement) {
        userNameElement.textContent = currentUser.username;
    }
}

// 加载我的资源
async function loadMyResources() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // 从 localStorage 读取资源
        let allResources = [];
        
        // 先尝试从 localStorage 读取
        const localResources = getResourcesFromLocalStorage();
        if (localResources && localResources.length > 0) {
            allResources = localResources;
        } else {
            // 从文件加载
            try {
                const response = await fetch('resources.json', { cache: 'no-cache' });
                if (response.ok) {
                    allResources = await response.json();
                }
            } catch (e) {
                console.error('加载文件失败:', e);
            }
        }
        
        // 筛选当前用户的资源
        const myResources = allResources.filter(resource => {
            const author = resource.author || resource.uploadedBy;
            return author === currentUser.username;
        });
        
        renderMyResources(myResources);
        
    } catch (error) {
        console.error('加载资源失败:', error);
        renderMyResources([]);
    }
}

// 从 localStorage 读取资源
function getResourcesFromLocalStorage() {
    try {
        const stored = localStorage.getItem('resources');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('读取本地存储失败:', error);
        return null;
    }
}

// 渲染我的资源
function renderMyResources(myResources) {
    const resourcesList = document.getElementById('myResourcesList');
    const noResults = document.getElementById('noMyResources');
    
    if (!resourcesList) return;
    
    resourcesList.innerHTML = '';
    
    if (myResources.length === 0) {
        if (noResults) noResults.classList.remove('hidden');
        return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    
    // 渲染每个资源
    myResources.forEach(resource => {
        const resourceCard = createMyResourceCard(resource);
        resourcesList.appendChild(resourceCard);
    });
}

// 创建我的资源卡片
function createMyResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    
    const isWebsite = resource.category === 'website';
    const buttonText = isWebsite ? '访问网站' : '下载';
    const buttonIcon = isWebsite ? '<i class="fas fa-link"></i>' : '<i class="fas fa-download"></i>';
    const buttonClass = isWebsite ? 'visit-btn' : 'download-btn';
    
    const uploadedDate = resource.uploadedAt ? new Date(resource.uploadedAt).toLocaleDateString('zh-CN') : '未知';
    const commentCount = getCommentCount(resource.id);
    
    // 处理资源图标：如果是 Font Awesome 类名则使用，否则显示为文本（兼容旧数据）
    let iconDisplay = '';
    if (resource.icon) {
        if (resource.icon.startsWith('fa-') || resource.icon.startsWith('fas ') || resource.icon.startsWith('far ') || resource.icon.startsWith('fab ')) {
            iconDisplay = `<i class="${resource.icon}"></i>`;
        } else {
            iconDisplay = resource.icon;
        }
    } else {
        iconDisplay = '<i class="fas fa-archive"></i>';
    }
    
    card.innerHTML = `
        <div class="resource-icon">${iconDisplay}</div>
        <div class="resource-info" style="flex: 1;">
            <h3 class="resource-name">${escapeHtml(resource.name)}</h3>
            <p class="resource-description">${escapeHtml(resource.description)}</p>
            <div class="resource-meta">
                <span class="resource-size"><i class="fas fa-box"></i> ${escapeHtml(resource.size)}</span>
                <span class="resource-format"><i class="fas fa-file"></i> ${escapeHtml(resource.format)}</span>
                <span style="color: #888;"><i class="fas fa-calendar"></i> ${uploadedDate}</span>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 15px; font-size: 0.9em; color: #888;">
                <span><i class="fas fa-comment"></i> ${commentCount} 条评论</span>
                <span><i class="fas fa-download"></i> 0 次下载</span>
            </div>
        </div>
        <div class="resource-actions-with-comment">
            <button class="${buttonClass}" onclick="${isWebsite ? 'visitWebsite' : 'downloadResource'}(${resource.id})">
                ${buttonIcon} ${buttonText}
            </button>
            <button class="comment-btn" onclick="window.location.href='index.html#resource-${resource.id}'">
                <i class="fas fa-comments"></i> 查看评论
            </button>
        </div>
    `;
    return card;
}

// HTML转义（防止XSS）
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 获取评论数量（需要从主页脚本引入或重新实现）
function getCommentCount(resourceId) {
    try {
        const commentsJson = localStorage.getItem(`comments_${resourceId}`);
        return commentsJson ? JSON.parse(commentsJson).length : 0;
    } catch (error) {
        return 0;
    }
}

// 下载/访问资源（简化版）
function downloadResource(resourceId) {
    // 从 localStorage 读取资源
    const allResources = getResourcesFromLocalStorage() || [];
    const resource = allResources.find(r => r.id === resourceId);
    
    if (resource) {
        if (resource.category === 'website') {
            window.open(resource.downloadUrl, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = resource.downloadUrl;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function visitWebsite(resourceId) {
    downloadResource(resourceId);
}

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    setUserInfo();
    loadMyResources();
});

