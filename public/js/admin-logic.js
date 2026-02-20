// Admin authentication - in production, use proper JWT
const ADMIN_KEY = prompt('Enter Admin Key:');

if (!ADMIN_KEY) {
    window.location.href = 'login.html';
}

function logout() {
    window.location.href = 'login.html';
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabElement = document.getElementById(tabName + '-section');
    if (tabElement) {
        tabElement.classList.add('active');
        event.target.classList.add('active');
    }

    // Load content
    if (tabName === 'profits') loadProfits();
    else if (tabName === 'bids') loadBids();
    else if (tabName === 'submissions') loadSubmissions();
    else if (tabName === 'withdrawals') loadWithdrawals();
}

// Load platform profits
async function loadProfits() {
    try {
        const response = await fetch(`/api/admin/get-profits?adminKey=${ADMIN_KEY}`);
        const data = await response.json();

        if (data.success) {
            const profits = data.profits;
            
            // Update profit cards
            document.getElementById('totalReferralEarnings').textContent = profits.totalReferralEarnings.toFixed(2) + ' BOB';
            document.getElementById('totalTaskEarnings').textContent = profits.totalTaskEarnings.toFixed(2) + ' BOB';
            document.getElementById('totalBalanceInSystem').textContent = profits.totalBalanceInSystem.toFixed(2) + ' BOB';
            document.getElementById('totalWithdrawn').textContent = profits.totalWithdrawn.toFixed(2) + ' BOB';

            // Update summary
            document.getElementById('summaryActiveUsers').textContent = profits.summary.activeUsers;
            document.getElementById('summaryPremiumUsers').textContent = profits.summary.premiumUsers;
            document.getElementById('summaryTotalUsers').textContent = profits.summary.totalUsers;
            document.getElementById('summaryApprovedSubmissions').textContent = profits.summary.approvedSubmissions;
            document.getElementById('summaryTotalEarned').textContent = profits.summary.totalEarned.toFixed(2) + ' BOB';
        } else {
            console.error('Error loading profits:', data.error);
            alert('❌ Error loading profits: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading profits:', error);
        alert('❌ Error loading profits');
    }
}

// Load pending bids
async function loadBids() {
    try {
        const response = await fetch(`/api/admin/get-bids?adminKey=${ADMIN_KEY}`);
        const data = await response.json();

        if (data.success) {
            const bidsList = document.getElementById('bids-list');
            
            if (data.pendingBids.length === 0) {
                bidsList.innerHTML = '<p>No pending bids</p>';
                return;
            }

            bidsList.innerHTML = data.pendingBids.map(bid => `
                <div class="bid-card">
                    <h4>📝 ${bid.taskType} Bid</h4>
                    <p><strong>User:</strong> ${bid.username} (${bid.email})</p>
                    <p><strong>Phone:</strong> ${bid.phone}</p>
                    <p><strong>Payout:</strong> ${bid.payoutAmount} BOB</p>
                    <p><strong>Sample Preview:</strong></p>
                    <p class="sample-text">${bid.sampleText.substring(0, 150)}...</p>
                    <div class="button-group">
                        <button class="btn-approve" onclick="openBidModal('${bid.id}', '${bid}')">View & Review</button>
                    </div>
                    <small>${new Date(bid.createdAt).toLocaleDateString()}</small>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading bids:', error);
        document.getElementById('bids-list').innerHTML = '<p>Error loading bids</p>';
    }
}

// Load submissions
async function loadSubmissions() {
    const status = document.getElementById('submissionStatusFilter')?.value || '';
    const url = `/api/admin/get-submissions?adminKey=${ADMIN_KEY}${status ? '&status=' + status : ''}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            const submissionsList = document.getElementById('submissions-list');

            if (data.submissions.length === 0) {
                submissionsList.innerHTML = '<p>No submissions</p>';
                return;
            }

            submissionsList.innerHTML = data.submissions.map(submission => `
                <div class="bid-card">
                    <h4>📥 ${submission.taskType} Submission</h4>
                    <p><strong>User:</strong> ${submission.username} (${submission.email})</p>
                    <p><strong>Phone:</strong> ${submission.phone}</p>
                    <p><strong>Payment:</strong> ${submission.paymentAmount} BOB</p>
                    <p><strong>Status:</strong> <span class="status status-${submission.status.toLowerCase()}">${submission.status}</span></p>
                    <p><strong>Content Preview:</strong></p>
                    <p class="sample-text">${submission.content.substring(0, 150)}...</p>
                    <div class="button-group">
                        <button class="btn-approve" onclick="openSubmissionModal('${submission.id}', '${submission}')">View & Review</button>
                    </div>
                    <small>${new Date(submission.createdAt).toLocaleDateString()}</small>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        document.getElementById('submissions-list').innerHTML = '<p>Error loading submissions</p>';
    }
}

// Load withdrawals
async function loadWithdrawals() {
    try {
        const response = await fetch(`/api/admin/get-withdrawals?adminKey=${ADMIN_KEY}`);
        const data = await response.json();

        if (data.success) {
            const withdrawalList = document.getElementById('withdrawal-list');

            if (data.withdrawalRequests.length === 0) {
                withdrawalList.innerHTML = '<tr><td colspan="7">No pending withdrawals</td></tr>';
                return;
            }

            withdrawalList.innerHTML = data.withdrawalRequests.map(request => `
                <tr>
                    <td${request.username} ${request.userId}</td>
                    <td>${request.email}</td>
                    <td>${request.phone}</td>
                    <td><strong>${request.requestedAmount} BOB</strong></td>
                    <td>${request.currentBalance} BOB</td>
                    <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-approve" onclick="approveWithdrawal('${request.userId}', ${request.requestedAmount})">✓ Approve</button>
                        <button class="btn-reject" onclick="rejectWithdrawal('${request.userId}')">✗ Reject</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading withdrawals:', error);
        document.getElementById('withdrawal-list').innerHTML = '<tr><td colspan="7">Error loading withdrawals</td></tr>';
    }
}

// Open bid modal
function openBidModal(bidId, bidData) {
    const bid = JSON.parse(bidData.replace(/'/g, '"'));
    document.getElementById('bidModalTitle').textContent = `${bid.taskType} Bid Review`;
    document.getElementById('bidModalBody').innerHTML = `
        <p><strong>Username:</strong> ${bid.username}</p>
        <p><strong>Email:</strong> ${bid.email}</p>
        <p><strong>Phone:</strong> ${bid.phone}</p>
        <p><strong>Task Type:</strong> ${bid.taskType}</p>
        <p><strong>Payout Amount:</strong> ${bid.payoutAmount} BOB</p>
        <hr>
        <h4>Sample Text:</h4>
        <p class="content-preview">${bid.sampleText}</p>
        <hr>
        <div class="button-group">
            <button class="btn-approve" onclick="approveBid('${bidId}')">✓ Approve Bid</button>
            <button class="btn-reject" onclick="rejectBid('${bidId}')">✗ Reject Bid</button>
        </div>
    `;
    document.getElementById('bidModal').style.display = 'block';
}

// Open submission modal
function openSubmissionModal(submissionId, submissionData) {
    const submission = JSON.parse(submissionData.replace(/'/g, '"'));
    document.getElementById('submissionModalTitle').textContent = `${submission.taskType} Submission Review`;
    document.getElementById('submissionModalBody').innerHTML = `
        <p><strong>Username:</strong> ${submission.username}</p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Phone:</strong> ${submission.phone}</p>
        <p><strong>Task Type:</strong> ${submission.taskType}</p>
        <p><strong>Payment Amount:</strong> ${submission.paymentAmount} BOB</p>
        <p><strong>Status:</strong> ${submission.status}</p>
        <hr>
        <h4>Submitted Content:</h4>
        <p class="content-preview">${submission.fullContent}</p>
        <hr>
        <div class="form-group">
            <label>Admin Notes (Optional)</label>
            <textarea id="adminNotes" rows="3" placeholder="Add any notes..."></textarea>
        </div>
        <div class="button-group">
            <button class="btn-approve" onclick="approveSubmission('${submissionId}')">✓ Approve & Pay</button>
            <button class="btn-reject" onclick="rejectSubmission('${submissionId}')">✗ Reject</button>
        </div>
    `;
    document.getElementById('submissionModal').style.display = 'block';
}

// Approve bid
async function approveBid(bidId) {
    if (!confirm('Approve this bid? User will be able to submit work.')) return;

    try {
        const response = await fetch('/api/admin/approve-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidId, action: 'Approve', adminKey: ADMIN_KEY })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            closeModal('bidModal');
            loadBids();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error approving bid:', error);
        alert('❌ Error approving bid');
    }
}

// Reject bid
async function rejectBid(bidId) {
    if (!confirm('Reject this bid?')) return;

    try {
        const response = await fetch('/api/admin/approve-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidId, action: 'Reject', adminKey: ADMIN_KEY })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            closeModal('bidModal');
            loadBids();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error rejecting bid:', error);
        alert('❌ Error rejecting bid');
    }
}

// Approve submission
async function approveSubmission(submissionId) {
    const adminNotes = document.getElementById('adminNotes')?.value || '';

    if (!confirm('Approve this submission and add payment to user balance?')) return;

    try {
        const response = await fetch('/api/admin/review-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId, action: 'Approve', adminNotes, adminKey: ADMIN_KEY })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            closeModal('submissionModal');
            loadSubmissions();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error approving submission:', error);
        alert('❌ Error approving submission');
    }
}

// Reject submission
async function rejectSubmission(submissionId) {
    const adminNotes = document.getElementById('adminNotes')?.value || '';

    if (!confirm('Reject this submission?')) return;

    try {
        const response = await fetch('/api/admin/review-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId, action: 'Reject', adminNotes, adminKey: ADMIN_KEY })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            closeModal('submissionModal');
            loadSubmissions();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error rejecting submission:', error);
        alert('❌ Error rejecting submission');
    }
}

// Initialize - load profits on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfits();
});
// Approve withdrawal
async function approveWithdrawal(userId, amount) {
    if (!confirm(`Approve withdrawal of ${amount} BOB for user?`)) return;

    try {
        const response = await fetch('/api/admin/withdrawals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'Approve', adminKey: ADMIN_KEY })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            loadWithdrawals();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        alert('❌ Error approving withdrawal');
    }
}

// Reject withdrawal
async function rejectWithdrawal(userId) {
    if (!confirm('Reject this withdrawal request?')) return;

    try {
        const response = await fetch('/api/admin/withdrawals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'Reject', adminKey: ADMIN_KEY })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ ' + data.message);
            loadWithdrawals();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        alert('❌ Error rejecting withdrawal');
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modals when clicking outside
window.onclick = (event) => {
    const bidModal = document.getElementById('bidModal');
    const submissionModal = document.getElementById('submissionModal');

    if (event.target === bidModal) bidModal.style.display = 'none';
    if (event.target === submissionModal) submissionModal.style.display = 'none';
};

// Load bids on init
document.addEventListener('DOMContentLoaded', loadBids);
