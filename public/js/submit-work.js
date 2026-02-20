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

// Character count
document.getElementById('workContent')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('characterCount').textContent = `${count} / 300-50000 characters`;

    if (count < 300) {
        document.getElementById('characterCount').style.color = 'red';
    } else if (count > 50000) {
        document.getElementById('characterCount').style.color = 'red';
    } else {
        document.getElementById('characterCount').style.color = 'green';
    }
});

// Load approved bids
async function loadApprovedBids() {
    const userId = checkAuth();
    if (!userId) return;

    document.getElementById('username').textContent = localStorage.getItem('username');

    try {
        const response = await fetch(`/api/user/my-bids?userId=${userId}&status=Approved`);
        if (response.ok) {
            const data = await response.json();
            const bidSelect = document.getElementById('bidId');

            if (data.bids && data.bids.length > 0) {
                bidSelect.innerHTML = '<option value="">-- Select a bid --</option>' +
                    data.bids.map(bid => `
                        <option value="${bid.bidId}" data-type="${bid.taskType}" data-amount="${bid.payoutAmount}">
                            ${bid.taskType} (${bid.payoutAmount} BOB)
                        </option>
                    `).join('');
            } else {
                bidSelect.innerHTML = '<option value="">No approved bids. Place and get a bid approved first.</option>';
                document.getElementById('submissionForm').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading bids:', error);
    }
}

// Load submissions
async function loadSubmissions() {
    const userId = checkAuth();
    if (!userId) return;

    try {
        const response = await fetch(`/api/user/my-submissions?userId=${userId}`);
        if (response.ok) {
            const data = await response.json();
            const submissionsList = document.getElementById('submissionsList');

            if (data.submissions && data.submissions.length > 0) {
                submissionsList.innerHTML = data.submissions.map(submission => `
                    <div class="submission-item">
                        <p><strong>${submission.taskType}</strong> - <strong>${submission.paymentAmount} BOB</strong></p>
                        <p>Status: <span class="status status-${submission.status.toLowerCase()}">${submission.status}</span></p>
                        ${submission.adminNotes ? `<p>Admin Notes: ${submission.adminNotes}</p>` : ''}
                        <small>${new Date(submission.createdAt).toLocaleDateString()}</small>
                    </div>
                `).join('');
            } else {
                submissionsList.innerHTML = '<p>No submissions yet.</p>';
            }
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        document.getElementById('submissionsList').innerHTML = '<p>Error loading submissions</p>';
    }
}

// Submit work
document.getElementById('submissionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = checkAuth();
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = '';

    const bidId = document.getElementById('bidId').value;
    const content = document.getElementById('workContent').value.trim();

    if (!bidId) {
        messageBox.textContent = '❌ Please select an approved bid';
        messageBox.classList.add('error');
        return;
    }

    if (content.length < 300 || content.length > 50000) {
        messageBox.textContent = '❌ Content must be between 300-50000 characters';
        messageBox.classList.add('error');
        return;
    }

    try {
        const response = await fetch('/api/user/submit-work', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, bidId, content })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.textContent = `✅ ${data.message}`;
            messageBox.classList.add('success');
            document.getElementById('submissionForm').reset();
            setTimeout(() => {
                loadApprovedBids();
                loadSubmissions();
            }, 1000);
        } else {
            messageBox.textContent = '❌ ' + data.error;
            messageBox.classList.add('error');
        }
    } catch (error) {
        console.error('Submission error:', error);
        messageBox.textContent = '❌ Failed to submit work';
        messageBox.classList.add('error');
    }
});

// Load on page init
document.addEventListener('DOMContentLoaded', () => {
    loadApprovedBids();
    loadSubmissions();
});
