// 注册页面功能

document.addEventListener('DOMContentLoaded', function() {
    // 如果已登录，重定向到主页
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
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const email = document.getElementById('email').value.trim();
            const verificationCode = document.getElementById('verificationCode').value.trim();
            
            // 验证
            if (username.length < 3 || username.length > 20) {
                showError('用户名长度必须在3-20个字符之间');
                return;
            }
            
            if (password.length < 6) {
                showError('密码长度至少6个字符');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('两次输入的密码不一致');
                return;
            }
            
            if (!email) {
                showError('请输入邮箱地址');
                return;
            }
            
            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('请输入有效的邮箱地址');
                return;
            }
            
            // 验证验证码
            if (!verificationCode) {
                showError('请输入验证码');
                return;
            }
            
            // 调用验证码验证函数（在 register.html 中定义）
            if (window.verifyVerificationCode) {
                const codeResult = window.verifyVerificationCode(verificationCode);
                if (!codeResult.valid) {
                    showError(codeResult.message || '验证码错误');
                    return;
                }
            } else {
                showError('验证码验证功能未初始化，请刷新页面重试');
                return;
            }
            
            // 注册
            const result = registerUser(username, password, email);
            
            if (result.success) {
                showSuccess('注册成功！正在跳转到登录页面...');
                
                // 自动登录
                setTimeout(() => {
                    const loginResult = login(username, password);
                    if (loginResult.success) {
                        window.location.href = 'index.html';
                    } else {
                        window.location.href = 'login.html';
                    }
                }, 1500);
            } else {
                showError(result.message || '注册失败');
            }
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

