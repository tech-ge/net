// Load user info
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (!userId) {
        window.location.href = 'register.html';
        return;
    }

    document.getElementById('displayUsername').textContent = username;
    document.getElementById('displayUserId').textContent = userId.substring(0, 8) + '...';
});

// Payment method selection
document.getElementById('paymentMethod').addEventListener('change', (e) => {
    const method = e.target.value;
    const detailsDiv = document.getElementById('paymentDetails');

    const details = {
        till: `
            <h4>💳 TILL Payment (Lipa Na Mpesa)</h4>
            <div style="text-align: center; margin: 1rem 0; background: #fffacd; padding: 1.5rem; border-radius: 4px;">
                <p style="font-size: 1.2rem; color: #333;"><strong>Enter TILL Number:</strong></p>
                <p style="font-size: 2rem; font-weight: bold; color: var(--primary); letter-spacing: 2px;">123456</p>
            </div>
            <p><strong>Amount:</strong> 600 BOB</p>
            <p><strong>Steps:</strong></p>
            <ol>
                <li>Open M-Pesa/MPESA on your phone</li>
                <li>Select "Lipa Na M-Pesa Online"</li>
                <li>Enter TILL Number: <strong>123456</strong></li>
                <li>Enter Amount: <strong>600 BOB</strong></li>
                <li>Enter your Phone Number</li>
                <li>A prompt will appear - Enter your M-Pesa PIN</li>
                <li>Transaction confirmed - save the reference number below</li>
            </ol>
        `,
        bank: `
            <h4>🏦 Bank Transfer</h4>
            <p><strong>Bank Name:</strong> ABC Bank (Bolivia)</p>
            <p><strong>Account Number:</strong> 1234567890</p>
            <p><strong>Account Name:</strong> TechGeo Bolivia S.A.</p>
            <p><strong>Amount:</strong> 600 BOB</p>
            <p><strong>Reference:</strong> Use your username as reference</p>
        `,
        mobile: `
            <h4>📱 Mobile Money</h4>
            <p><strong>Provider:</strong> GNP+</p>
            <p><strong>Phone Number:</strong> +591-XXX-XXXXX</p>
            <p><strong>Amount:</strong> 600 BOB</p>
            <p><strong>Reference:</strong> TechGeo-USERNAME</p>
        `,
        cash: `
            <h4>💵 In-Person Payment</h4>
            <p>Visit our office or authorized partner to pay in cash.</p>
            <p><strong>Address:</strong> La Paz, Bolivia</p>
            <p><strong>Hours:</strong> Monday-Friday, 9AM-6PM</p>
            <p><strong>Remember to keep your receipt!</strong></p>
        `
    };

    detailsDiv.innerHTML = details[method] || '<p>Select a payment method</p>';
});

// Handle form submission
document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = '';

    const transactionId = document.getElementById('transactionId').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!transactionId) {
        messageBox.textContent = '❌ Please enter the transaction/reference number';
        messageBox.classList.add('error');
        return;
    }

    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    try {
        // In production, verify payment with actual payment provider
        const response = await fetch('/api/user/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                username,
                amount: 600,
                paymentMethod,
                transactionId
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = '✅ ' + data.message;
            messageBox.classList.add('success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            messageBox.textContent = '❌ ' + (data.error || 'Payment confirmation failed');
            messageBox.classList.add('error');
        }
    } catch (error) {
        console.error('Payment error:', error);
        messageBox.textContent = '❌ Payment confirmation error. Please contact support.';
        messageBox.classList.add('error');
    }
});
