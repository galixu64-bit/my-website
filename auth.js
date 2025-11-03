

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

    const jsonUsers = await loadUsersFromJSON();

    const localUsers = getAllUsersFromLocalStorage();



    const mergedUsers = [];
    const usernames = new Set();
    const emails = new Set();

    jsonUsers.forEach(user => {
        const key = user.email ? user.email.toLowerCase() : user.username;
        if (!emails.has(user.email?.toLowerCase() || '') && !usernames.has(user.username)) {
            mergedUsers.push(user);
            usernames.add(user.username);
            if (user.email) {
                emails.add(user.email.toLowerCase());
            }
        }
    });

    localUsers.forEach(user => {
        const emailKey = user.email ? user.email.toLowerCase() : '';
        if (!emails.has(emailKey) && !usernames.has(user.username)) {
            mergedUsers.push(user);
            usernames.add(user.username);
            if (user.email) {
                emails.add(emailKey);
            }
        }
    });

    if (mergedUsers.length === 0) {
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

    if (mergedUsers.length > 0) {
        localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(mergedUsers));
        localStorage.setItem('users', JSON.stringify(mergedUsers)); 
    }
    
    return mergedUsers;
}

function getAllUsersFromLocalStorage() {
    try {
        const usersJson = localStorage.getItem(USER_DATABASE_KEY);
        if (!usersJson) {

            const oldUsersJson = localStorage.getItem('users');
            if (oldUsersJson) {
                const oldUsers = JSON.parse(oldUsersJson);

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
    const users = getAllUsersSync();
    const existingIndex = users.findIndex(u => u.id === user.id || u.username === user.username);
    
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(users));

    localStorage.setItem('users', JSON.stringify(users));
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { success: false, message: '请输入有效的邮箱地址' };
    }

    if (!password || password.length < 6) {
        return { success: false, message: '密码长度至少6个字符' };
    }
    
    const users = await getAllUsers();

    if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: '该邮箱已被注册' };
    }

    const finalUsername = username.trim() || email.split('@')[0];

    if (username.trim() && users.find(u => u.username === finalUsername)) {
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

    saveUserToDatabase(newUser);
    return { success: true, user: newUser };
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

