import connectToDatabase from '../../utils/db';
import Bid from '../../models/Bid';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, status } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }

    // Get user's bids
    const bids = await Bid.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bids: bids.map(bid => ({
        bidId: bid._id,
        taskType: bid.taskType,
        payoutAmount: bid.payoutAmount,
        status: bid.status,
        createdAt: bid.createdAt,
        expiresAt: bid.expiresAt
      }))
    });

  } catch (error) {
    console.error('Get my bids error:', error);
    return res.status(500).json({ error: error.message });
  }
}
