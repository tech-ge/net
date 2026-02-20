import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // Encrypted
  
  // Referral Logic
  referrer: { type: String, required: true }, // Read-only from URL
  active: { type: Boolean, default: false },
  activeDirectReferrals: { type: Number, default: 0 }, // Count of active direct referrals
  totalReferralCount: { type: Number, default: 0 }, // Total referrals ever made

  // Package System
  package: { type: String, enum: ['Basic', 'Premium'], default: 'Basic' },
  premiumUpgradeDate: Date, // Date when upgraded to premium
  hasPaidJoiningFee: { type: Boolean, default: false }, // 600 BOB joining fee paid
  hasPremiumPackage: { type: Boolean, default: false }, // Premium 750 BOB package purchased

  // Wallet System
  totalBalance: { type: Number, default: 0 }, // Combined Referrals + Tasks earnings
  referralEarnings: { type: Number, default: 0 }, // Earnings from referrals (tracking)
  taskEarnings: { type: Number, default: 0 }, // Earnings from task completion
  amountWithdrawn: { type: Number, default: 0 }, // Manually updated by admin after payment
  
  // Withdrawal & Bid Status
  withdrawalRequest: { type: String, enum: ['None', 'Pending', 'Paid', 'Rejected'], default: 'None' },
  withdrawalAmount: { type: Number, default: 0 }, // How much user is requesting to withdraw
  withdrawalRequestDate: Date,

  // Work Status
  canBidOnTasks: { type: Boolean, default: false }, // Set after admin approves first bid with Premium + 2 referrals
  
  // Admin Status
  role: { type: String, default: 'user' }, // 'user' or 'admin'
  verified: { type: Boolean, default: false }, // Admin can verify high-value accounts
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);