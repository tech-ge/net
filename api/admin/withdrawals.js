import connectToDatabase from '../../utils/db';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, adminKey, action } = req.body;

  try {
    // Admin authentication
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!userId || !action) {
      return res.status(400).json({ error: "User ID and action required" });
    }

    if (!['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'Approve' or 'Reject'" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.withdrawalRequest !== 'Pending') {
      return res.status(400).json({ error: "No pending withdrawal request for this user" });
    }

    if (action === 'Approve') {
      // Deduct from balance and mark as paid
      const withdrawalAmount = user.withdrawalAmount;

      // Safety check: ensure sufficient balance
      if (user.totalBalance < withdrawalAmount) {
        return res.status(400).json({
          error: "Insufficient balance in user account",
          userBalance: user.totalBalance,
          requestedAmount: withdrawalAmount
        });
      }

      await User.findByIdAndUpdate(userId, {
        $inc: {
          totalBalance: -withdrawalAmount,
          amountWithdrawn: withdrawalAmount
        },
        withdrawalRequest: 'Paid',
        withdrawalAmount: 0,
        withdrawalRequestDate: null
      });

      return res.status(200).json({
        success: true,
        message: `Withdrawal of ${withdrawalAmount} BOB marked as paid for ${user.username}`,
        username: user.username,
        amountPaid: withdrawalAmount,
        newBalance: user.totalBalance - withdrawalAmount
      });

    } else if (action === 'Reject') {
      await User.findByIdAndUpdate(userId, {
        withdrawalRequest: 'Rejected',
        withdrawalAmount: 0,
        withdrawalRequestDate: null
      });

      return res.status(200).json({
        success: true,
        message: `Withdrawal request rejected for ${user.username}`,
        username: user.username
      });
    }

  } catch (error) {
    console.error('Withdrawal approval error:', error);
    return res.status(500).json({ error: error.message });
  }
}