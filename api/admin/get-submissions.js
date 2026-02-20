import connectToDatabase from '../../utils/db';
import Submission from '../../models/Submission';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();

  try {
    // Check if user is admin
    const { adminKey, status } = req.query;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Filter by status if provided
    const query = status ? { status } : {};

    // Get all submissions with user details
    const submissions = await Submission.find(query)
      .populate('userId', 'username email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      submissions: submissions.map(submission => ({
        id: submission._id,
        userId: submission.userId._id,
        username: submission.username,
        email: submission.userId.email,
        phone: submission.userId.phone,
        taskType: submission.taskType,
        content: submission.content.substring(0, 200) + '...', // Preview
        fullContent: submission.content, // Full content for review
        paymentAmount: submission.paymentAmount,
        status: submission.status,
        createdAt: submission.createdAt,
        adminNotes: submission.adminNotes
      }))
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ error: error.message });
  }
}
