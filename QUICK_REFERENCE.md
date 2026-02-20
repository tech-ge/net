# TechGeo - Quick Reference Guide

## 🎯 Key Points

### What is TechGeo?
- 4-Level MLM Networking Platform
- Freelance Task Bidding System (Blogs & Surveys)
- Built on Vercel + MongoDB
- Requires referral link to join

### Core Values to Remember
- **Forced Referral**: No registration without referral link
- **Read-Only Referrer**: Server validates referrer field
- **Unified Balance**: Referral + Task earnings in one wallet
- **Manual Withdrawals**: Admin manually processes payments
- **Two-Step Approval**: Bid sample approved first, then work content

---

## 💡 Quick Code Snippets

### Check if Premium + 2 Referrals
```javascript
if (!user.hasPremiumPackage || user.activeDirectReferrals < 2) {
    return error("Not eligible to bid");
}
```

### Sanitize User Input
```javascript
import { sanitizeHTML, validateSubmissionContent } from '../../utils/security';
const validation = validateSubmissionContent(userContent);
if (!validation.valid) return error(validation.error);
```

### Pay User on Submission Approval
```javascript
await User.findByIdAndUpdate(submission.userId, {
    $inc: {
        totalBalance: submission.paymentAmount,
        taskEarnings: submission.paymentAmount
    }
});
```

### Check Bid Limit (5 per 48h)
```javascript
const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
const recentBids = await Bid.countDocuments({
    userId, 
    createdAt: { $gte: twoDaysAgo }
});
if (recentBids >= 5) return error("Bid limit reached");
```

---

## 📱 Frontend Navigation

```
Entry Point
├── register.html?ref=sponsor (Forced referral)
│   └── payment.html (600 BOB)
│       └── dashboard.html (Main dashboard)
│           ├── bid.html (Place bid if Premium + 2 referrals)
│           │   └── submit-work.html (Submit approved work)
│           └── Manage withdrawals & upgrades
└── login.html
    └── dashboard.html or admin.html
```

---

## 🔑 Admin Key Access

**All admin endpoints require**: `?adminKey=YOUR_ADMIN_KEY` or in body

Protected endpoints:
- GET `/api/admin/get-bids`
- GET `/api/admin/get-submissions`
- GET `/api/admin/get-withdrawals`
- POST `/api/admin/approve-task`
- POST `/api/admin/review-submission`
- POST `/api/admin/withdrawals`

---

## 💰 Money Flow Examples

### Example 1: New User Joins
```
Alice (Sponsor) gets: 200 BOB (Level 1)
Bob (Sponsor's Sponsor) gets: 100 BOB (Level 2)
Carol gets: 50 BOB (Level 3)
David gets: 50 BOB (Level 4)
Total: 400 BOB distributed
```

### Example 2: Premium User Completes Blog
```
User has Premium Package ✓
User has 2+ Active Referrals ✓
Places Blog Bid → Admin Approves
Submits 500-char blog → Admin Approves
Balance increases by 30 BOB
totalBalance += 30
taskEarnings += 30
```

### Example 3: Withdrawal Process
```
User balance: 500 BOB
Requests: 400 BOB withdrawal
Admin sees: 400 BOB pending request
Admin approves:
    - totalBalance = 500 - 400 = 100 BOB
    - amountWithdrawn = 0 + 400 = 400 BOB
    - withdrawalRequest = "Paid"
```

---

## 🛡️ Security Checklist

For every user input:
1. ✅ Check for `isNoSQLInjectionAttempt()`
2. ✅ Validate length (min/max characters)
3. ✅ Sanitize with `sanitizeHTML()`
4. ✅ Store sanitized version
5. ✅ Never trust client selection (use userId)

---

## 🐛 Common Issues & Solutions

### User can't bid
- Check: Premium Package? `hasPremiumPackage === true`
- Check: Referrals? `activeDirectReferrals >= 2`
- Check: Bid limit? `Bid.count({ userId, createdAt: $gte 48h ago }) < 5`

### Payment not confirming
- Payment gateway not integrated (placeholder only)
- Must modify `/api/user/confirm-payment.js`
- Integrate with Stripe/PayPal/Local provider

### Referrer not found
- Check if referrer username exists: `User.findOne({ username: referrer })`
- Check if referrer is active: `active === true`
- Return clear error message

### Admin can't approve
- Check ADMIN_KEY is correct
- Check endpoint has `adminKey` parameter
- Verify user role in database

---

## 📊 Testing Data

### Test User Registration
```javascript
{
    "username": "test_user",
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+591234567890",
    "password": "test123456",
    "referrerName": "admin"
}
```

### Test Bid Placement
```javascript
{
    "userId": "user_mongodb_id",
    "sampleText": "This is a sample blog post demonstrating writing quality...",
    "taskType": "Blog"
}
```

### Test Submission
```javascript
{
    "userId": "user_mongodb_id",
    "bidId": "bid_mongodb_id",
    "content": "Full blog post content with at least 300 characters..."
}
```

---

## 🚀 Deployment Checklist

- [ ] `.env.local` created with MONGODB_URI and ADMIN_KEY
- [ ] MongoDB Atlas cluster set up
- [ ] Vercel project linked to GitHub
- [ ] Environment variables set in Vercel Dashboard
- [ ] All API endpoints tested locally
- [ ] All frontend pages tested
- [ ] Security validation working
- [ ] Admin panel accessibility verified
- [ ] Payment gateway placeholder noted for integration

---

## 📚 File Reference

| Task | Files |
|------|-------|
| User registers | `/api/auth/register.js` |
| User logs in | `/api/auth/login.js` |
| User upgrades premium | `/api/user/upgrade-premium.js` |
| User places bid | `/api/user/bid.js` + `/public/bid.html` |
| Admin approves bid | `/api/admin/approve-task.js` |
| User submits work | `/api/user/submit-work.js` |
| Admin reviews work | `/api/admin/review-submission.js` |
| User requests withdrawal | `/api/user/request-withdrawal.js` |
| Admin processes withdrawal | `/api/admin/withdrawals.js` |
| Get dashboard data | `/api/user/get-profile.js` |

---

## 🎓 Learning Path

1. **Start Here**: `README.md` - Understand the platform
2. **Deep Dive**: `IMPLEMENTATION_GUIDE.md` - Detailed specs
3. **Reference**: `PROJECT_INVENTORY.md` - File inventory
4. **Code**: Look at API endpoints for business logic
5. **Test**: Use examples above to verify functionality

---

## 🔗 Important URLs

```
Production: https://techgeo.vercel.app
Register: https://techgeo.vercel.app/register.html?ref=admin
Login: https://techgeo.vercel.app/login.html
Admin: https://techgeo.vercel.app/admin.html
API Base: https://techgeo.vercel.app/api/
```

---

## 💬 Common Questions

**Q: Can users register without referral link?**
A: No. `register.html` requires `?ref=username` in URL. Validated server-side.

**Q: What if referrer is inactive?**
A: Registration fails. Only active referrers can accept new members.

**Q: Can user bid with just Premium?**
A: No. Must have BOTH Premium Package AND 2+ active direct referrals.

**Q: What's the difference between referralCount and activeDirectReferrals?**
A: `activeDirectReferrals` = counts only active users. `totalReferralCount` = all time.

**Q: How long does bid last?**
A: 30 days. After that, bid expires and can't be used.

**Q: Can admin withdraw on behalf of user?**
A: No. Users must request. Admin only approves/rejects.

**Q: Are payments automated?**
A: No. All payments processed manually by admin outside system, then balance updated.

---

## 🎯 Best Practices

1. **Always validate referrer server-side** - Never trust client input
2. **Sanitize before storing** - Use security.js functions
3. **Check eligibility before allowing action** - Premium + Referrals
4. **Use transactions for money** - Keep balances in sync
5. **Log admin actions** - Track who approved what
6. **Test with real data** - Use test user like "admin"
7. **Backup database regularly** - MongoDB Atlas has snapshots
8. **Monitor API performance** - Use Vercel analytics

---

Last Updated: February 2026
Quick Reference v1.0
