

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
                    const result = await registerUser(email, password, username);

                    const t = (key) => {
                        return (window.i18n && typeof window.i18n.t === 'function') 
                            ? window.i18n.t(key) 
                            : key;
                    };
                    
                    if (result.success) {
                        showSuccess(t('registerSuccess'));

                        setTimeout(() => {
                            const loginResult = login(email, password);
                            if (loginResult.success) {
                                window.location.href = 'index.html';
                            } else {
                                window.location.href = 'login.html';
                            }
                        }, 1500);
                    } else {
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

