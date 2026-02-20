# TechGeo Networking & Freelance Platform - Implementation Guide

## 📋 Overview

TechGeo is a 4-level MLM networking platform with integrated freelance task bidding system. Users earn through referrals and by completing tasks (blogs/surveys).

## 🚀 Quick Start

### Environment Variables

Create a `.env.local` file in your project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techgeo
ADMIN_KEY=your-secret-admin-key-here
```

### Installation

1. Deploy to Vercel
2. Set environment variables in Vercel dashboard
3. Database will be created automatically in MongoDB Atlas

## 💰 Monetization Rules

### Joining Process
- **Cost**: 600 BOB (Bolivianos)
- **Requirement**: Must join via referral link (?ref=username)
- **Referrer Field**: Read-only, validated server-side

### 4-Level Commission Structure
When a new user joins:
- **Level 1 (Direct)**: 200 BOB
- **Level 2 (Grandparent)**: 100 BOB
- **Level 3 (Great-Grandparent)**: 50 BOB
- **Level 4 (Great-Great-Grandparent)**: 50 BOB

**Total Payout**: 400 BOB per join (network encourages growth)

### Premium Package
- **Cost**: 750 BOB total (150 BOB additional if already paid 600 BOB joining fee)
- **Requirement**: Must have at least 2 active direct referrals to bid

### Withdrawal System
- **Minimum Balance**: 400 BOB required
- **Method**: Admin must manually update balance and amountWithdrawn after processing payment
- **Combined Balance**: Referral + Task earnings merge into one balance

## 📊 Task System

### Available Tasks
| Task Type | Payout | Requirements |
|-----------|--------|--------------|
| Blog Post | 30 BOB | Premium Package + 2 referrals |
| Survey | 20 BOB | Premium Package + 2 referrals |

### Bidding Rules
1. **Sample Submission**: Users submit 50-2000 character work sample
2. **Admin Review**: Admins manually approve/reject bids
3. **Bid Limit**: Max 5 bids per 48 hours
4. **Approval Requirement**: Admin must approve bid before user can submit actual work
5. **Work Submission**: User submits 300-50000 characters of actual content
6. **Final Review**: Admin reviews and approves for payment

### Flow
```
User → Place Bid (Sample) → Admin Approves → User Submits Work → Admin Reviews → Payment Added to Balance
```

## 🔐 Security Features

### Implemented
- ✅ HTML sanitization on all user-submitted content
- ✅ NoSQL injection prevention
- ✅ Input validation (username, email, phone, content length)
- ✅ Server-side referral validation
- ✅ Read-only referrer field
- ✅ Admin authentication with ADMIN_KEY

### Content Validation
- **Sample Text**: 50-2000 characters
- **Work Content**: 300-50000 characters
- **Username**: 3-20 alphanumeric characters (-_)
- **Email**: Valid email format
- **Phone**: Valid phone format

## 📁 File Structure

```
/api
  /admin
    approve-task.js          # Approve/reject bids
    get-bids.js              # List pending bids
    get-submissions.js       # List submitted work
    get-withdrawals.js       # List withdrawal requests
    review-submission.js     # Review and approve submissions
    withdrawals.js           # Process withdrawal payments
  /auth
    login.js                 # User login
    register.js              # User registration (with referral)
  /user
    bid.js                   # Submit bid for task
    get-profile.js           # Get user dashboard data
    my-bids.js              # Get user's bids
    my-submissions.js       # Get user's submissions
    request-withdrawal.js   # Request withdrawal
    submit-work.js          # Submit completed work
    upgrade-premium.js      # Upgrade to premium package
/models
  Bid.js                    # Bid schema
  Submission.js             # Submission schema
  User.js                   # User schema
/public
  /assets                   # Images, logos
  /css
    style.css               # All styling
  /js
    admin-logic.js          # Admin dashboard logic
    bid.js                  # Bidding page logic
    dashboard.js            # User dashboard logic
    login.js                # Login logic
    register.js             # Registration logic
    submit-work.js          # Work submission logic
    validation.js           # Frontend validation
  admin.html                # Admin dashboard
  bid.html                  # Bid placement page
  dashboard.html            # User dashboard
  login.html                # Login page
  register.html             # Registration page
  submit-work.html          # Work submission page
/utils
  db.js                     # MongoDB connection
  security.js               # Sanitization & validation functions
vercel.json                 # Vercel deployment config
```

## 🔄 User Journeys

### User Registration
1. Click referral link: `register.html?ref=username`
2. Fill registration form (referrer is read-only from URL)
3. Submit to `/api/auth/register`
4. Referral commissions paid across 4 levels
5. Redirect to payment page (external payment gateway)
6. After payment, user accesses dashboard

### User Bidding
1. User must have Premium Package + 2 active referrals
2. Navigate to Bid page
3. Select task type (Blog/Survey)
4. Submit sample (50-2000 chars)
5. Admin reviews sample
6. If approved, user can submit actual work (300-50000 chars)
7. Admin reviews submitted work
8. If approved, payment added to balance

### Admin Workflow
1. Log in to admin panel (requires ADMIN_KEY)
2. Review pending bids
   - View sample text
   - Approve (user can now submit work) or Reject
3. Review submitted work
   - View full content
   - Approve (add payment to balance) or Reject
4. Process withdrawals
   - Review pending requests
   - Approve (deduct from balance, mark as paid) or Reject

## 📱 API Usage Examples

### Register User
```bash
POST /api/auth/register
{
  "username": "john_doe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+591234567890",
  "password": "securepassword",
  "referrerName": "sponsor_username"
}
```

### Place Bid
```bash
POST /api/user/bid
{
  "userId": "user_id_here",
  "sampleText": "This is my sample work demonstrating my writing quality...",
  "taskType": "Blog"
}
```

### Submit Work
```bash
POST /api/user/submit-work
{
  "userId": "user_id_here",
  "bidId": "bid_id_here",
  "content": "Full blog post content here..."
}
```

### Approve Bid (Admin)
```bash
POST /api/admin/approve-task
{
  "bidId": "bid_id_here",
  "action": "Approve",
  "adminKey": "your-admin-key"
}
```

## ⚙️ Configuration

### Admin Key
Set in `.env.local`:
```
ADMIN_KEY=your-secret-key-min-32-chars
```

### Database Indexes (Optional but Recommended)
Create indexes in MongoDB for performance:
```javascript
// Users
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })

// Bids
db.bids.createIndex({ userId: 1 })
db.bids.createIndex({ userId: 1, createdAt: -1 })

// Submissions
db.submissions.createIndex({ userId: 1 })
db.submissions.createIndex({ bidId: 1 }, { unique: true })
```

## 🛠️ Development Notes

### Password Security
Currently using SHA-256 hashing. **For production, use bcrypt:**
```javascript
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 10);
```

### JWT Authentication
Consider implementing JWT tokens for session management:
```javascript
import jwt from 'jsonwebtoken';
const token = jwt.sign({ userId, role }, process.env.JWT_SECRET);
```

### Payment Integration
Placeholder for payment gateway integration. Implement integration with:
- Stripe
- PayPal
- Local payment provider (Bolivia-specific)

### Email Notifications
Add email notifications for:
- Bid approvals
- Submission reviews
- Withdrawal confirmations
- Referral bonuses

## 🧪 Testing

### Test Referral Chain
1. Create base user (no referrer): `base_user?ref=admin`
2. Create chain: user1 → user2 → user3 → user4 → user5
3. Verify commissions flow correctly across 4 levels

### Test Bid System
1. Create premium user with 2+ referrals
2. Place bid → admin approves → verify canBidOnTasks flag
3. Submit work → admin approves → verify balance updated

### Test Withdrawal
1. User with 400+ BOB requests withdrawal
2. Admin approves → verify balance deducted, amountWithdrawn increased
3. Verify withdrawal status changes to "Paid"

## 📈 Performance Optimization

1. **Add indexes** to MongoDB as shown above
2. **Use pagination** for admin dashboard (implement later)
3. **Cache user profiles** in localStorage on client
4. **Implement rate limiting** on API endpoints
5. **Compress images** in /assets folder

## 🔄 Future Enhancements

- [ ] Email notifications
- [ ] User profile pictures
- [ ] Referral tracking dashboard
- [ ] Automated commission distribution
- [ ] Custom withdrawal limits per user
- [ ] Bid expiration and cleanup
- [ ] User reputation/rating system
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Multi-language support

## 📞 Support

For implementation questions or issues, refer to the API endpoints documentation in each js file.

---

**Last Updated**: February 2026
**Version**: 1.0 - Stable Release
