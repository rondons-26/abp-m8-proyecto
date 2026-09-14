document.addEventListener('DOMContentLoaded', () => {
    // LÓGICA DE MOSTRAR / OCULTAR CONTRASEÑA
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (togglePasswordBtn && passwordInput && toggleIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('bi-eye-slash');
                toggleIcon.classList.add('bi-eye');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('bi-eye');
                toggleIcon.classList.add('bi-eye-slash');
            }
        });
    }

    // LÓGICA DE INICIO DE SESIÓN
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const alertContainer = document.getElementById('loginAlertContainer');
            let hideTimeout = null;

            const showLoginMessage = (message, type = 'danger') => {
                if (!alertContainer) return;
                if (hideTimeout) clearTimeout(hideTimeout);

                alertContainer.className = `mb-3 alert alert-${type} rounded-3 py-2 px-3 small d-flex align-items-center shadow-sm`;
                alertContainer.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill me-2 fs-6"></i>
                    <div>${message}</div>
                `;
                alertContainer.classList.remove('d-none');

                hideTimeout = setTimeout(() => {
                    alertContainer.classList.add('d-none');
                }, 4000);
            };

            if (!email || !password) {
                showLoginMessage("Por favor, completa todos los campos.");
                return;
            }

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.data));

                    const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
                    
                    if (redirectAfterLogin) {
                        localStorage.removeItem('redirectAfterLogin'); 
                        window.location.href = redirectAfterLogin;    
                    } else {
                        window.location.href = result.data.redirectUrl;
                    }
                } else {
                    showLoginMessage(result.message || "Credenciales inválidas. Inténtalo de nuevo.");
                }

            } catch (error) {
                console.error("Error en el proceso de autenticación:", error);
                showLoginMessage("Ocurrió un error al intentar conectar con el servidor.");
            }
        });
    }
});