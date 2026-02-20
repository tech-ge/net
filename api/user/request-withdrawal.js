import connectToDatabase from '../../utils/db';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, withdrawAmount } = req.body;

  try {
    if (!userId || !withdrawAmount) {
      return res.status(400).json({ error: "User ID and withdrawal amount required" });
    }

    if (withdrawAmount <= 0) {
      return res.status(400).json({ error: "Withdrawal amount must be greater than 0" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check minimum balance requirement: 400 BOB
    const minimumBalance = 400;
    if (user.totalBalance < minimumBalance) {
      return res.status(400).json({
        error: `Minimum balance requirement not met. You need at least ${minimumBalance} BOB to request a withdrawal`,
        currentBalance: user.totalBalance,
        requiredBalance: minimumBalance
      });
    }

    // Check if trying to withdraw more than available
    if (withdrawAmount > user.totalBalance) {
      return res.status(400).json({
        error: "Cannot withdraw more than your available balance",
        currentBalance: user.totalBalance
      });
    }

    // Check if user already has pending withdrawal request
    if (user.withdrawalRequest === 'Pending') {
      return res.status(400).json({
        error: "You already have a pending withdrawal request. Please wait for admin review."
      });
    }

    // Create withdrawal request
    await User.findByIdAndUpdate(userId, {
      withdrawalRequest: 'Pending',
      withdrawalAmount: withdrawAmount,
      withdrawalRequestDate: new Date()
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal request for ${withdrawAmount} BOB submitted. Awaiting admin review.`,
      withdrawalAmount: withdrawAmount
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    return res.status(500).json({ error: error.message });
  }
}
