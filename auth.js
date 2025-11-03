

const USER_DATABASE_KEY = 'userDatabase';
const JSON_USERS_LOADED_KEY = 'jsonUsersLoaded'; 

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

async function initDefaultUsers() {
    console.log('initDefaultUsers: 开始初始化用户数据');
    
    const jsonUsers = await loadUsersFromJSON();
    console.log('从 users.json 加载的用户:', jsonUsers);

    const localUsers = getAllUsersFromLocalStorage();
    console.log('从 localStorage 获取的用户:', localUsers);

    const mergedUsers = [];
    const usernames = new Set();
    const emails = new Set();

    localUsers.forEach(user => {
        if (!user) return;
        const emailKey = user.email ? user.email.toLowerCase().trim() : '';
        const usernameKey = (user.username || '').trim();
        
        let shouldAdd = false;
        let reason = '';
        
        if (emailKey) {
            if (!emails.has(emailKey)) {
                shouldAdd = true;
                reason = 'email not found';
                emails.add(emailKey);
            } else {
                reason = 'email already exists';
                const existingUser = mergedUsers.find(u => u.email && u.email.toLowerCase() === emailKey);
                if (existingUser) {
                    console.log('更新已有用户（邮箱匹配）:', emailKey, '从', existingUser, '到', user);
                    const index = mergedUsers.indexOf(existingUser);
                    mergedUsers[index] = user;
                    reason = 'email matched, updated';
                }
            }
        } else if (usernameKey) {
            if (!usernames.has(usernameKey)) {
                shouldAdd = true;
                reason = 'username not found';
                usernames.add(usernameKey);
            } else {
                reason = 'username already exists';
                const existingUser = mergedUsers.find(u => u.username === usernameKey && !u.email);
                if (existingUser) {
                    console.log('更新已有用户（用户名匹配）:', usernameKey, '从', existingUser, '到', user);
                    const index = mergedUsers.indexOf(existingUser);
                    mergedUsers[index] = user;
                    reason = 'username matched, updated';
                }
            }
        }
        
        if (shouldAdd) {
            mergedUsers.push(user);
            if (usernameKey && !usernames.has(usernameKey)) {
                usernames.add(usernameKey);
            }
            console.log('添加 localStorage 用户:', user.email || user.username, '-', reason);
        } else if (!reason.includes('updated')) {
            console.log('跳过 localStorage 用户:', user.email || user.username, '-', reason);
        }
    });

    jsonUsers.forEach(user => {
        if (!user) return;
        const emailKey = user.email ? user.email.toLowerCase().trim() : '';
        const usernameKey = (user.username || '').trim();
        
        let shouldAdd = false;
        let reason = '';
        
        if (emailKey) {
            if (!emails.has(emailKey)) {
                shouldAdd = true;
                reason = 'email not found';
                emails.add(emailKey);
            } else {
                reason = 'email already exists (skipped)';
            }
        } else if (usernameKey) {
            if (!usernames.has(usernameKey)) {
                shouldAdd = true;
                reason = 'username not found';
                usernames.add(usernameKey);
            } else {
                reason = 'username already exists (skipped)';
            }
        }
        
        if (shouldAdd) {
            mergedUsers.push(user);
            if (usernameKey && !usernames.has(usernameKey)) {
                usernames.add(usernameKey);
            }
            console.log('添加 JSON 用户:', user.email || user.username, '-', reason);
        } else {
            console.log('跳过 JSON 用户:', user.email || user.username, '-', reason);
        }
    });

    if (mergedUsers.length === 0) {
        console.log('没有用户数据，创建默认 demo 用户');
        const demoUser = {
            id: 1,
            username: 'demo',
            password: '123456', 
            email: 'demo@example.com',
            createdAt: new Date().toISOString(),
            isDeveloper: true 
        };
        mergedUsers.push(demoUser);
    }

    console.log('合并后的用户总数:', mergedUsers.length);
    console.log('合并后的用户列表:', mergedUsers);

    if (mergedUsers.length > 0) {
        localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(mergedUsers));
        localStorage.setItem('users', JSON.stringify(mergedUsers));
        console.log('用户数据已保存到 localStorage');
    }
    
    usersLoaded = true;
    return mergedUsers;
}

function getAllUsersFromLocalStorage() {
    try {
        const usersJson = localStorage.getItem(USER_DATABASE_KEY);
        if (usersJson) {
            const users = JSON.parse(usersJson);
            if (Array.isArray(users)) {
                return users.filter(u => u !== null && u !== undefined);
            }
            return [];
        }

        const oldUsersJson = localStorage.getItem('users');
        if (oldUsersJson) {
            const oldUsers = JSON.parse(oldUsersJson);
            if (Array.isArray(oldUsers)) {
                localStorage.setItem(USER_DATABASE_KEY, oldUsersJson);
                return oldUsers.filter(u => u !== null && u !== undefined);
            }
        }
        return [];
    } catch (error) {
        console.error('读取用户数据失败:', error);
        return [];
    }
}

async function getAllUsers() {

    if (!usersLoaded) {
        await initDefaultUsers();
    }

    return getAllUsersFromLocalStorage();
}

function getAllUsersSync() {
    return getAllUsersFromLocalStorage();
}

function saveUserToDatabase(user) {
    console.log('保存用户到数据库:', user);
    
    const users = getAllUsersSync();
    console.log('当前用户列表:', users);
    
    const existingIndex = users.findIndex(u => 
        (u.id && user.id && u.id === user.id) || 
        (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        (u.username && user.username && u.username === user.username)
    );
    
    if (existingIndex >= 0) {
        console.log('更新现有用户，索引:', existingIndex);
        users[existingIndex] = user;
    } else {
        console.log('添加新用户');
        users.push(user);
    }
    
    console.log('保存后的用户列表:', users);
    console.log('用户数量:', users.length);
    
    localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(users));
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('用户数据已保存到 localStorage');
}

function saveUser(user) {
    saveUserToDatabase(user);
}

async function getUserByUsername(username) {
    const users = await getAllUsers();
    return users.find(u => u.username === username);
}

function getUserByUsernameSync(username) {
    const users = getAllUsersSync();
    return users.find(u => u.username === username);
}

window.getUserByUsernameSync = getUserByUsernameSync;
window.getAllUsersSync = getAllUsersSync;

async function registerUser(email, password, username = '') {
    console.log('开始注册用户:', { email, username });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { success: false, message: '请输入有效的邮箱地址' };
    }

    if (!password || password.length < 6) {
        return { success: false, message: '密码长度至少6个字符' };
    }
    
    await initDefaultUsers();
    
    const users = getAllUsersSync();
    console.log('注册时获取到的用户列表:', users);
    console.log('当前用户数量:', users.length);

    if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        console.log('邮箱已被注册:', email);
        return { success: false, message: '该邮箱已被注册' };
    }

    const finalUsername = username.trim() || email.split('@')[0];

    if (username.trim() && users.find(u => u.username === finalUsername)) {
        console.log('用户名已存在:', finalUsername);
        return { success: false, message: '用户名已存在' };
    }

    const newUser = {
        id: Date.now(),
        username: finalUsername,
        password: password, 
        email: email.toLowerCase(), 
        createdAt: new Date().toISOString(),
        isDeveloper: false
    };

    console.log('准备保存新用户:', newUser);
    saveUserToDatabase(newUser);
    
    const savedUsers = getAllUsersSync();
    console.log('保存后验证 - 用户数量:', savedUsers.length);
    console.log('保存后验证 - 用户列表:', savedUsers);
    
    const savedUser = savedUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!savedUser) {
        console.error('错误：用户保存失败！');
        return { success: false, message: '用户保存失败，请重试' };
    }
    
    console.log('用户注册成功:', savedUser);
    return { success: true, user: savedUser };
}

async function loginAsync(emailOrUsername, password) {
    if (!emailOrUsername || !password) {
        return { success: false, message: '请输入邮箱/用户名和密码' };
    }
    
    const users = await getAllUsers();

    const isEmail = emailOrUsername.includes('@');
    
    let user = null;
    if (isEmail) {

        user = users.find(u => u.email && u.email.toLowerCase() === emailOrUsername.toLowerCase());
        if (!user) {
            return { success: false, message: '邮箱不存在' };
        }
    } else {

        user = users.find(u => u.username === emailOrUsername);
        if (!user) {
            return { success: false, message: '用户名不存在' };
        }
    }

    if (user.password !== password) {
        return { success: false, message: '密码错误' };
    }

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

function login(emailOrUsername, password) {
    if (!emailOrUsername || !password) {
        return { success: false, message: '请输入邮箱/用户名和密码' };
    }
    
    const users = getAllUsersSync();

    const isEmail = emailOrUsername.includes('@');
    
    let user = null;
    if (isEmail) {

        user = users.find(u => u.email && u.email.toLowerCase() === emailOrUsername.toLowerCase());
        if (!user) {
            return { success: false, message: '邮箱不存在' };
        }
    } else {

        user = users.find(u => u.username === emailOrUsername);
        if (!user) {
            return { success: false, message: '用户名不存在' };
        }
    }

    if (user.password !== password) {
        return { success: false, message: '密码错误' };
    }

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

function logout() {
    localStorage.removeItem('currentUser');
}

window.logoutAuth = logout;

function getCurrentUser() {
    try {
        const sessionJson = localStorage.getItem('currentUser');
        return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (error) {
        return null;
    }
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isDeveloper() {
    const user = getCurrentUser();
    return user && user.isDeveloper;
}

function exportUsersToJSON() {
    const users = getAllUsersSync();
    const jsonString = JSON.stringify(users, null, 2);

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

window.exportUsersToJSON = exportUsersToJSON;

(async function() {
    await initDefaultUsers();
    console.log('用户数据初始化完成');
})();

