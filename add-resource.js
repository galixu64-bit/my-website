// 设置用户信息
function setUserInfo() {
    const avatarImg = document.getElementById('avatar');
    const userNameElement = document.getElementById('userName');
    const userInfo = document.getElementById('userInfo');
    const topRightButtons = document.getElementById('topRightButtons');
    
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        if (userInfo) userInfo.style.display = 'flex';
        if (avatarImg) {
            avatarImg.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
        }
        if (userNameElement) {
            userNameElement.textContent = currentUser.username;
        }
        
        if (topRightButtons) {
            topRightButtons.style.display = 'flex';
        }
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (topRightButtons) topRightButtons.style.display = 'none';
    }
}

// 图标预览
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!isLoggedIn()) {
        alert('请先登录后才能添加 dragbit');
        window.location.href = 'login.html';
        return;
    }
    
    setUserInfo();
    
    const iconInput = document.getElementById('resourceIcon');
    const iconPreview = document.getElementById('iconPreview');
    
    if (iconInput && iconPreview) {
        iconInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value) {
                if (value.startsWith('fa-') || value.startsWith('fas ') || value.startsWith('far ') || value.startsWith('fab ')) {
                    iconPreview.innerHTML = `<i class="${value}"></i>`;
                } else {
                    iconPreview.textContent = value;
                }
            } else {
                // 默认图标
                iconPreview.innerHTML = '<i class="fas fa-archive"></i>';
            }
        });
    }
    
    // 图片预览功能
    const imagesInput = document.getElementById('resourceImages');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imagesInput && imagePreview) {
        imagesInput.addEventListener('input', function() {
            const urls = this.value.split(',').map(url => url.trim()).filter(url => url);
            imagePreview.innerHTML = '';
            
            urls.forEach(url => {
                if (url) {
                    const imgWrapper = document.createElement('div');
                    imgWrapper.style.position = 'relative';
                    imgWrapper.style.borderRadius = '8px';
                    imgWrapper.style.overflow = 'hidden';
                    imgWrapper.style.border = '2px solid rgba(255,255,255,0.1)';
                    
                    const img = document.createElement('img');
                    img.src = url;
                    img.style.width = '100%';
                    img.style.height = '150px';
                    img.style.objectFit = 'cover';
                    img.style.cursor = 'pointer';
                    img.onerror = function() {
                        this.style.display = 'none';
                    };
                    img.onclick = function() {
                        window.open(url, '_blank');
                    };
                    
                    imgWrapper.appendChild(img);
                    imagePreview.appendChild(imgWrapper);
                }
            });
        });
    }
    
    // 表单提交
    const form = document.getElementById('resourceForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            generateJson();
        });
    }
});

// 生成并添加资源到列表
async function generateJson() {
    // 获取表单数据
    const name = document.getElementById('resourceName').value.trim();
    const description = document.getElementById('resourceDescription').value.trim();
    const details = document.getElementById('resourceDetails').value.trim();
    const tagsInput = document.getElementById('resourceTags').value.trim();
    const imagesInput = document.getElementById('resourceImages').value.trim();
    const videosInput = document.getElementById('resourceVideos').value.trim();
    const category = document.getElementById('resourceCategory').value;
    const size = document.getElementById('resourceSize').value.trim() || '-';
    const format = document.getElementById('resourceFormat').value.trim() || 'ZIP';
    const downloadUrl = document.getElementById('resourceUrl').value.trim();
    const icon = document.getElementById('resourceIcon').value.trim() || 'fas fa-archive';
    
    // 处理标签（分割并清理）
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // 处理图片（分割URL）
    const images = imagesInput ? imagesInput.split(',').map(img => img.trim()).filter(img => img) : [];
    
    // 处理视频（分割URL）
    const videos = videosInput ? videosInput.split(',').map(v => v.trim()).filter(v => v) : [];
    
    // 验证必填字段
    if (!name || !description || !category || !downloadUrl) {
        alert('请填写所有必填字段！');
        return;
    }
    
    // 根据分类设置默认图标
    const defaultIcons = {
        'software': '💻',
        'document': '📘',
        'media': '🎬',
        'website': '🌐',
        'other': '📦'
    };
    
    const finalIcon = icon || defaultIcons[category] || '📦';
    
    try {
        // 获取当前登录用户
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.username) {
            alert('请先登录后再上传资源！');
            window.location.href = 'login.html';
            return;
        }
        
        const authorName = currentUser.username;
        
        // 读取当前用户的资源列表（独立存储）
        let existingResources = [];
        const userResourcesKey = `resources_${authorName}`;
        try {
            const stored = localStorage.getItem(userResourcesKey);
            if (stored) {
                existingResources = JSON.parse(stored);
            }
        } catch (e) {
            console.error('读取用户资源失败:', e);
        }
        
        // 计算新的ID（基于用户自己的资源）
        let nextId = 1;
        if (Array.isArray(existingResources) && existingResources.length > 0) {
            const maxId = Math.max(...existingResources.map(r => r.id || 0));
            nextId = maxId + 1;
        }
        
        // 创建新资源对象
        const newResource = {
            id: nextId,
            name: name,
            description: description,
            details: details || description,
            tags: tags,
            images: images,
            videos: videos,
            category: category,
            size: size,
            format: format,
            downloadUrl: downloadUrl,
            icon: finalIcon,
            author: authorName,
            uploadedBy: authorName,
            uploadedAt: new Date().toISOString(),
            userId: currentUser.id || currentUser.username
        };
        
        // 添加到现有资源列表
        const updatedResources = [...existingResources, newResource];
        
        // 保存到 localStorage（按用户独立存储）
        saveResourcesToLocalStorage(updatedResources);
        
        // 生成完整的JSON（包含所有资源）
        const jsonString = JSON.stringify(updatedResources, null, 2);
        
        // 保存到全局变量，供下载和复制使用
        window.generatedJson = jsonString;
        
        // 显示成功消息并跳转
        showAddSuccessMessage(newResource.name);
        
        // 2秒后自动跳转到主页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('加载现有资源失败:', error);
        
        // 获取当前登录用户
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.username) {
            alert('请先登录后再上传资源！');
            window.location.href = 'login.html';
            return;
        }
        
        const authorName = currentUser.username;
        
        // 尝试从 localStorage 读取（按用户独立存储）
        let existingResources = [];
        const userResourcesKey = `resources_${authorName}`;
        try {
            const stored = localStorage.getItem(userResourcesKey);
            if (stored) {
                existingResources = JSON.parse(stored);
            }
        } catch (e) {
            console.error('读取用户资源失败:', e);
        }
        
        // 计算新的ID
        let nextId = 1;
        if (Array.isArray(existingResources) && existingResources.length > 0) {
            const maxId = Math.max(...existingResources.map(r => r.id || 0));
            nextId = maxId + 1;
        }
        
        // 创建新资源对象
        const newResource = {
            id: nextId,
            name: name,
            description: description,
            details: details || description,
            tags: tags,
            images: images,
            videos: videos,
            category: category,
            size: size,
            format: format,
            downloadUrl: downloadUrl,
            icon: finalIcon,
            author: authorName,
            uploadedBy: authorName,
            uploadedAt: new Date().toISOString(),
            userId: currentUser.id || currentUser.username
        };
        
        // 添加到现有资源列表
        const updatedResources = [...existingResources, newResource];
        
        // 保存到 localStorage（按用户独立存储）
        saveResourcesToLocalStorage(updatedResources);
        
        // 尝试保存到在线JSON库
        if (window.jsonStorage && window.jsonStorage.config.binId && window.jsonStorage.config.apiKey) {
            try {
                const allResources = getAllResourcesFromLocalStorage();
                await window.jsonStorage.save(allResources);
            } catch (error) {
            }
        }
        
        // 显示成功消息并跳转
        showAddSuccessMessage(newResource.name);
        
        // 2秒后自动跳转到主页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// 复制JSON到剪贴板
function copyJson() {
    const jsonText = window.generatedJson || document.getElementById('jsonCode').textContent;
    
    navigator.clipboard.writeText(jsonText).then(function() {
        showSuccessMessage('✅ 完整的 resources.json 已复制到剪贴板！\n\n请打开 resources.json 文件，替换全部内容。');
    }).catch(function(err) {
        console.error('复制失败:', err);
        // 备用方法
        const textArea = document.createElement('textarea');
        textArea.value = jsonText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showSuccessMessage('✅ 完整的 resources.json 已复制到剪贴板！');
        } catch (err) {
            alert('复制失败，请手动选择并复制');
        }
        document.body.removeChild(textArea);
    });
}

// 下载完整的 resources.json 文件
function downloadJson() {
    const jsonText = window.generatedJson || document.getElementById('jsonCode').textContent;
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = 'resources.json';  // 直接下载为 resources.json，方便替换
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessMessage('✅ resources.json 已下载！\n\n请将下载的文件替换项目中的 resources.json，然后刷新页面。');
}

// 显示成功消息
function showSuccessMessage(text) {
    const message = document.getElementById('successMessage');
    if (message) {
        if (text) {
            message.textContent = text;
        }
        message.classList.add('show');
        setTimeout(function() {
            message.classList.remove('show');
        }, 5000);
    }
}

// 保存资源到 localStorage（按用户独立存储）
function saveResourcesToLocalStorage(resources) {
    try {
        if (!resources || !Array.isArray(resources)) {
            console.error('保存失败：资源数据无效');
            alert('保存失败：资源数据无效');
            return;
        }
        
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.username) {
            const userResourcesKey = `resources_${currentUser.username}`;
            const resourcesJson = JSON.stringify(resources);
            localStorage.setItem(userResourcesKey, resourcesJson);
            localStorage.setItem(`${userResourcesKey}_updated`, Date.now().toString());
            
            const verify = localStorage.getItem(userResourcesKey);
            if (!verify) {
                console.error('保存失败：localStorage写入失败');
                alert('保存失败：浏览器存储空间可能已满或不可用');
                return;
            }
            
            updateGlobalResourcesList(resources);
        } else {
            console.error('保存失败：用户未登录');
            alert('保存失败：请先登录');
            return;
        }
    } catch (error) {
        console.error('保存资源时出错:', error);
        alert('保存失败：' + (error.message || '未知错误'));
    }
}

// 更新全局资源列表（所有用户共享）
function updateGlobalResourcesList(newResources) {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.username) return;
        
        let allResources = [];
        try {
            const stored = localStorage.getItem('all_resources');
            if (stored) {
                allResources = JSON.parse(stored);
            }
        } catch (e) {
            console.error('读取全局资源列表失败:', e);
        }
        
        // 移除当前用户的旧资源
        allResources = allResources.filter(r => {
            const author = r.author || r.uploadedBy;
            return author !== currentUser.username;
        });
        
        // 添加当前用户的新资源
        allResources = [...allResources, ...newResources];
        
        localStorage.setItem('all_resources', JSON.stringify(allResources));
        localStorage.setItem('all_resources_updated', Date.now().toString());
    } catch (error) {
    }
}

// 显示添加成功消息
function showAddSuccessMessage(resourceName) {
    // 隐藏表单，显示成功信息
    const form = document.getElementById('resourceForm');
    const jsonOutput = document.getElementById('jsonOutput');
    
    if (form) {
        form.style.display = 'none';
    }
    
    if (jsonOutput) {
        jsonOutput.classList.remove('hidden');
        jsonOutput.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
                <div class="json-title" style="font-size: 1.5em; margin-bottom: 20px;">
                    dragbit "${resourceName}" 已成功添加！
                </div>
                <div class="form-help" style="color: #10b981; margin-bottom: 30px;">
                    正在跳转到主页...
                </div>
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <a href="index.html" class="btn-submit" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                        立即查看
                    </a>
                    <button class="btn-cancel" onclick="location.reload()">
                        继续添加
                    </button>
                </div>
            </div>
        `;
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

