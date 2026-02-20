import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import Bid from '../../models/Bid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { bidId, action, adminKey } = req.body;

  try {
    // Admin authentication
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!bidId || !action) {
      return res.status(400).json({ error: "Bid ID and action required" });
    }

    if (!['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'Approve' or 'Reject'" });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ error: "Bid not found" });

    if (action === 'Approve') {
      // 1. Update the Bid status
      await Bid.findByIdAndUpdate(bidId, { status: 'Approved' });

      // 2. Enable user to bid on tasks and submit work
      const user = await User.findById(bid.userId);
      if (!user.canBidOnTasks) {
        await User.findByIdAndUpdate(bid.userId, { canBidOnTasks: true });
      }

      return res.status(200).json({
        success: true,
        message: `Bid approved for ${bid.username}. User can now submit work.`,
        bidId,
        username: bid.username
      });

    } else if (action === 'Reject') {
      await Bid.findByIdAndUpdate(bidId, { status: 'Rejected' });

      return res.status(200).json({
        success: true,
        message: `Bid rejected for ${bid.username}.`,
        bidId,
        username: bid.username
      });
    }

  } catch (error) {
    console.error('Approve task error:', error);
    return res.status(500).json({ error: error.message });
  }
}