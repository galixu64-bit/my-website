
let resources = [];

let currentCategory = 'all';
let searchQuery = '';



/**
 * 从数据库加载资源数据
 * 在这里添加你的数据库API调用
 * 
 * 示例：
 * - REST API: fetch('/api/resources')
 * - GraphQL: 使用你的GraphQL客户端
 * - Firebase: 使用Firebase SDK
 * - Supabase: 使用Supabase客户端
 * 
 * 返回的数据格式应为：
 * [
 *   {
 *     id: number,
 *     name: string,
 *     description: string,
 *     category: 'software' | 'document' | 'media' | 'website' | 'other',
 *     size: string,
 *     format: string,
 *     downloadUrl: string,
 *     icon: string
 *   }
 * ]
 */
async function loadResourcesFromDatabase() {
    try {
        const localResources = getResourcesFromLocalStorage();
        const allResources = getAllResourcesFromLocalStorage();
        
        if (allResources && allResources.length > 0) {
            resources = allResources;
            renderResources();
            await loadResourcesFromFile();
            return;
        }
        
        if (localResources && localResources.length > 0) {
            resources = localResources;
            renderResources();
            await loadResourcesFromFile();
            return;
        }

        await loadResourcesFromFile();
        
        if (!resources || resources.length === 0) {
            resources = [];
        }
        
        renderResources();
        
    } catch (error) {
        resources = [];
        renderResources();
    }
}

function getResourcesFromLocalStorage() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.username) {
        return null;
    }
    
    try {
        const userResourcesKey = `resources_${currentUser.username}`;
        const stored = localStorage.getItem(userResourcesKey);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
    }
    return null;
}

function getAllResourcesFromLocalStorage() {
    const allResources = [];
    const resourceMap = new Map();
    
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('resources_') && key !== 'resources_updated' && !key.endsWith('_updated') && key !== 'all_resources') {
                try {
                    const userResources = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(userResources)) {
                        userResources.forEach(resource => {
                            const uniqueKey = `${resource.id}_${resource.author || resource.uploadedBy || 'unknown'}`;
                            if (!resourceMap.has(uniqueKey)) {
                                resourceMap.set(uniqueKey, resource);
                                allResources.push(resource);
                            }
                        });
                    }
                } catch (e) {
                }
            }
        }
        
        try {
            const globalResources = localStorage.getItem('all_resources');
            if (globalResources) {
                const parsed = JSON.parse(globalResources);
                if (Array.isArray(parsed)) {
                    parsed.forEach(resource => {
                        const uniqueKey = `${resource.id}_${resource.author || resource.uploadedBy || 'unknown'}`;
                        if (!resourceMap.has(uniqueKey)) {
                            resourceMap.set(uniqueKey, resource);
                            allResources.push(resource);
                        }
                    });
                }
            }
        } catch (e) {
        }
    } catch (error) {
    }
    
    return allResources;
}

async function loadResourcesFromFile() {
    try {
        let fileData = [];
        
        // 优先尝试从在线JSON库加载
        if (window.jsonStorage && window.jsonStorage.config.binId && window.jsonStorage.config.apiKey) {
            const onlineResult = await window.jsonStorage.load();
            if (onlineResult.success && onlineResult.data && onlineResult.data.length > 0) {
                fileData = onlineResult.data;
            }
        }
        
        // 如果在线加载失败，尝试从本地文件加载
        if (fileData.length === 0) {
            const response = await fetch('resources.json', {
                cache: 'no-cache'
            });
            
            if (response.ok) {
                fileData = await response.json();
            }
        }
        
        // 合并数据
        if (fileData.length > 0) {
            const allResources = getAllResourcesFromLocalStorage();
            if (!allResources || allResources.length === 0) {
                resources = fileData;
                renderResources();
            } else {
                const fileIds = new Set(fileData.map(r => r.id));
                const localOnly = allResources.filter(r => !fileIds.has(r.id));
                resources = [...fileData, ...localOnly];
                
                const currentUser = getCurrentUser();
                if (currentUser && currentUser.username) {
                    const userResources = resources.filter(r => {
                        const author = r.author || r.uploadedBy;
                        return author === currentUser.username;
                    });
                    if (userResources.length > 0) {
                        const userResourcesKey = `resources_${currentUser.username}`;
                        localStorage.setItem(userResourcesKey, JSON.stringify(userResources));
                    }
                }
                
                renderResources();
            }
        } else {
            const localResources = getResourcesFromLocalStorage();
            if (localResources) {
                resources = localResources;
                renderResources();
            } else {
                resources = [];
                renderResources();
            }
        }
    } catch (error) {

        const localResources = getResourcesFromLocalStorage();
        if (localResources) {
            resources = localResources;
            renderResources();
        } else {
            resources = [];
            renderResources();
        }
    }
}

function saveResourcesToLocalStorage(resourcesList) {
    try {
        localStorage.setItem('resources', JSON.stringify(resourcesList));
        localStorage.setItem('resources_updated', Date.now().toString());
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}

function setUserInfo() {
    const avatarImg = document.getElementById('avatar');
    const userNameElement = document.getElementById('userName');
    const userInfo = document.getElementById('userInfo');

    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const topRightButtons = document.getElementById('topRightButtons');
    
    if (currentUser) {

        if (userInfo) userInfo.style.display = 'flex';
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';

        if (avatarImg) {
            avatarImg.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
            avatarImg.style.display = 'block';
        }
        if (userNameElement) {
            userNameElement.textContent = currentUser.username;
        }
        
        if (topRightButtons) {
            topRightButtons.style.display = 'flex';
        }
    } else {

        if (userInfo) userInfo.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (topRightButtons) topRightButtons.style.display = 'none';
    }
}

function logout() {
    if (confirm('确定要登出吗？')) {
        if (window.logoutAuth) {
            window.logoutAuth();
        } else {
            localStorage.removeItem('currentUser');
        }
        window.location.reload();
    }
}

let isRendering = false;
let renderTimer = null;

function renderResources() {
    if (isRendering) {
        if (renderTimer) {
            cancelAnimationFrame(renderTimer);
        }
    }
    isRendering = true;
    
    const resourcesList = document.getElementById('resourcesList');
    const noResults = document.getElementById('noResults');
    
    if (!resourcesList) {
        isRendering = false;
        return;
    }

    const filteredResources = resources.filter(resource => {
        const matchesCategory = currentCategory === 'all' || resource.category === currentCategory;

        const searchLower = searchQuery.toLowerCase();
        const inName = resource.name && resource.name.toLowerCase().includes(searchLower);
        const inDesc = resource.description && resource.description.toLowerCase().includes(searchLower);
        const inTags = Array.isArray(resource.tags) && resource.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesSearch = inName || inDesc || inTags;
        return matchesCategory && matchesSearch;
    });
    
    renderTimer = requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        filteredResources.forEach(resource => {
            const resourceItem = createResourceCard(resource);
            fragment.appendChild(resourceItem);
        });

        resourcesList.replaceChildren(fragment);
        resourcesList.classList.toggle('empty', filteredResources.length === 0);

        if (noResults) {
            if (filteredResources.length === 0) {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        }
        
        isRendering = false;
        renderTimer = null;
    });
}

function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.style.cursor = 'pointer';
    card.onclick = function(e) {

        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        openResourceDetail(resource.id);
    };

    const isWebsite = resource.category === 'website';
    const buttonText = isWebsite ? (window.i18n ? i18n.t('visitWebsite') : '访问网站') : (window.i18n ? i18n.t('download') : '下载');
    const buttonIcon = isWebsite ? '<i class="fas fa-link"></i>' : '<i class="fas fa-download"></i>';
    const buttonClass = isWebsite ? 'visit-btn' : 'download-btn';

    const authorName = resource.author || resource.uploadedBy || (window.i18n ? i18n.t('anonymousUser') : '匿名用户');
    const uploaderLabel = window.i18n ? i18n.t('uploader') : '上传者：';
    const commentLabel = window.i18n ? i18n.t('comments') : '评论';
    const viewDetailsLabel = window.i18n ? i18n.t('viewDetails') : '查看详情';
    const commentCount = getCommentCount(resource.id);

    const tags = resource.tags || [];
    const tagsHtml = tags.length > 0 ? `
        <div class="resource-tags" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
            ${tags.map(tag => `<span class="resource-tag"><i class="fas fa-tag"></i> ${escapeHtml(tag)}</span>`).join('')}
        </div>
    ` : '';

    const previewImage = resource.images && resource.images.length > 0 ? 
        `<div class="resource-preview-image" style="margin-top: 10px; border-radius: 8px; overflow: hidden; max-height: 150px;">
            <img src="${resource.images[0]}" alt="预览图" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>` : '';

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
            ${previewImage}
            <div class="resource-meta">
                <span class="resource-size"><i class="fas fa-box"></i> ${escapeHtml(resource.size)}</span>
                <span class="resource-format"><i class="fas fa-file"></i> ${escapeHtml(resource.format)}</span>
            </div>
            ${tagsHtml}
            <div class="resource-author">
                <span class="resource-author-label">${uploaderLabel}</span>
                <span class="resource-author-name">${escapeHtml(authorName)}</span>
            </div>
        </div>
        <div class="resource-actions-with-comment">
            <button class="${buttonClass}" onclick="event.stopPropagation(); ${isWebsite ? 'visitWebsite' : 'downloadResource'}(${resource.id})">
                ${buttonIcon} ${buttonText}
            </button>
            <button class="comment-btn" onclick="event.stopPropagation(); openCommentModal(${resource.id})">
                <i class="fas fa-comment"></i> ${commentLabel} <span class="comment-count">${commentCount}</span>
            </button>
            <button class="comment-btn" onclick="event.stopPropagation(); openResourceDetail(${resource.id})" style="background: rgba(102, 126, 234, 0.2);">
                <i class="fas fa-eye"></i> ${viewDetailsLabel}
            </button>
        </div>
    `;
    return card;
}

function downloadResource(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
        if (!resource.downloadUrl || resource.downloadUrl === '#') {
            const message = window.i18n ? 
                i18n.t('downloadLinkNotConfigured').replace('{name}', resource.name) : 
                `dragbit "${resource.name}" 的下载链接尚未配置。`;
            alert(message);
            return;
        }

        const link = document.createElement('a');
        link.href = resource.downloadUrl;
        link.download = `${resource.name}.${resource.format.toLowerCase()}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showDownloadNotification(resource.name);
    }
}

function visitWebsite(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {

        const websiteUrl = resource.websiteUrl || resource.downloadUrl;
        
        if (!websiteUrl || websiteUrl === '#') {
            alert(`网站 "${resource.name}" 的链接尚未配置。`);
            return;
        }

        window.open(websiteUrl, '_blank');

        showVisitNotification(resource.name);
    }
}

function showDownloadNotification(resourceName) {

    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = `正在下载: ${resourceName}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showVisitNotification(resourceName) {

    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = `正在打开: ${resourceName}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function filterByCategory(category) {
    currentCategory = category;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    renderResources();
}

function handleSearch(query) {
    searchQuery = query;
    renderResources();
}




let currentCommentResourceId = null;

function getComments(resourceId) {
    try {
        const commentsJson = localStorage.getItem(`comments_${resourceId}`);
        return commentsJson ? JSON.parse(commentsJson) : [];
    } catch (error) {
        console.error('读取评论失败:', error);
        return [];
    }
}

function saveComment(resourceId, comment) {
    const comments = getComments(resourceId);
    comments.push(comment);
    localStorage.setItem(`comments_${resourceId}`, JSON.stringify(comments));
}

function getCommentCount(resourceId) {
    return getComments(resourceId).length;
}

function openCommentModal(resourceId) {
    currentCommentResourceId = resourceId;
    const resource = resources.find(r => r.id === resourceId);
    const modal = document.getElementById('commentModal');
    const resourceName = document.getElementById('commentResourceName');
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const commentLoginPrompt = document.getElementById('commentLoginPrompt');
    
    if (!modal) return;

    if (resourceName && resource) {
        const commentTitle = window.i18n ? i18n.t('comment') : '评论';
        resourceName.textContent = `💬 ${resource.name} ${commentTitle}`;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
        if (commentForm) commentForm.style.display = 'block';
        if (commentLoginPrompt) commentLoginPrompt.style.display = 'none';
    } else {
        if (commentForm) commentForm.style.display = 'none';
        if (commentLoginPrompt) commentLoginPrompt.style.display = 'block';
    }

    loadComments(resourceId);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    currentCommentResourceId = null;
}

function loadComments(resourceId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    const comments = getComments(resourceId);
    
    if (comments.length === 0) {
        const noCommentsText = window.i18n ? (translations[i18n.currentLang]['noCommentsYet'] || '暂无评论') : '暂无评论，成为第一个评论者吧！';
        commentsList.innerHTML = `<p style="text-align: center; color: #888; padding: 40px;">${noCommentsText}</p>`;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => {
        const date = new Date(comment.time);
        const timeStr = date.toLocaleString('zh-CN');
        const isDev = comment.isDeveloper ? '<span class="comment-author-badge">开发者</span>' : '';
        
        return `
            <div class="comment-item">
                <div class="comment-author">
                    <span class="comment-author-name">${comment.author}</span>
                    ${isDev}
                    <span class="comment-time">${timeStr}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            </div>
        `;
    }).join('');
}

function submitComment() {
    if (!currentCommentResourceId) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    const commentInput = document.getElementById('commentInput');
    if (!commentInput) return;
    
    const commentText = commentInput.value.trim();
    if (!commentText) {
        alert('请输入评论内容');
        return;
    }

    const comment = {
        id: Date.now(),
        resourceId: currentCommentResourceId,
        author: currentUser.username,
        text: commentText,
        time: new Date().toISOString(),
        isDeveloper: currentUser.isDeveloper || false
    };

    saveComment(currentCommentResourceId, comment);

    commentInput.value = '';

    loadComments(currentCommentResourceId);

    renderResources();

    showDownloadNotification('评论已发表！');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}




function openResourceDetail(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
        alert('dragbit 不存在');
        return;
    }
    
    const modal = document.getElementById('resourceDetailModal');
    const title = document.getElementById('detailResourceName');
    const body = document.getElementById('resourceDetailBody');
    
    if (!modal || !title || !body) return;

    let titleIcon = '';
    if (resource.icon) {
        if (resource.icon.startsWith('fa-') || resource.icon.startsWith('fas ') || resource.icon.startsWith('far ') || resource.icon.startsWith('fab ')) {
            titleIcon = `<i class="${resource.icon}"></i> `;
        } else {
            titleIcon = resource.icon + ' ';
        }
    } else {
        titleIcon = '<i class="fas fa-archive"></i> ';
    }
    title.innerHTML = titleIcon + escapeHtml(resource.name);

    let detailHtml = '';

    if (resource.images && resource.images.length > 0) {
        detailHtml += `
            <div class="resource-detail-section resource-detail-gallery">
                <h3 class="resource-detail-section-title"><i class="fas fa-images"></i> 展示图片</h3>
                <div class="resource-detail-images">
                    ${resource.images.map(img => `
                        <div class="resource-detail-image" onclick="window.open('${img}', '_blank')">
                            <img src="${img}" alt="展示图" onerror="this.parentElement.style.display='none'">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (resource.videos && resource.videos.length > 0) {
        detailHtml += `
            <div class="resource-detail-section resource-detail-videos">
                <h3 class="resource-detail-section-title"><i class="fas fa-video"></i> 展示视频</h3>
                ${resource.videos.map(videoUrl => {

                    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                    const youtubeMatch = videoUrl.match(youtubeRegex);

                    const bilibiliRegex = /(?:bilibili\.com\/video\/)([^"&?\/\s]+)/;
                    const bilibiliMatch = videoUrl.match(bilibiliRegex);
                    
                    if (youtubeMatch) {

                        return `
                            <div class="resource-detail-video">
                                <iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen></iframe>
                            </div>
                        `;
                    } else if (bilibiliMatch) {

                        return `
                            <div class="resource-detail-video">
                                <iframe src="https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}" 
                                        frameborder="0" 
                                        allowfullscreen></iframe>
                            </div>
                        `;
                    } else {

                        return `
                            <div class="resource-detail-video">
                                <video controls>
                                    <source src="${videoUrl}" type="video/mp4">
                                    您的浏览器不支持视频播放。
                                </video>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }

    const details = resource.details || resource.description || '';
    if (details) {
        detailHtml += `
            <div class="resource-detail-section">
                <h3 class="resource-detail-section-title"><i class="fas fa-align-left"></i> 详细说明</h3>
                <div class="resource-detail-text">${escapeHtml(details)}</div>
            </div>
        `;
    }

    if (resource.tags && resource.tags.length > 0) {
        detailHtml += `
            <div class="resource-detail-section">
                <h3 class="resource-detail-section-title"><i class="fas fa-tags"></i> 标签</h3>
                <div class="resource-detail-tags">
                    ${resource.tags.map(tag => `<span class="resource-detail-tag"><i class="fas fa-tag"></i> ${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `;
    }

    const authorName = resource.author || resource.uploadedBy || '匿名用户';
    const categoryNames = {
        'software': '软件',
        'document': '文档',
        'media': '媒体',
        'website': '网站',
        'other': '其他'
    };
    
    detailHtml += `
        <div class="resource-detail-section">
            <h3 class="resource-detail-section-title"><i class="fas fa-info-circle"></i> dragbit 信息</h3>
            <div class="resource-detail-info">
                <div class="resource-detail-info-item">
                    <div class="resource-detail-info-label">分类</div>
                    <div class="resource-detail-info-value">${categoryNames[resource.category] || resource.category}</div>
                </div>
                <div class="resource-detail-info-item">
                    <div class="resource-detail-info-label">大小</div>
                    <div class="resource-detail-info-value">${resource.size}</div>
                </div>
                <div class="resource-detail-info-item">
                    <div class="resource-detail-info-label">格式</div>
                    <div class="resource-detail-info-value">${resource.format}</div>
                </div>
                <div class="resource-detail-info-item">
                    <div class="resource-detail-info-label">上传者</div>
                    <div class="resource-detail-info-value">${escapeHtml(authorName)}</div>
                </div>
                ${resource.uploadedAt ? `
                <div class="resource-detail-info-item">
                    <div class="resource-detail-info-label">上传时间</div>
                    <div class="resource-detail-info-value">${new Date(resource.uploadedAt).toLocaleString('zh-CN')}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    const isWebsite = resource.category === 'website';
    detailHtml += `
        <div class="resource-detail-actions">
            <button class="download-btn" onclick="${isWebsite ? 'visitWebsite' : 'downloadResource'}(${resource.id}); closeResourceDetail();" style="flex: 1;">
                ${isWebsite ? `<i class="fas fa-link"></i> ${window.i18n ? i18n.t('visitWebsite') : '访问网站'}` : `<i class="fas fa-download"></i> ${window.i18n ? i18n.t('download') : '下载'} dragbit`}
            </button>
            <button class="comment-btn" onclick="closeResourceDetail(); openCommentModal(${resource.id});" style="flex: 1;">
                <i class="fas fa-comments"></i> ${window.i18n ? i18n.t('viewComments') : '查看评论'} (${getCommentCount(resource.id)})
            </button>
        </div>
    `;
    
    body.innerHTML = detailHtml;
    modal.classList.remove('hidden');

    document.body.style.overflow = 'hidden';
}

function closeResourceDetail() {
    const modal = document.getElementById('resourceDetailModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('resourceDetailModal');
    if (modal && e.target === modal) {
        closeResourceDetail();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('resourceDetailModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeResourceDetail();
        }
    }
});

document.addEventListener('click', function(e) {
    const modal = document.getElementById('commentModal');
    if (modal && e.target === modal) {
        closeCommentModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dragbit 加载完成！🎉');

    if (!isLoggedIn()) {
        showLoginRequired();
        return;
    }

    setUserInfo();

    loadResourcesFromDatabase();

    window.addEventListener('languageChanged', function(e) {

        if (!isLoggedIn()) {
            showLoginRequired();
            return;
        }

        if (resources && resources.length > 0) {
            renderResources();
        }

        const modal = document.getElementById('commentModal');
        if (modal && !modal.classList.contains('hidden') && currentCommentResourceId) {
            loadComments(currentCommentResourceId);
        }
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterByCategory(this.dataset.category);
    });
});

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch(this.value);
            }
        });
    }
});

function showLoginRequired() {
    const main = document.querySelector('main');
    if (main) {

        const i18n = window.i18n;
        const loginRequiredTitle = (i18n && typeof i18n.t === 'function') ? i18n.t('loginRequired') : '需要登录';
        const loginRequiredMsg = (i18n && typeof i18n.t === 'function') ? i18n.t('loginRequiredMessage') : '您需要登录后才能查看资源内容\n请先登录或注册账号';
        const loginLabel = (i18n && typeof i18n.t === 'function') ? i18n.t('login') : '登录';
        const registerLabel = (i18n && typeof i18n.t === 'function') ? i18n.t('register') : '注册';
        const messageLines = loginRequiredMsg.split('\n');
        
        main.innerHTML = `
            <div class="login-required-container">
                <div class="login-required-box">
                    <div class="login-required-icon">
                        <i class="fas fa-lock" style="font-size: 4em; color: #667eea; margin-bottom: 20px;"></i>
                    </div>
                    <h2>${loginRequiredTitle}</h2>
                    <p style="color: #b0b0b0; margin: 20px 0; line-height: 1.6;">
                        ${messageLines.map(line => line + '<br>').join('')}
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
                        <a href="login.html" class="download-btn" style="text-decoration: none; padding: 12px 30px;">
                            <i class="fas fa-sign-in-alt"></i> ${loginLabel}
                        </a>
                        <a href="register.html" class="visit-btn" style="text-decoration: none; padding: 12px 30px;">
                            <i class="fas fa-user-plus"></i> ${registerLabel}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    const searchSection = document.querySelector('.search-filter-section');
    if (searchSection) {
        searchSection.style.display = 'none';
    }

    const resourcesContainer = document.querySelector('.resources-container');
    if (resourcesContainer) {
        resourcesContainer.style.display = 'none';
    }
}