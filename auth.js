// 用户认证相关功能
// 独立的登录库存储键名
const USER_DATABASE_KEY = 'userDatabase';
const JSON_USERS_LOADED_KEY = 'jsonUsersLoaded'; // 标记 JSON 文件是否已加载

// 从 JSON 文件加载用户数据
let jsonUsers = [];
let usersLoaded = false;

async function loadUsersFromJSON() {
    if (usersLoaded) {
        return jsonUsers;
    }
    
    try {
        const response = await fetch('users.json', {
            cache: 'no-cache'
        });
        
        if (response.ok) {
            const data = await response.json();
            jsonUsers = Array.isArray(data) ? data : [];
            console.log('从 users.json 加载用户数据，数量:', jsonUsers.length);
            usersLoaded = true;
            return jsonUsers;
        } else {
            console.warn('无法加载 users.json，使用默认数据');
            return [];
        }
    } catch (error) {
        console.error('加载 users.json 失败:', error);
        return [];
    }
}

// 初始化用户数据（从 JSON 文件 + localStorage）
async function initDefaultUsers() {
    // 从 JSON 文件加载初始用户
    const jsonUsers = await loadUsersFromJSON();
    
    // 从 localStorage 获取已保存的用户
    const localUsers = getAllUsersFromLocalStorage();
    
    // 合并数据：JSON 文件中的用户 + localStorage 中的用户
    // 如果用户名冲突，localStorage 中的优先（因为包含新注册的用户）
    const mergedUsers = [];
    const usernames = new Set();
    
    // 先添加 localStorage 中的用户（优先）
    localUsers.forEach(user => {
        if (!usernames.has(user.username)) {
            mergedUsers.push(user);
            usernames.add(user.username);
        }
    });
    
    // 再添加 JSON 文件中的用户（避免重复）
    jsonUsers.forEach(user => {
        if (!usernames.has(user.username)) {
            mergedUsers.push(user);
            usernames.add(user.username);
        }
    });
    
    // 如果合并后为空，创建默认演示账户
    if (mergedUsers.length === 0) {
        const demoUser = {
            id: 1,
            username: 'demo',
            password: '123456', // 在实际应用中应该加密
            email: 'demo@example.com',
            createdAt: new Date().toISOString(),
            isDeveloper: true // 演示账户标记为开发者
        };
        mergedUsers.push(demoUser);
    }
    
    // 保存合并后的数据到 localStorage
    if (mergedUsers.length > 0) {
        localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(mergedUsers));
        localStorage.setItem('users', JSON.stringify(mergedUsers)); // 向后兼容
    }
    
    return mergedUsers;
}

// 从 localStorage 获取用户（内部函数）
function getAllUsersFromLocalStorage() {
    try {
        const usersJson = localStorage.getItem(USER_DATABASE_KEY);
        if (!usersJson) {
            // 如果没有登录库，尝试从旧的 users 键迁移
            const oldUsersJson = localStorage.getItem('users');
            if (oldUsersJson) {
                const oldUsers = JSON.parse(oldUsersJson);
                // 迁移到新的登录库
                localStorage.setItem(USER_DATABASE_KEY, oldUsersJson);
                return oldUsers;
            }
            return [];
        }
        return JSON.parse(usersJson);
    } catch (error) {
        console.error('读取用户数据失败:', error);
        return [];
    }
}

// 获取所有用户（合并 JSON 文件和 localStorage）
async function getAllUsers() {
    // 如果还没初始化，先初始化
    if (!usersLoaded) {
        await initDefaultUsers();
    }
    
    // 返回 localStorage 中的数据（已经合并了 JSON 文件的数据）
    return getAllUsersFromLocalStorage();
}

// 同步版本（用于同步调用）
function getAllUsersSync() {
    return getAllUsersFromLocalStorage();
}

// 保存用户到独立的登录库（同步版本）
function saveUserToDatabase(user) {
    const users = getAllUsersSync();
    const existingIndex = users.findIndex(u => u.id === user.id || u.username === user.username);
    
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(users));
    
    // 同时更新旧的 users 键（向后兼容）
    localStorage.setItem('users', JSON.stringify(users));
}

// 保存用户（兼容旧方法，实际调用 saveUserToDatabase）
function saveUser(user) {
    saveUserToDatabase(user);
}

// 获取用户（从独立登录库）
async function getUserByUsername(username) {
    const users = await getAllUsers();
    return users.find(u => u.username === username);
}

// 同步版本
function getUserByUsernameSync(username) {
    const users = getAllUsersSync();
    return users.find(u => u.username === username);
}

// 暴露同步函数到全局
window.getUserByUsernameSync = getUserByUsernameSync;
window.getAllUsersSync = getAllUsersSync;

// 注册新用户（保存到独立登录库）
async function registerUser(email, password, username = '') {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { success: false, message: '请输入有效的邮箱地址' };
    }
    
    // 验证密码长度
    if (!password || password.length < 6) {
        return { success: false, message: '密码长度至少6个字符' };
    }
    
    const users = await getAllUsers();
    
    // 检查邮箱是否已存在
    if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: '该邮箱已被注册' };
    }
    
    // 如果没有提供用户名，使用邮箱前缀作为用户名
    const finalUsername = username.trim() || email.split('@')[0];
    
    // 检查用户名是否已存在（如果提供了用户名）
    if (username.trim() && users.find(u => u.username === finalUsername)) {
        return { success: false, message: '用户名已存在' };
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        username: finalUsername,
        password: password, // 在实际应用中应该加密
        email: email.toLowerCase(), // 邮箱统一转为小写存储
        createdAt: new Date().toISOString(),
        isDeveloper: false
    };
    
    // 保存到独立登录库（localStorage）
    saveUserToDatabase(newUser);
    return { success: true, user: newUser };
}

// 登录（异步版本）
async function loginAsync(username, password) {
    const user = await getUserByUsername(username);
    
    if (!user) {
        return { success: false, message: '用户名不存在' };
    }
    
    if (user.password !== password) {
        return { success: false, message: '密码错误' };
    }
    
    // 保存登录状态
    const session = {
        userId: user.id,
        username: user.username,
        isDeveloper: user.isDeveloper || false,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(session));
    return { success: true, user: user, session: session };
}

// 登录（支持邮箱或用户名登录）
function login(emailOrUsername, password) {
    if (!emailOrUsername || !password) {
        return { success: false, message: '请输入邮箱/用户名和密码' };
    }
    
    const users = getAllUsersSync();
    
    // 判断是邮箱还是用户名（包含@则为邮箱）
    const isEmail = emailOrUsername.includes('@');
    
    let user = null;
    if (isEmail) {
        // 邮箱登录
        user = users.find(u => u.email && u.email.toLowerCase() === emailOrUsername.toLowerCase());
        if (!user) {
            return { success: false, message: '邮箱不存在' };
        }
    } else {
        // 用户名登录
        user = users.find(u => u.username === emailOrUsername);
        if (!user) {
            return { success: false, message: '用户名不存在' };
        }
    }

    if (user.password !== password) {
        return { success: false, message: '密码错误' };
    }

    // 保存登录状态
    const session = {
        userId: user.id,
        username: user.username,
        email: user.email,
        isDeveloper: user.isDeveloper || false,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(session));
    return { success: true, user: user, session: session };
}

// 登出
function logout() {
    localStorage.removeItem('currentUser');
}

// 导出到全局作用域（供HTML onclick调用）
window.logoutAuth = logout;

// 获取当前登录用户
function getCurrentUser() {
    try {
        const sessionJson = localStorage.getItem('currentUser');
        return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (error) {
        return null;
    }
}

// 检查是否已登录
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// 检查是否是开发者
function isDeveloper() {
    const user = getCurrentUser();
    return user && user.isDeveloper;
}

// 导出所有用户数据为 JSON（用于备份）
function exportUsersToJSON() {
    const users = getAllUsersSync();
    const jsonString = JSON.stringify(users, null, 2);
    
    // 创建下载链接
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('用户数据已导出到 users.json');
}

// 将导出函数暴露到全局
window.exportUsersToJSON = exportUsersToJSON;

// 初始化（异步）
(async function() {
    await initDefaultUsers();
    console.log('用户数据初始化完成');
})();

