document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');
    const refField = document.getElementById('referrerName');
    const messageBox = document.getElementById('messageBox');

    if (referrer) {
        refField.value = referrer;
        refField.style.backgroundColor = "#e9ecef";
        refField.readOnly = true;
    } else {
        messageBox.textContent = '❌ A referral link is required to join TechGeo.';
        messageBox.classList.add('error');
        document.getElementById('registerForm').style.display = 'none';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = '';

    const username = document.getElementById('username').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const referrerName = document.getElementById('referrerName').value.trim();

    // Client-side validation
    if (!username || !fullName || !email || !phone || !password) {
        messageBox.textContent = '❌ All fields are required';
        messageBox.classList.add('error');
        return;
    }

    if (username.length < 3 || username.length > 20) {
        messageBox.textContent = '❌ Username must be 3-20 characters';
        messageBox.classList.add('error');
        return;
    }

    if (password.length < 6) {
        messageBox.textContent = '❌ Password must be at least 6 characters';
        messageBox.classList.add('error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                fullName,
                email,
                phone,
                password,
                referrerName
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = '✅ ' + data.message;
            messageBox.classList.remove('error');
            messageBox.classList.add('success');

            // Store user ID and redirect to payment
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', username);

            setTimeout(() => {
                window.location.href = 'payment.html';
            }, 2000);
        } else {
            messageBox.textContent = '❌ ' + (data.error || 'Registration failed');
            messageBox.classList.add('error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        messageBox.textContent = '❌ Registration error. Please try again.';
        messageBox.classList.add('error');
    }
});
