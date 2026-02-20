document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        messageBox.textContent = '❌ Username and password required';
        messageBox.classList.add('error');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = '✅ Login successful! Redirecting...';
            messageBox.classList.add('success');

            // Store user session
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('userRole', data.user.role);

            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1500);
        } else {
            messageBox.textContent = '❌ ' + (data.error || 'Login failed');
            messageBox.classList.add('error');
        }
    } catch (error) {
        console.error('Login error:', error);
        messageBox.textContent = '❌ Login error. Please try again.';
        messageBox.classList.add('error');
    }
});
