// 用户认证相关功能
// 独立的登录库存储键名
const USER_DATABASE_KEY = 'userDatabase';

// 初始化默认演示账户
function initDefaultUsers() {
    const users = getAllUsers();
    if (users.length === 0) {
        // 创建默认演示账户
        const demoUser = {
            id: 1,
            username: 'demo',
            password: '123456', // 在实际应用中应该加密
            email: 'demo@example.com',
            createdAt: new Date().toISOString(),
            isDeveloper: true // 演示账户标记为开发者
        };
        saveUser(demoUser);
        
        // 同时保存到独立的登录库
        saveUserToDatabase(demoUser);
    }
}

// 获取所有用户（从独立登录库）
function getAllUsers() {
    try {
        const usersJson = localStorage.getItem(USER_DATABASE_KEY);
        if (!usersJson) {
            // 如果没有登录库，尝试从旧的 users 键迁移
            const oldUsersJson = localStorage.getItem('users');
            if (oldUsersJson) {
                const oldUsers = JSON.parse(oldUsersJson);
                // 迁移到新的登录库
                localStorage.setItem(USER_DATABASE_KEY, oldUsersJson);
                localStorage.removeItem('users');
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

// 保存用户到独立的登录库
function saveUserToDatabase(user) {
    const users = getAllUsers();
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
function getUserByUsername(username) {
    const users = getAllUsers();
    return users.find(u => u.username === username);
}

// 注册新用户（保存到独立登录库）
function registerUser(username, password, email = '') {
    const users = getAllUsers();
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
        return { success: false, message: '用户名已存在' };
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        username: username,
        password: password, // 在实际应用中应该加密
        email: email,
        createdAt: new Date().toISOString(),
        isDeveloper: false
    };
    
    // 保存到独立登录库
    saveUserToDatabase(newUser);
    return { success: true, user: newUser };
}

// 登录
function login(username, password) {
    const user = getUserByUsername(username);
    
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

// 初始化
initDefaultUsers();

