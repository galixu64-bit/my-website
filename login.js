

document.addEventListener('DOMContentLoaded', function() {

    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showError('请填写用户名和密码');
                return;
            }
            
            const result = login(username, password);
            
            if (result.success) {

                window.location.href = 'index.html';
            } else {
                showError(result.message || '登录失败，请检查用户名和密码');
            }
        });
    }
    
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 5000);
        }
    }
});

