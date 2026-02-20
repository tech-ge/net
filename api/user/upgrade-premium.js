import connectToDatabase from '../../utils/db';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has premium package
    if (user.hasPremiumPackage) {
      return res.status(400).json({ error: "User already has Premium Package" });
    }

    // Premium Cost: 750 BOB total (150 additional if they already paid 600 joining fee)
    const premiumCost = user.hasPaidJoiningFee ? 150 : 750;

    // Check if user has sufficient balance
    if (user.totalBalance < premiumCost) {
      return res.status(400).json({ 
        error: `Insufficient balance. You need ${premiumCost} BOB to upgrade to Premium Package`,
        requiredAmount: premiumCost,
        currentBalance: user.totalBalance
      });
    }

    // Deduct premium cost from balance and mark as premium
    await User.findByIdAndUpdate(userId, {
      $inc: { totalBalance: -premiumCost },
      package: 'Premium',
      hasPremiumPackage: true,
      premiumUpgradeDate: new Date()
    });

    return res.status(200).json({
      success: true,
      message: `Premium Package purchased for ${premiumCost} BOB!`,
      newBalance: user.totalBalance - premiumCost
    });

  } catch (error) {
    console.error('Premium upgrade error:', error);
    return res.status(500).json({ error: error.message });
  }
}
