# TechGeo Project - Complete File Inventory

## 📋 Project Summary

**Full-Stack MLM Networking Platform** with integrated freelance task bidding system. Built on Vercel serverless (Node.js) with MongoDB Atlas backend.

**Total Files**: 34+ (API, Models, Utilities, Frontend Pages, Scripts, Styles)

---

## 🏗️ Backend Architecture

### API Endpoints (13 files)

#### Authentication (`/api/auth/`)
1. **register.js** - User registration with referral validation
   - Validates referrer exists (forced referral)
   - Distributes 4-level commissions (200→100→50→50)
   - Creates new user with Active status
   - Input validation & security checks

2. **login.js** - User authentication
   - Username/password verification
   - Returns user data and role

#### Admin Operations (`/api/admin/`)
3. **get-bids.js** - List all pending bids
   - Requires ADMIN_KEY authentication
   - Returns bids with user details

4. **approve-task.js** - Approve/reject bids
   - Updates bid status
   - Enables user to submit work
   - Requires admin authentication

5. **get-submissions.js** - List submitted work
   - Can filter by status
   - Shows content preview and full content

6. **review-submission.js** - Approve/reject submissions
   - Adds payment to user balance when approved
   - Records admin notes
   - Updates submission status

7. **get-withdrawals.js** - List pending withdrawal requests
   - Shows requested amounts and balances
   - Admin key protected

8. **withdrawals.js** - Process withdrawals
   - Approve: Deduct from balance, mark as paid
   - Reject: Reset withdrawal request
   - Validates sufficient balance

#### User Operations (`/api/user/`)
9. **bid.js** - Place bid on task
   - Validates Premium Package + 2 referrals
   - Checks bid limit (5 per 48h)
   - Sanitizes and validates sample text
   - Sets payout amount (30 for Blog, 20 for Survey)

10. **get-profile.js** - Get user dashboard data
    - Returns wallet, stats, eligibility info
    - Calculates bid counts and referral stats

11. **upgrade-premium.js** - Upgrade to Premium
    - Validates balance (150 or 750 BOB)
    - Deducts cost from balance
    - Sets premium flags

12. **submit-work.js** - Submit completed work
    - Validates bid ownership and approval
    - Sanitizes and validates content (300-50000 chars)
    - Creates submission record

13. **request-withdrawal.js** - Request withdrawal
    - Validates minimum balance (400 BOB)
    - Creates pending withdrawal request
    - Checks for existing pending requests

14. **confirm-payment.js** - Confirm joining fee payment
    - Marks user account as active after payment
    - Activates referral commissions

15. **my-bids.js** - Get user's bids with filtering
    - Returns user's bid history
    - Can filter by status

16. **my-submissions.js** - Get user's submissions
    - Returns submission history with status

---

## 📦 Data Models (4 files)

Located in `/models/`:

1. **User.js**
   ```javascript
   - username (unique)
   - email (unique)
   - fullName, phone
   - password (encrypted)
   - referrer (username of sponsor)
   - package ("Basic" or "Premium")
   - hasPremiumPackage, hasPaidJoiningFee (booleans)
   - totalBalance, referralEarnings, taskEarnings
   - amountWithdrawn, activeDirectReferrals, totalReferralCount
   - withdrawalRequest status + amount
   - canBidOnTasks (boolean)
   - role ("user" or "admin")
   - Timestamps (createdAt, updatedAt)
   ```

2. **Bid.js**
   ```javascript
   - userId (ref to User)
   - username
   - sampleText (sanitized)
   - taskType ("Blog" or "Survey")
   - payoutAmount (30 or 20)
   - status ("Pending", "Approved", "Rejected", "Expired")
   - submissionId (linked to Submission)
   - expiresAt (30-day validity)
   - Timestamps
   ```

3. **Submission.js**
   ```javascript
   - userId (ref to User)
   - bidId (ref to Bid)
   - username, taskType
   - content (sanitized, 300-50000 chars)
   - status ("Submitted", "Under Review", "Approved", "Rejected")
   - paymentAmount (30 or 20)
   - adminNotes
   - Timestamps
   ```

---

## 🛠️ Utility Files (2 files)

Located in `/utils/`:

1. **db.js** - MongoDB connection utility
   - Checks if already connected
   - Manages connection state

2. **security.js** - Security & validation functions
   - HTML sanitization (removes scripts, event handlers)
   - Input validators (username, email, phone)
   - NoSQL injection detection
   - Bid sample validation (50-2000 chars)
   - Submission content validation (300-50000 chars)

---

## 🎨 Frontend Pages (9 files)

Located in `/public/`:

### HTML Pages
1. **register.html** - User registration
   - Reads referrer from URL query (?ref=username)
   - Referrer field is read-only
   - Form validation hints

2. **login.html** - User login
   - Username/password login
   - Redirects to dashboard or admin panel based on role

3. **dashboard.html** - User dashboard
   - Wallet display (total, referral, task earnings, withdrawn)
   - Package info & upgrade button
   - Network stats (referrals)
   - Task statistics
   - Bidding eligibility display
   - Withdrawal request form
   - Account information

4. **bid.html** - Place bid page
   - Task type selection (Blog/Survey)
   - Sample text input (50-2000 chars)
   - Real-time character count
   - Recent bids display
   - Eligibility checks

5. **submit-work.html** - Submit completed work
   - Approved bids selection dropdown
   - Content editor (300-50000 chars)
   - Real-time character count
   - Recent submissions display

6. **payment.html** - Payment page (placeholder)
   - 600 BOB joining fee
   - Payment method selection
   - Transaction reference input
   - Steps after payment

7. **admin.html** - Admin dashboard
   - Tab navigation (Bids, Submissions, Withdrawals)
   - Pending bids with sample preview
   - Submitted work with content preview
   - Withdrawal requests table
   - Modal popups for detailed review

### CSS
8. **css/style.css** - Complete styling (500+ lines)
   - Color scheme (primary, success, danger, warning, info)
   - Navbar, cards, forms, buttons
   - Grid layouts for responsiveness
   - Tables, modals, badges
   - Mobile responsive design
   - Scrollbar styling
   - All component styles

---

## 💻 Frontend Scripts (8 files)

Located in `/public/js/`:

1. **validation.js** - Client-side referral link validation
   - Checks for ?ref parameter
   - Makes referrer field read-only
   - Blocks registration without referral link

2. **register.js** - Registration form handling
   - Form validation
   - API call to /api/auth/register
   - Error handling
   - Redirects to payment page

3. **login.js** - Login form handling
   - Credential validation
   - API call to /api/auth/login
   - Stores session in localStorage
   - Redirects to dashboard or admin

4. **dashboard.js** - Dashboard functionality
   - Loads user profile data
   - Displays wallet information
   - Shows referral counts
   - Manages premium upgrade
   - Handles withdrawal requests
   - Auth checks

5. **bid.js** - Bidding page logic
   - Loads user statistics
   - Validates eligibility
   - Character count tracking
   - Bid submission
   - Recent bids display

6. **submit-work.js** - Work submission logic
   - Loads approved bids
   - Content validation
   - Character count tracking
   - Work submission
   - Recent submissions display

7. **admin-logic.js** - Admin dashboard logic
   - Tab switching
   - Load and display bids
   - Load and display submissions
   - Load and display withdrawals
   - Bid approval/rejection
   - Submission review with admin notes
   - Withdrawal approval/rejection
   - Modal management

8. **payment.js** - Payment form handling
   - Payment method selection
   - Transaction reference input
   - Payment API call
   - Session storage

---

## 📋 Configuration Files (4 files)

1. **vercel.json** - Vercel deployment config
   - API route rewrites
   - Environment variable mapping

2. **.env.example** - Environment template
   - MONGODB_URI
   - ADMIN_KEY
   - Optional: JWT_SECRET, Payment keys

3. **package.json** - NPM dependencies
   - mongoose (MongoDB)
   - Node 18.x requirement

4. **README.md** - Project documentation
   - Features overview
   - Architecture diagram
   - Setup instructions
   - API examples
   - Security measures

---

## 📚 Documentation Files (2 files)

1. **README.md** - Complete project guide
2. **IMPLEMENTATION_GUIDE.md** - Detailed implementation instructions

---

## 🔐 Security Implementation

### Data Validation
- ✅ Username: 3-20 alphanumeric (-_)
- ✅ Email: RFC 5322 format
- ✅ Phone: International format
- ✅ Referrer: Server-side existence check
- ✅ Sample: 50-2000 characters
- ✅ Content: 300-50000 characters

### XSS Prevention
- HTML sanitization function removes:
  - `<script>` tags
  - Event handlers (onclick, etc)
  - `<iframe>`, `<embed>`, `<object>` tags

### NoSQL Injection Prevention
- Checks for MongoDB operators ($where, $ne, $gt, $regex, etc)
- Prevents direct `this` and `db` references

### Authentication
- Read-only referrer from URL
- Admin key validation on sensitive endpoints
- Session storage (localStorage)

---

## 💰 Financial Logic

### Joining Process (600 BOB)
```
New User Registration
    ↓
Distribute 4-Level Commission:
    Level 1 (Direct): 200 BOB
    Level 2: 100 BOB
    Level 3: 50 BOB
    Level 4: 50 BOB
    Total: 400 BOB out (+ 200 BOB to network)
```

### Premium Upgrade (150 or 750 BOB)
```
Has Paid 600 Joining Fee → Premium: 150 BOB
Never Paid → Premium: 750 BOB
Requires: 2+ Active Direct Referrals
```

### Task System
```
Blog Post: 30 BOB payout
Survey: 20 BOB payout
Max: 5 bids per 48 hours
Requires: Premium + 2 referrals
```

### Withdrawal (Minimum 400 BOB)
```
Request → Pending → Admin Reviews → Approve or Reject
Approve: Deduct from balance, add to withdrawn amount
```

---

## 🔄 Workflow Sequences

### User Registration to Earning
1. User clicks referral link: `register.html?ref=sponsor`
2. Fills form (referrer pre-filled, read-only)
3. Submits → Checks referrer exists → Creates user → Pays 4-level commissions
4. Redirected to payment.html (600 BOB)
5. Confirms payment → Account activated
6. Accesses dashboard.html

### Task Completion to Payment
1. User upgrades to Premium (150 BOB)
2. Gets 2+ active referrals
3. Places bid (sample 50-2000 chars)
4. Admin reviews → Approves or Rejects
5. If approved, user submits work (300-50000 chars)
6. Admin reviews → Approves (adds payment) or Rejects
7. Payment appears in wallet

### Withdrawal Process
1. User requests withdrawal (min 400 BOB)
2. Request appears in admin dashboard
3. Admin approves → Balance deducted, withdrawn amount increases
4. Admin can manually update status after offline payment

---

## 📊 Statistics & Limits

| Feature | Value |
|---------|-------|
| Joining Fee | 600 BOB |
| Premium Cost | 150 BOB (paid) / 750 BOB (new) |
| Blog Payout | 30 BOB |
| Survey Payout | 20 BOB |
| Max Bids/48h | 5 |
| Min Withdrawal | 400 BOB |
| Sample Length | 50-2000 characters |
| Content Length | 300-50000 characters |
| Referrals Required | 2+ for bidding |
| Bid Validity | 30 days |

---

## 🚀 Deployment

### Prerequisites
- MongoDB Atlas account
- Vercel account
- Node 18+

### Steps
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically on push

---

## ✅ Testing Checklist

- [ ] Registration with referral link
- [ ] 4-level commission distribution
- [ ] Premium upgrade functionality
- [ ] Bid placement (with limit checking)
- [ ] Admin bid approval
- [ ] Work submission
- [ ] Admin submission review
- [ ] Withdrawal requests
- [ ] Admin withdrawal processing
- [ ] Admin authentication
- [ ] All input validation
- [ ] XSS prevention
- [ ] NoSQL injection prevention
- [ ] Mobile responsiveness

---

## 📈 Next Steps (Future Enhancements)

1. **Payment Integration** - Stripe / PayPal / Local provider
2. **Email Notifications** - SendGrid or similar
3. **JWT Authentication** - Replace localStorage sessions
4. **Rate Limiting** - Prevent API abuse
5. **Database Indexing** - Performance optimization
6. **User Ratings** - Reputation system
7. **Profile Pictures** - User avatars
8. **Pagination** - Admin dashboard
9. **Analytics Dashboard** - Platform statistics
10. **Multi-language Support** - Spanish, Portuguese

---

## 📞 Support

All files include inline comments explaining functionality. See:
- Code comments in each file
- IMPLEMENTATION_GUIDE.md for detailed help
- README.md for overview

---

**Project Status**: ✅ Complete & Ready for Testing
**Version**: 1.0
**Created**: February 2026
