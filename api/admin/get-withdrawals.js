import connectToDatabase from '../../utils/db';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();

  try {
    // Check if user is admin
    const { adminKey } = req.query;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all users with pending withdrawal requests
    const withdrawalRequests = await User.find({ withdrawalRequest: 'Pending' })
      .select('username email phone withdrawalAmount totalBalance withdrawalRequestDate')
      .sort({ withdrawalRequestDate: -1 });

    return res.status(200).json({
      success: true,
      withdrawalRequests: withdrawalRequests.map(user => ({
        userId: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        requestedAmount: user.withdrawalAmount,
        currentBalance: user.totalBalance,
        requestDate: user.withdrawalRequestDate
      }))
    });

  } catch (error) {
    console.error('Get withdrawal requests error:', error);
    return res.status(500).json({ error: error.message });
  }
}
