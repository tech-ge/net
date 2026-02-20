import connectToDatabase from '../../utils/db';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, transactionId, paymentMethod } = req.body;

  try {
    if (!userId || !transactionId) {
      return res.status(400).json({ error: "User ID and transaction ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // In production:
    // 1. Verify transaction with payment provider API
    // 2. Confirm payment was received
    // 3. Add security checks and logging

    // For now, just mark the user as having paid
    // In production, this should only be called after successful payment verification
    await User.findByIdAndUpdate(userId, {
      hasPaidJoiningFee: true,
      active: true,
      totalBalance: 0 // No referral earnings until payment confirmed
    });

    return res.status(200).json({
      success: true,
      message: 'Payment confirmed! Your account is now active. Welcome to TechGeo!',
      action: 'redirect_dashboard'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
