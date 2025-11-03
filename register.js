

document.addEventListener('DOMContentLoaded', function() {

    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    const form = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const verificationCode = document.getElementById('verificationCode').value.trim();

            const t = (key) => {
                return (window.i18n && typeof window.i18n.t === 'function') 
                    ? window.i18n.t(key) 
                    : key;
            };

            if (!email) {
                showError(t('emailRequired'));
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError(t('emailInvalid'));
                return;
            }

            if (username && (username.length < 3 || username.length > 20)) {
                showError(t('usernameLengthError'));
                return;
            }
            
            if (password.length < 6) {
                showError(t('passwordLengthError'));
                return;
            }
            
            if (password !== confirmPassword) {
                showError(t('passwordMismatch'));
                return;
            }

            if (!verificationCode) {
                showError(t('codeRequired'));
                return;
            }

            if (window.verifyVerificationCode) {
                const codeResult = window.verifyVerificationCode(verificationCode);
                if (!codeResult.valid) {

                    showError(codeResult.message || t('codeError'));
                    return;
                }
            } else {
                showError(t('codeVerificationFailed'));
                return;
            }

            (async function() {
                try {
                    console.log('注册表单提交，邮箱:', email, '用户名:', username);
                    const result = await registerUser(email, password, username);
                    console.log('注册结果:', result);

                    const t = (key) => {
                        return (window.i18n && typeof window.i18n.t === 'function') 
                            ? window.i18n.t(key) 
                            : key;
                    };
                    
                    if (result.success) {
                        console.log('注册成功，准备登录...');
                        showSuccess(t('registerSuccess'));
                        
                        setTimeout(() => {
                            console.log('=== 注册后验证用户数据 ===');
                            const userDbRaw = localStorage.getItem('userDatabase');
                            const usersKeyRaw = localStorage.getItem('users');
                            console.log('userDatabase 原始数据:', userDbRaw ? '存在' : '不存在');
                            console.log('users 原始数据:', usersKeyRaw ? '存在' : '不存在');
                            
                            let verifyUsers = [];
                            if (userDbRaw) {
                                try {
                                    verifyUsers = JSON.parse(userDbRaw);
                                    console.log('从 userDatabase 解析:', verifyUsers.length, '个用户');
                                } catch (e) {
                                    console.error('解析 userDatabase 失败:', e);
                                }
                            }
                            
                            if (verifyUsers.length === 0 && usersKeyRaw) {
                                try {
                                    verifyUsers = JSON.parse(usersKeyRaw);
                                    console.log('从 users 解析:', verifyUsers.length, '个用户');
                                } catch (e) {
                                    console.error('解析 users 失败:', e);
                                }
                            }
                            
                            if (typeof getAllUsersSync === 'function') {
                                const syncUsers = getAllUsersSync();
                                console.log('getAllUsersSync 返回:', syncUsers.length, '个用户');
                                if (syncUsers.length > verifyUsers.length) {
                                    verifyUsers = syncUsers;
                                }
                            }
                            
                            console.log('注册后验证 - 最终用户数量:', verifyUsers.length);
                            console.log('注册后验证 - 所有用户:', verifyUsers);
                            
                            const foundUser = verifyUsers.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                            if (foundUser) {
                                console.log('✓ 找到新注册的用户:', foundUser);
                            } else {
                                console.error('✗ 未找到新注册的用户！邮箱:', email);
                                console.log('所有用户的邮箱:', verifyUsers.map(u => u.email).filter(Boolean));
                            }
                        }, 500);

                        setTimeout(() => {
                            const loginResult = login(email, password);
                            console.log('自动登录结果:', loginResult);
                            if (loginResult.success) {
                                window.location.href = 'index.html';
                            } else {
                                window.location.href = 'login.html';
                            }
                        }, 1500);
                    } else {
                        console.error('注册失败:', result.message);
                        showError(result.message || t('registerFailed'));
                    }
                } catch (error) {
                    console.error('注册错误:', error);
                    const t = (key) => {
                        return (window.i18n && typeof window.i18n.t === 'function') 
                            ? window.i18n.t(key) 
                            : key;
                    };
                    showError(t('registerFailedRetry'));
                }
            })();
        });
    }
    
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
            successMessage.classList.remove('show');
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000);
        }
    }
    
    function showSuccess(message) {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.classList.add('show');
            errorMessage.classList.remove('show');
        }
    }
});

