// Check authentication
function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return null;
    }
    return userId;
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Load user profile
async function loadProfile() {
    const userId = checkAuth();
    if (!userId) return;

    document.getElementById('username').textContent = localStorage.getItem('username');

    try {
        const response = await fetch(`/api/user/get-profile?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
            const user = data.user;
            const stats = data.stats;
            const eligibility = data.eligibility;

            // Update wallet section
            document.getElementById('totalBalance').textContent = `${user.totalBalance} BOB`;
            document.getElementById('referralEarnings').textContent = `${user.referralEarnings} BOB`;
            document.getElementById('taskEarnings').textContent = `${user.taskEarnings} BOB`;
            document.getElementById('amountWithdrawn').textContent = `${user.amountWithdrawn} BOB`;

            // Update package section
            document.getElementById('package').textContent = user.package;
            const premiumSection = document.getElementById('premiumSection');
            if (user.hasPremiumPackage) {
                premiumSection.innerHTML = '<p>✅ You have Premium Package!</p>';
            } else {
                premiumSection.innerHTML = `
                    <p>Upgrade to <strong>Premium</strong> to unlock task bidding!</p>
                    <p class="hint">Premium: 150 BOB (you've already paid the 600 BOB joining fee)</p>
                    <button class="btn-primary" onclick="upgradePremium()">Upgrade to Premium</button>
                `;
            }

            // Update referrals section
            document.getElementById('activeDirectReferrals').textContent = user.activeDirectReferrals;
            document.getElementById('totalReferralCount').textContent = user.totalReferralCount;

            // Update stats section
            document.getElementById('totalBids').textContent = stats.totalBids;
            document.getElementById('pendingBids').textContent = stats.pendingBids;
            document.getElementById('approvedBids').textContent = stats.approvedBids;
            document.getElementById('recentBidsIn48h').textContent = stats.recentBidsIn48h;
            document.getElementById('approvedSubmissions').textContent = stats.submissions.approved;
            document.getElementById('submissionsEarned').textContent = `${stats.submissions.totalEarned} BOB`;

            // Update eligibility message
            const message = eligibility.canBid
                ? '✅ You are eligible to place bids and submit work!'
                : `❌ Not eligible yet.\n${eligibility.reason.premium}\n${eligibility.reason.referrals}`;
            
            document.getElementById('eligibilityMessage').textContent = message;
            document.getElementById('actionButtons').style.display = eligibility.canBid ? 'flex' : 'none';

            // Update withdrawal section
            const withdrawalStatus = document.getElementById('withdrawalStatus');
            if (user.withdrawalRequest === 'Pending') {
                withdrawalStatus.textContent = `⏳ You have a pending withdrawal request for ${user.withdrawalAmount} BOB`;
                document.getElementById('withdrawAmount').disabled = true;
                document.querySelector('button[onclick="requestWithdrawal()"]').disabled = true;
            } else if (eligibility.canWithdraw) {
                withdrawalStatus.textContent = `✅ You can request a withdrawal (min 400 BOB)`;
            } else {
                withdrawalStatus.textContent = `❌ Minimum balance of 400 BOB required (you have ${user.totalBalance} BOB)`;
                document.getElementById('withdrawAmount').disabled = true;
                document.querySelector('button[onclick="requestWithdrawal()"]').disabled = true;
            }

            // Update account info section
            document.getElementById('displayUsername').textContent = user.username;
            document.getElementById('displayEmail').textContent = user.email;
            document.getElementById('displayPhone').textContent = user.phone;
            document.getElementById('displayReferrer').textContent = user.referrer;
            document.getElementById('memberSince').textContent = new Date(user._id).toLocaleDateString();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile. Please refresh the page.');
    }
}

// Upgrade to Premium
async function upgradePremium() {
    const userId = localStorage.getItem('userId');
    
    if (!confirm('Upgrade to Premium for 150 BOB?')) return;

    try {
        const response = await fetch('/api/user/upgrade-premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            loadProfile(); // Reload profile
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Upgrade error:', error);
        alert('❌ Upgrade failed');
    }
}

// Request Withdrawal
async function requestWithdrawal() {
    const userId = localStorage.getItem('userId');
    const withdrawAmount = parseInt(document.getElementById('withdrawAmount').value);

    if (!withdrawAmount || withdrawAmount < 400) {
        alert('❌ Minimum withdrawal amount is 400 BOB');
        return;
    }

    if (!confirm(`Request withdrawal of ${withdrawAmount} BOB?`)) return;

    try {
        const response = await fetch('/api/user/request-withdrawal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, withdrawAmount })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            loadProfile(); // Reload profile
            document.getElementById('withdrawAmount').value = '';
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Withdrawal error:', error);
        alert('❌ Withdrawal request failed');
    }
}

// Load profile when page loads
document.addEventListener('DOMContentLoaded', loadProfile);

// Modal management
function openChangePasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Handle password change form
document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageBox = document.getElementById('passwordMessage');
    messageBox.textContent = '';

    if (newPassword !== confirmPassword) {
        messageBox.textContent = '❌ New passwords do not match';
        messageBox.classList.add('error');
        return;
    }

    if (newPassword.length < 6) {
        messageBox.textContent = '❌ New password must be at least 6 characters';
        messageBox.classList.add('error');
        return;
    }

    try {
        const response = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = '✅ ' + data.message;
            messageBox.classList.add('success');
            document.getElementById('passwordForm').reset();
            setTimeout(() => {
                closeModal('passwordModal');
                messageBox.classList.remove('success', 'error');
            }, 2000);
        } else {
            messageBox.textContent = '❌ ' + data.error;
            messageBox.classList.add('error');
        }
    } catch (error) {
        console.error('Password change error:', error);
        messageBox.textContent = '❌ Failed to change password';
        messageBox.classList.add('error');
    }
});

// Share referral link
function shareReferralLink() {
    const username = localStorage.getItem('username');
    const referralLink = `${window.location.origin}/register.html?ref=${username}`;

    // Copy to clipboard
    navigator.clipboard.writeText(referralLink).then(() => {
        alert(`✅ Referral link copied to clipboard!\n\n${referralLink}\n\nShare this with friends to earn 200 BOB per referral!`);
    }).catch(err => {
        alert(`Your referral link:\n\n${referralLink}\n\nCopy it manually and share with friends!`);
    });
}

// Close modal when clicking outside
window.onclick = (event) => {
    const passwordModal = document.getElementById('passwordModal');
    if (event.target === passwordModal) {
        passwordModal.style.display = 'none';
    }
};
