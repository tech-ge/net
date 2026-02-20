import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import Bid from '../../models/Bid';
import { validateBidSample } from '../../utils/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, sampleText, taskType } = req.body;

  try {
    if (!userId || !sampleText || !taskType) {
      return res.status(400).json({ error: "User ID, sample text, and task type required" });
    }

    if (!['Blog', 'Survey'].includes(taskType)) {
      return res.status(400).json({ error: "Task type must be 'Blog' or 'Survey'" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // RULE 1: Must have Premium Package
    if (!user.hasPremiumPackage) {
      return res.status(403).json({
        error: "You must have a Premium Package to bid on tasks",
        requiredPackage: 'Premium'
      });
    }

    // RULE 2: Must have at least 2 active direct referrals
    if (user.activeDirectReferrals < 2) {
      return res.status(403).json({
        error: `You need at least 2 active direct referrals to bid (currently: ${user.activeDirectReferrals})`,
        requiredReferrals: 2,
        currentReferrals: user.activeDirectReferrals
      });
    }

    // RULE 3: Validate bid sample text (security + format)
    const validation = validateBidSample(sampleText);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // RULE 4: Max 5 bids per user every 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentBids = await Bid.countDocuments({
      userId,
      createdAt: { $gte: twoDaysAgo }
    });

    if (recentBids >= 5) {
      return res.status(429).json({
        error: "Bid limit reached: Maximum 5 bids per 48 hours",
        currentBidsIn48h: recentBids,
        maxBids: 5
      });
    }

    // Determine payout amount based on task type
    const payoutAmount = taskType === 'Blog' ? 30 : 20;

    // Create the Bid for Admin Review
    const newBid = await Bid.create({
      userId,
      username: user.username,
      sampleText: validation.sanitized,
      taskType,
      payoutAmount,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30-day validity
    });

    return res.status(200).json({
      success: true,
      message: "Bid submitted for admin review!",
      bidId: newBid._id,
      taskType,
      payoutAmount,
      status: "Pending"
    });

  } catch (error) {
    console.error('Bid submission error:', error);
    return res.status(500).json({ error: error.message });
  }
}