// Check authentication
function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return null;
    }
    return userId;
}

function goBack() {
    window.location.href = 'dashboard.html';
}

// Load user stats
async function loadUserStats() {
    const userId = checkAuth();
    if (!userId) return;

    document.getElementById('username').textContent = localStorage.getItem('username');

    try {
        const response = await fetch(`/api/user/get-profile?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            document.getElementById('recentBids').textContent = stats.recentBidsIn48h;
            document.getElementById('premiumStatus').textContent = data.user.hasPremiumPackage ? '✅ Yes' : '❌ No';
            document.getElementById('referralStatus').textContent = `${data.user.activeDirectReferrals}/2`;

            // Disable form if not eligible
            if (!data.eligibility.canBid) {
                document.getElementById('bidForm').style.display = 'none';
                const messageBox = document.getElementById('messageBox');
                messageBox.textContent = `❌ You are not eligible to bid yet.\n${data.eligibility.reason.premium}\n${data.eligibility.reason.referrals}`;
                messageBox.classList.add('error');
                return;
            }

            // Check if at bid limit
            if (stats.recentBidsIn48h >= 5) {
                document.getElementById('bidForm').style.display = 'none';
                const messageBox = document.getElementById('messageBox');
                messageBox.textContent = '❌ You have reached your bid limit (5 per 48 hours). Please try again later.';
                messageBox.classList.add('error');
                return;
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Character count for sample text
document.getElementById('sampleText')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('characterCount').textContent = `${count} / 50-2000 characters`;

    if (count < 50) {
        document.getElementById('characterCount').style.color = 'red';
    } else if (count > 2000) {
        document.getElementById('characterCount').style.color = 'red';
    } else {
        document.getElementById('characterCount').style.color = 'green';
    }
});

// Submit bid
document.getElementById('bidForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = checkAuth();
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = '';

    const taskType = document.getElementById('taskType').value;
    const sampleText = document.getElementById('sampleText').value.trim();

    if (!taskType) {
        messageBox.textContent = '❌ Please select a task type';
        messageBox.classList.add('error');
        return;
    }

    if (sampleText.length < 50 || sampleText.length > 2000) {
        messageBox.textContent = '❌ Sample must be between 50-2000 characters';
        messageBox.classList.add('error');
        return;
    }

    try {
        const response = await fetch('/api/user/bid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, sampleText, taskType })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = `✅ ${data.message}`;
            messageBox.classList.add('success');
            document.getElementById('bidForm').reset();
            loadUserStats();
            setTimeout(loadRecentBids, 1000);
        } else {
            messageBox.textContent = '❌ ' + data.error;
            messageBox.classList.add('error');
        }
    } catch (error) {
        console.error('Bid error:', error);
        messageBox.textContent = '❌ Failed to submit bid';
        messageBox.classList.add('error');
    }
});

// Load recent bids
async function loadRecentBids() {
    const userId = checkAuth();
    if (!userId) return;

    try {
        const response = await fetch(`/api/user/get-bids?userId=${userId}`);
        if (response.ok) {
            const data = await response.json();
            const bidsList = document.getElementById('bidsList');

            if (data.bids && data.bids.length > 0) {
                bidsList.innerHTML = data.bids.map(bid => `
                    <div class="bid-item">
                        <p><strong>${bid.taskType}</strong> - <strong>${bid.payoutAmount} BOB</strong></p>
                        <p>Status: <span class="status status-${bid.status.toLowerCase()}">${bid.status}</span></p>
                        <small>${new Date(bid.createdAt).toLocaleDateString()}</small>
                    </div>
                `).join('');
            } else {
                bidsList.innerHTML = '<p>No bids yet. Submit your first bid above!</p>';
            }
        }
    } catch (error) {
        console.error('Error loading bids:', error);
        document.getElementById('bidsList').innerHTML = '<p>Error loading bids</p>';
    }
}

// Will create this endpoint
async function getUserBids() {
    const userId = checkAuth();
    try {
        const response = await fetch(`/api/user/my-bids?userId=${userId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching bids:', error);
    }
    return { bids: [] };
}

// Load on page init
document.addEventListener('DOMContentLoaded', () => {
    loadUserStats();
    loadRecentBids();
});
