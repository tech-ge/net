import connectToDatabase from '../../utils/db';
import Bid from '../../models/Bid';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();

  try {
    // Check if user is admin (in production, verify JWT token)
    const { adminKey } = req.query;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all pending bids with user details
    const pendingBids = await Bid.find({ status: 'Pending' })
      .populate('userId', 'username email phone activeDirectReferrals hasPremiumPackage')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      pendingBids: pendingBids.map(bid => ({
        id: bid._id,
        userId: bid.userId._id,
        username: bid.username,
        email: bid.userId.email,
        phone: bid.userId.phone,
        taskType: bid.taskType,
        sampleText: bid.sampleText,
        payoutAmount: bid.payoutAmount,
        createdAt: bid.createdAt,
        status: bid.status
      }))
    });

  } catch (error) {
    console.error('Get bids error:', error);
    return res.status(500).json({ error: error.message });
  }
}
