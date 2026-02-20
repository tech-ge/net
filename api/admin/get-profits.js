import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import Submission from '../../models/Submission';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();

  try {
    const { adminKey } = req.query;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Calculate total withdrawals (money paid out)
    const users = await User.find({});
    let totalWithdrawn = 0;
    let totalReferralEarnings = 0;
    let totalTaskEarnings = 0;
    let totalBalanceInSystem = 0;
    let activeUsers = 0;
    let premiumUsers = 0;

    users.forEach(user => {
      totalWithdrawn += user.amountWithdrawn || 0;
      totalReferralEarnings += user.referralEarnings || 0;
      totalTaskEarnings += user.taskEarnings || 0;
      totalBalanceInSystem += user.totalBalance || 0;
      if (user.active) activeUsers++;
      if (user.hasPremiumPackage) premiumUsers++;
    });

    // Calculate total from approved submissions
    const approvedSubmissions = await Submission.find({ status: 'Approved' });
    let totalPaidFromSubmissions = 0;
    approvedSubmissions.forEach(submission => {
      totalPaidFromSubmissions += submission.paymentAmount || 0;
    });

    // Calculate net profit/loss
    const totalDistributed = totalWithdrawn + totalBalanceInSystem;
    const totalEarned = totalReferralEarnings + totalTaskEarnings;

    return res.status(200).json({
      success: true,
      profits: {
        totalWithdrawn,
        totalBalanceInSystem,
        totalDistributed,
        totalReferralEarnings,
        totalTaskEarnings,
        totalPaidFromSubmissions,
        netBalance: totalEarned - totalDistributed,
        summary: {
          activeUsers,
          premiumUsers,
          totalUsers: users.length,
          approvedSubmissions: approvedSubmissions.length,
          totalEarned,
          totalOutstanding: totalBalanceInSystem
        }
      }
    });

  } catch (error) {
    console.error('Get profits error:', error);
    return res.status(500).json({ error: error.message });
  }
}
