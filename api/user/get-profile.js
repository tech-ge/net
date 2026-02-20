import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import Bid from '../../models/Bid';
import Submission from '../../models/Submission';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's recent bids
    const userBids = await Bid.countDocuments({ userId });
    const pendingBids = await Bid.countDocuments({ userId, status: 'Pending' });
    const approvedBids = await Bid.countDocuments({ userId, status: 'Approved' });

    // Get submissions stats
    const submissions = await Submission.find({ userId }).select('status paymentAmount createdAt');
    const approvedSubmissions = submissions.filter(s => s.status === 'Approved').length;
    const submittedSubmissions = submissions.filter(s => s.status === 'Submitted').length;

    // Calculate recent bid count (last 48 hours)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentBidsCount = await Bid.countDocuments({
      userId,
      createdAt: { $gte: twoDaysAgo }
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        referrer: user.referrer,
        package: user.package,
        hasPremiumPackage: user.hasPremiumPackage,
        hasPaidJoiningFee: user.hasPaidJoiningFee,
        totalBalance: user.totalBalance,
        referralEarnings: user.referralEarnings,
        taskEarnings: user.taskEarnings,
        amountWithdrawn: user.amountWithdrawn,
        activeDirectReferrals: user.activeDirectReferrals,
        totalReferralCount: user.totalReferralCount,
        canBidOnTasks: user.canBidOnTasks,
        withdrawalRequest: user.withdrawalRequest,
        withdrawalAmount: user.withdrawalAmount,
      },
      stats: {
        totalBids: userBids,
        pendingBids,
        approvedBids,
        recentBidsIn48h: recentBidsCount,
        maxBidsper48h: 5,
        submissions: {
          total: submissions.length,
          approved: approvedSubmissions,
          submitted: submittedSubmissions,
          totalEarned: submissions
            .filter(s => s.status === 'Approved')
            .reduce((sum, s) => sum + s.paymentAmount, 0)
        }
      },
      eligibility: {
        canBid: user.hasPremiumPackage && user.activeDirectReferrals >= 2,
        canWithdraw: user.totalBalance >= 400,
        reason: {
          premium: user.hasPremiumPackage ? 'Has Premium' : 'Needs Premium Package',
          referrals: `Has ${user.activeDirectReferrals} active referrals (needs 2)`,
          balance: `Balance: ${user.totalBalance} BOB (minimum 400 needed for withdrawal)`
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: error.message });
  }
}
