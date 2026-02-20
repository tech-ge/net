# TechGeo - Networking & Freelance Platform

A sophisticated 4-level MLM networking platform with integrated freelance task bidding system, built on Vercel serverless architecture with MongoDB Atlas.

## 🌟 Features

### Membership & Referral System
- **4-Level MLM Commission**: 200 → 100 → 50 → 50 BOB
- **Forced Referral**: Registration only via referral link
- **Referrer Read-Only**: Server-side validated for security
- **Commission Tracking**: Unified wallet combining referrals + tasks

### Premium Package
- Unlocks task bidding capability
- Requires 2+ active direct referrals
- Cost: 150 BOB (if joined) or 750 BOB (new members)

### Task Bidding System
- **Blog Posts**: 30 BOB payout
- **Surveys**: 20 BOB payout
- **Rate Limiting**: Max 5 bids per 48 hours
- **Two-Step Approval**: Admin reviews sample, then completed work
- **String Validation**: 50-2000 char samples, 300-50000 char submissions

### Admin Management
- Pending bid review & approval
- Submitted work review & approval with notes
- Withdrawal request processing
- Manual balance management for offline payments

### Security
- ✅ HTML sanitization on all content
- ✅ NoSQL injection prevention
- ✅ Server-side input validation
- ✅ Admin key authentication
- ✅ Read-only referrer validation

## 🏗️ Architecture

```
Frontend: HTML/CSS/JavaScript (Vanilla, no dependencies)
    ↓
API: Vercel Serverless Functions (Node.js)
    ↓
Database: MongoDB Atlas (Cloud)
```

## 📊 User Types

### Regular Users
- Register with referral link
- Pay 600 BOB joining fee
- Earn referral commissions
- Upgrade to Premium (150 BOB)
- Bid on tasks with Premium + 2 referrals
- Submit completed work
- Request withdrawals (min 400 BOB)

### Admin Users
- Review and approve/reject bids
- Review submitted work
- Manage withdrawals
- Update balances manually
- Access detailed user data

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Vercel account

### Installation

1. **Clone & Setup**
```bash
git clone <repo>
cd techgeo
npm install
cp .env.example .env.local
```

2. **Configure Environment**
Edit `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_KEY=your_secure_admin_key
```

3. **Deploy to Vercel**
```bash
vercel deploy
```

4. **Set Environment Variables in Vercel Dashboard**
- Add MONGODB_URI
- Add ADMIN_KEY

## 📱 User Flows

### Registration Flow
```
User clicks referral link
    ↓
Register form (referrer pre-filled, read-only)
    ↓
POST /api/auth/register
    ↓
Commissions paid to 4 levels
    ↓
Payment page (600 BOB)
    ↓
Payment confirmation
    ↓
Dashboard access
```

### Task Completion Flow
```
User upgrades to Premium (150 BOB)
    ↓
Gets required 2+ referrals
    ↓
Places bid (sample 50-2000 chars)
    ↓
Admin approves bid
    ↓
User submits work (300-50000 chars)
    ↓
Admin reviews and approves
    ↓
Payment added to balance (30 or 20 BOB)
```

## 🔐 Security Measures

### Input Validation
- Username: 3-20 alphanumeric characters
- Email: RFC 5322 format
- Phone: International format
- Sample: 50-2000 characters
- Content: 300-50,000 characters

### XSS Prevention
```javascript
// HTML sanitization removes:
// - <script> tags
// - Event handlers (onclick, onload, etc)
// - <iframe>, <embed>, <object> tags
// - Other malicious content
```

### NoSQL Injection Prevention
```javascript
// Checks for MongoDB operators:
// $where, $ne, $gt, $regex, $or, $and, etc
// Prevents injection attacks on database queries
```

## 📊 Database Schema

### User
```javascript
{
  username, email, phone, password,
  referrer, // Username of sponsor
  package, // "Basic" or "Premium"
  hasPremiumPackage, // Boolean
  totalBalance, referralEarnings, taskEarnings,
  amountWithdrawn, activeDirectReferrals,
  withdrawalRequest, // "None", "Pending", "Paid", "Rejected"
  canBidOnTasks // Boolean
}
```

### Bid
```javascript
{
  userId, username, sampleText, taskType,
  payoutAmount, // 30 or 20
  status, // "Pending", "Approved", "Rejected"
  expiresAt
}
```

### Submission
```javascript
{
  userId, bidId, username, taskType,
  content, paymentAmount,
  status, // "Submitted", "Under Review", "Approved", "Rejected"
  adminNotes
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (with referral)
- `POST /api/auth/login` - Login user

### User Endpoints
- `GET /api/user/get-profile` - Get dashboard data
- `POST /api/user/upgrade-premium` - Upgrade to Premium
- `POST /api/user/bid` - Place bid on task
- `GET /api/user/my-bids` - Get user's bids
- `POST /api/user/submit-work` - Submit completed work
- `GET /api/user/my-submissions` - Get user's submissions
- `POST /api/user/request-withdrawal` - Request withdrawal
- `POST /api/user/confirm-payment` - Confirm payment

### Admin Endpoints
- `GET /api/admin/get-bids?adminKey=X` - List pending bids
- `POST /api/admin/approve-task` - Approve/reject bid
- `GET /api/admin/get-submissions?adminKey=X` - List submissions
- `POST /api/admin/review-submission` - Approve/reject submission
- `GET /api/admin/get-withdrawals?adminKey=X` - List withdrawal requests
- `POST /api/admin/withdrawals` - Process withdrawal

## 🌐 URL Structure

### User Pages
- `/register.html?ref=username` - Registration with referrer
- `/login.html` - Login page
- `/dashboard.html` - User dashboard
- `/bid.html` - Place bid page
- `/submit-work.html` - Submit work page
- `/payment.html` - Payment page

### Admin Pages
- `/admin.html?ref=username` - Admin dashboard (requires ADMIN_KEY)

## 💡 Usage Examples

### Register User
```bash
curl -X POST https://techgeo.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+591234567890",
    "password": "secure123",
    "referrerName": "admin"
  }'
```

### Place Bid
```bash
curl -X POST https://techgeo.vercel.app/api/user/bid \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "sampleText": "This is my writing sample...",
    "taskType": "Blog"
  }'
```

## 🧪 Testing Checklist

- [ ] User registration with referral link
- [ ] 4-level commission distribution
- [ ] Premium package purchase
- [ ] Bid placement and approval process
- [ ] Work submission and payment
- [ ] Withdrawal requests and processing
- [ ] Admin panel functionality
- [ ] Security validations
- [ ] Error handling
- [ ] Mobile responsiveness

## 🚨 Important Notes

### Payments (Placeholder)
The payment system is a placeholder. Integrate with:
- Stripe
- PayPal
- Local Bolivia provider

### Admin Authentication
Change the admin key from `.env.local`. In production, consider:
- JWT tokens
- OAuth2
- Role-based access control

### Password Security
Current implementation uses SHA-256. For production:
```bash
npm install bcryptjs
```

Use bcrypt for password hashing.

## 📈 Deployment Checklist

- [ ] Set environment variables in Vercel
- [ ] Configure MongoDB Atlas
- [ ] Create admin key (32+ characters)
- [ ] Test all user flows
- [ ] Configure email notifications
- [ ] Set up error tracking (Sentry)
- [ ] Enable HTTPS (Vercel default)
- [ ] Set up backups
- [ ] Configure rate limiting
- [ ] Add monitoring

## 🐛 Known Limitations

1. **Payments**: Currently placeholder - needs integration
2. **Email**: No email notifications yet
3. **Sessions**: Client-side localStorage only - consider JWT
4. **Pagination**: Admin dashboard doesn't paginate large lists
5. **Images**: No user profile pictures
6. **Ratings**: No user reputation system

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Node.js API Best Practices](https://nodejs.org/en/docs/)

## 📝 License

Proprietary - TechGeo Platform

## 👥 Support

For issues or questions about implementation, refer to:
1. `IMPLEMENTATION_GUIDE.md` - Detailed implementation docs
2. Code comments in API files
3. Frontend page comments and hints

---

**Version**: 1.0
**Last Updated**: February 2026
**Maintenance**: Active Development
# TechGeo - Networking & Freelance Platform
