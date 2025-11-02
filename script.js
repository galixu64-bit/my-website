// 资源库数据（从数据库加载）
let resources = [];

// 当前选中的分类
let currentCategory = 'all';
let searchQuery = '';

// ============================================
// 数据库连接接口
// ============================================
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
        // 首先尝试从 localStorage 读取（用户添加的新资源）
        const localResources = getResourcesFromLocalStorage();
        
        if (localResources && localResources.length > 0) {
            console.log('从本地存储加载资源，数量:', localResources.length);
            resources = localResources;
            renderResources();
            
            // 同时加载文件，用于同步
            loadResourcesFromFile();
            return;
        }
        
        // 如果没有本地存储，从文件加载
        await loadResourcesFromFile();
        
    } catch (error) {
        console.error('加载资源时出错:', error);
        resources = [];
        renderResources();
    }
}

// 从 localStorage 读取资源
function getResourcesFromLocalStorage() {
    try {
        const stored = localStorage.getItem('resources');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('读取本地存储失败:', error);
    }
    return null;
}

// 从文件加载资源
async function loadResourcesFromFile() {
    try {
        console.log('开始加载 resources.json...');
        const response = await fetch('resources.json', {
            cache: 'no-cache'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('从文件加载成功，资源数量:', data.length);
            
            // 如果 localStorage 中没有数据，使用文件数据
            const localResources = getResourcesFromLocalStorage();
            if (!localResources || localResources.length === 0) {
                resources = data;
                renderResources();
            }
            // 如果 localStorage 中有数据，合并（文件中的优先，避免冲突）
            else {
                // 合并策略：以 localStorage 为主（用户新添加的），但确保 ID 不冲突
                const fileIds = new Set(data.map(r => r.id));
                const localOnly = localResources.filter(r => !fileIds.has(r.id));
                resources = [...data, ...localOnly];
                // 保存合并后的结果
                saveResourcesToLocalStorage(resources);
                renderResources();
            }
        } else {
            console.error('加载文件失败:', response.status);
            // 如果文件加载失败，使用 localStorage
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
        console.error('加载文件时出错:', error);
        // 如果文件加载失败，使用 localStorage
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

// 保存资源到 localStorage（用于合并时）
function saveResourcesToLocalStorage(resourcesList) {
    try {
        localStorage.setItem('resources', JSON.stringify(resourcesList));
        localStorage.setItem('resources_updated', Date.now().toString());
    } catch (error) {
        console.error('保存到本地存储失败:', error);
    }
}

// 设置用户信息
function setUserInfo() {
    const avatarImg = document.getElementById('avatar');
    const userNameElement = document.getElementById('userName');
    const userInfo = document.getElementById('userInfo');
    
    // 检查登录状态
    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (currentUser) {
        // 已登录，显示头像和用户信息
        if (userInfo) userInfo.style.display = 'flex';
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        // 使用在线头像服务（基于用户名生成固定头像）
        if (avatarImg) {
            avatarImg.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
        }
        if (userNameElement) {
            userNameElement.textContent = currentUser.username;
        }
    } else {
        // 未登录，隐藏头像和名字，显示登录按钮
        if (userInfo) userInfo.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// 登出功能（全局函数，供HTML调用）
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

// 渲染资源列表
function renderResources() {
    const resourcesList = document.getElementById('resourcesList');
    const noResults = document.getElementById('noResults');
    
    console.log('渲染资源列表，当前资源数量:', resources.length);
    console.log('当前分类:', currentCategory);
    console.log('搜索关键词:', searchQuery);
    
    if (!resourcesList) {
        console.error('找不到 resourcesList 元素！');
        return;
    }
    
    // 筛选资源
    let filteredResources = resources.filter(resource => {
        const matchesCategory = currentCategory === 'all' || resource.category === currentCategory;
        // 搜索关键词不仅支持name/description，同时支持tags匹配
        const searchLower = searchQuery.toLowerCase();
        const inName = resource.name && resource.name.toLowerCase().includes(searchLower);
        const inDesc = resource.description && resource.description.toLowerCase().includes(searchLower);
        const inTags = Array.isArray(resource.tags) && resource.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesSearch = inName || inDesc || inTags;
        return matchesCategory && matchesSearch;
    });
    
    console.log('筛选后的资源数量:', filteredResources.length);
    
    // 清空列表
    resourcesList.innerHTML = '';
    
    // 显示或隐藏"无结果"提示
    if (filteredResources.length === 0) {
        console.log('没有资源，显示"无结果"提示');
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        
        // 渲染每个资源
        filteredResources.forEach(resource => {
            console.log('渲染资源:', resource.name);
            const resourceItem = createResourceCard(resource);
            resourcesList.appendChild(resourceItem);
        });
    }
}

// 创建资源卡片
function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.style.cursor = 'pointer';
    card.onclick = function(e) {
        // 如果点击的是按钮，不触发详情
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        openResourceDetail(resource.id);
    };
    
    // 网站类型显示"访问网站"按钮，其他类型显示"下载"按钮
    const isWebsite = resource.category === 'website';
    const buttonText = isWebsite ? (window.i18n ? i18n.t('visitWebsite') : '访问网站') : (window.i18n ? i18n.t('download') : '下载');
    const buttonIcon = isWebsite ? '<i class="fas fa-link"></i>' : '<i class="fas fa-download"></i>';
    const buttonClass = isWebsite ? 'visit-btn' : 'download-btn';
    
    // 获取上传者信息
    const authorName = resource.author || resource.uploadedBy || (window.i18n ? i18n.t('anonymousUser') : '匿名用户');
    const uploaderLabel = window.i18n ? i18n.t('uploader') : '上传者：';
    const commentLabel = window.i18n ? i18n.t('comments') : '评论';
    const viewDetailsLabel = window.i18n ? i18n.t('viewDetails') : '查看详情';
    const commentCount = getCommentCount(resource.id);
    
    // 处理标签
    const tags = resource.tags || [];
    const tagsHtml = tags.length > 0 ? `
        <div class="resource-tags" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
            ${tags.map(tag => `<span class="resource-tag"><i class="fas fa-tag"></i> ${escapeHtml(tag)}</span>`).join('')}
        </div>
    ` : '';
    
    // 如果有图片，显示第一张作为预览
    const previewImage = resource.images && resource.images.length > 0 ? 
        `<div class="resource-preview-image" style="margin-top: 10px; border-radius: 8px; overflow: hidden; max-height: 150px;">
            <img src="${resource.images[0]}" alt="预览图" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>` : '';
    
    // 处理资源图标：如果是 Font Awesome 类名则使用，否则显示为文本（兼容旧数据）
    let iconDisplay = '';
    if (resource.icon) {
        if (resource.icon.startsWith('fa-') || resource.icon.startsWith('fas ') || resource.icon.startsWith('far ') || resource.icon.startsWith('fab ')) {
            // Font Awesome 图标
            iconDisplay = `<i class="${resource.icon}"></i>`;
        } else {
            // Emoji 或其他文本图标（向后兼容）
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

// 下载资源
function downloadResource(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
        if (!resource.downloadUrl || resource.downloadUrl === '#') {
            alert(`dragbit "${resource.name}" 的下载链接尚未配置。`);
            return;
        }
        
        // 创建下载链接并触发下载
        const link = document.createElement('a');
        link.href = resource.downloadUrl;
        link.download = `${resource.name}.${resource.format.toLowerCase()}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 显示下载提示
        showDownloadNotification(resource.name);
    }
}

// 访问网站
function visitWebsite(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
        // 网站类型可以使用 downloadUrl 作为网站链接，或者使用 websiteUrl
        const websiteUrl = resource.websiteUrl || resource.downloadUrl;
        
        if (!websiteUrl || websiteUrl === '#') {
            alert(`网站 "${resource.name}" 的链接尚未配置。`);
            return;
        }
        
        // 直接在新标签页打开网站
        window.open(websiteUrl, '_blank');
        
        // 显示访问提示
        showVisitNotification(resource.name);
    }
}

// 显示下载通知
function showDownloadNotification(resourceName) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = `正在下载: ${resourceName}`;
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 显示访问网站通知
function showVisitNotification(resourceName) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.textContent = `正在打开: ${resourceName}`;
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 分类筛选
function filterByCategory(category) {
    currentCategory = category;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // 重新渲染
    renderResources();
}

// 搜索功能
function handleSearch(query) {
    searchQuery = query;
    renderResources();
}

// ============================================
// 评论功能
// ============================================

let currentCommentResourceId = null;

// 获取评论
function getComments(resourceId) {
    try {
        const commentsJson = localStorage.getItem(`comments_${resourceId}`);
        return commentsJson ? JSON.parse(commentsJson) : [];
    } catch (error) {
        console.error('读取评论失败:', error);
        return [];
    }
}

// 保存评论
function saveComment(resourceId, comment) {
    const comments = getComments(resourceId);
    comments.push(comment);
    localStorage.setItem(`comments_${resourceId}`, JSON.stringify(comments));
}

// 获取评论数量
function getCommentCount(resourceId) {
    return getComments(resourceId).length;
}

// 打开评论模态框
function openCommentModal(resourceId) {
    currentCommentResourceId = resourceId;
    const resource = resources.find(r => r.id === resourceId);
    const modal = document.getElementById('commentModal');
    const resourceName = document.getElementById('commentResourceName');
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const commentLoginPrompt = document.getElementById('commentLoginPrompt');
    
    if (!modal) return;
    
    // 设置资源名称
    if (resourceName && resource) {
        const commentTitle = window.i18n ? i18n.t('comment') : '评论';
        resourceName.textContent = `💬 ${resource.name} ${commentTitle}`;
    }
    
    // 检查登录状态
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (commentForm) commentForm.style.display = 'block';
        if (commentLoginPrompt) commentLoginPrompt.style.display = 'none';
    } else {
        if (commentForm) commentForm.style.display = 'none';
        if (commentLoginPrompt) commentLoginPrompt.style.display = 'block';
    }
    
    // 加载并显示评论
    loadComments(resourceId);
    
    // 显示模态框
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 关闭评论模态框
function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    currentCommentResourceId = null;
}

// 加载评论
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

// 提交评论
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
    
    // 创建评论
    const comment = {
        id: Date.now(),
        resourceId: currentCommentResourceId,
        author: currentUser.username,
        text: commentText,
        time: new Date().toISOString(),
        isDeveloper: currentUser.isDeveloper || false
    };
    
    // 保存评论
    saveComment(currentCommentResourceId, comment);
    
    // 清空输入框
    commentInput.value = '';
    
    // 重新加载评论
    loadComments(currentCommentResourceId);
    
    // 重新渲染资源列表（更新评论数量）
    renderResources();
    
    // 显示成功提示
    showDownloadNotification('评论已发表！');
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 资源详情功能
// ============================================

// 打开资源详情
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
    
    // 设置标题
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
    
    // 构建详情内容
    let detailHtml = '';
    
    // 图片展示
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
    
    // 视频展示
    if (resource.videos && resource.videos.length > 0) {
        detailHtml += `
            <div class="resource-detail-section resource-detail-videos">
                <h3 class="resource-detail-section-title"><i class="fas fa-video"></i> 展示视频</h3>
                ${resource.videos.map(videoUrl => {
                    // 检测是否为 YouTube 链接
                    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                    const youtubeMatch = videoUrl.match(youtubeRegex);
                    
                    // 检测是否为 Bilibili 链接
                    const bilibiliRegex = /(?:bilibili\.com\/video\/)([^"&?\/\s]+)/;
                    const bilibiliMatch = videoUrl.match(bilibiliRegex);
                    
                    if (youtubeMatch) {
                        // YouTube 嵌入
                        return `
                            <div class="resource-detail-video">
                                <iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen></iframe>
                            </div>
                        `;
                    } else if (bilibiliMatch) {
                        // Bilibili 嵌入
                        return `
                            <div class="resource-detail-video">
                                <iframe src="https://player.bilibili.com/player.html?bvid=${bilibiliMatch[1]}" 
                                        frameborder="0" 
                                        allowfullscreen></iframe>
                            </div>
                        `;
                    } else {
                        // 普通视频链接
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
    
    // 详细说明
    const details = resource.details || resource.description || '';
    if (details) {
        detailHtml += `
            <div class="resource-detail-section">
                <h3 class="resource-detail-section-title"><i class="fas fa-align-left"></i> 详细说明</h3>
                <div class="resource-detail-text">${escapeHtml(details)}</div>
            </div>
        `;
    }
    
    // 标签
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
    
    // 资源信息
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
    
    // 操作按钮
    const isWebsite = resource.category === 'website';
    detailHtml += `
        <div class="resource-detail-actions">
            <button class="download-btn" onclick="${isWebsite ? 'visitWebsite' : 'downloadResource'}(${resource.id}); closeResourceDetail();" style="flex: 1;">
                ${isWebsite ? '<i class="fas fa-link"></i> 访问网站' : '<i class="fas fa-download"></i> 下载 dragbit'}
            </button>
            <button class="comment-btn" onclick="closeResourceDetail(); openCommentModal(${resource.id});" style="flex: 1;">
                <i class="fas fa-comments"></i> 查看评论 (${getCommentCount(resource.id)})
            </button>
        </div>
    `;
    
    body.innerHTML = detailHtml;
    modal.classList.remove('hidden');
    
    // 阻止背景滚动
    document.body.style.overflow = 'hidden';
}

// 关闭资源详情
function closeResourceDetail() {
    const modal = document.getElementById('resourceDetailModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    document.body.style.overflow = '';
}

// 点击模态框外部关闭详情
document.addEventListener('click', function(e) {
    const modal = document.getElementById('resourceDetailModal');
    if (modal && e.target === modal) {
        closeResourceDetail();
    }
});

// ESC键关闭详情
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('resourceDetailModal');
        if (modal && !modal.classList.contains('hidden')) {
            closeResourceDetail();
        }
    }
});

// 点击模态框外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('commentModal');
    if (modal && e.target === modal) {
        closeCommentModal();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dragbit 加载完成！🎉');
    
    // 检查登录状态 - 未登录不允许查看任何内容
    if (!isLoggedIn()) {
        showLoginRequired();
        return;
    }
    
    // 先设置用户信息（检查登录状态）
    setUserInfo();
    
    // 从数据库加载资源（只有登录后才能加载）
    loadResourcesFromDatabase();
    
    // 监听语言切换事件
    window.addEventListener('languageChanged', function(e) {
        // 重新渲染资源列表以更新文本
        if (resources && resources.length > 0) {
            renderResources();
        }
        // 如果评论模态框打开，重新加载
        const modal = document.getElementById('commentModal');
        if (modal && !modal.classList.contains('hidden') && currentCommentResourceId) {
            loadComments(currentCommentResourceId);
        }
    });
    
    // 绑定分类筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterByCategory(this.dataset.category);
        });
    });
    
    // 绑定搜索输入框
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });
        
        // 添加搜索框回车事件
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch(this.value);
            }
        });
    }
});

// 显示登录要求提示
function showLoginRequired() {
    const main = document.querySelector('main');
    if (main) {
        const loginRequiredTitle = window.i18n ? i18n.t('loginRequired') : '需要登录';
        const loginRequiredMsg = window.i18n ? i18n.t('loginRequiredMessage') : '您需要登录后才能查看资源内容\n请先登录或注册账号';
        const loginLabel = window.i18n ? i18n.t('login') : '登录';
        const registerLabel = window.i18n ? i18n.t('register') : '注册';
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
    
    // 隐藏搜索和筛选区域
    const searchSection = document.querySelector('.search-filter-section');
    if (searchSection) {
        searchSection.style.display = 'none';
    }
    
    // 隐藏 dragbit 列表
    const resourcesContainer = document.querySelector('.resources-container');
    if (resourcesContainer) {
        resourcesContainer.style.display = 'none';
    }
}
