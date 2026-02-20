import connectToDatabase from '../../utils/db';
import Submission from '../../models/Submission';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Get user's submissions
    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      submissions: submissions.map(submission => ({
        submissionId: submission._id,
        taskType: submission.taskType,
        paymentAmount: submission.paymentAmount,
        status: submission.status,
        adminNotes: submission.adminNotes,
        createdAt: submission.createdAt
      }))
    });

  } catch (error) {
    console.error('Get my submissions error:', error);
    return res.status(500).json({ error: error.message });
  }
}
