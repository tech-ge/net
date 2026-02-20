import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import Submission from '../../models/Submission';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { submissionId, action, adminNotes, adminKey } = req.body;

  try {
    // Admin authentication
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!submissionId || !action) {
      return res.status(400).json({ error: "Submission ID and action required" });
    }

    if (!['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'Approve' or 'Reject'" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (action === 'Approve') {
      // 1. Update submission status
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'Approved',
        adminNotes: adminNotes || 'Approved'
      });

      // 2. Add payment to user's balance
      await User.findByIdAndUpdate(submission.userId, {
        $inc: {
          totalBalance: submission.paymentAmount,
          taskEarnings: submission.paymentAmount
        }
      });

      return res.status(200).json({
        success: true,
        message: `Submission approved for ${submission.username}. Payment of ${submission.paymentAmount} BOB added to their balance.`,
        submissionId,
        username: submission.username,
        paymentAmount: submission.paymentAmount
      });

    } else if (action === 'Reject') {
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'Rejected',
        adminNotes: adminNotes || 'Rejected'
      });

      return res.status(200).json({
        success: true,
        message: `Submission rejected for ${submission.username}.`,
        submissionId,
        username: submission.username,
        adminNotes: adminNotes
      });
    }

  } catch (error) {
    console.error('Review submission error:', error);
    return res.status(500).json({ error: error.message });
  }
}
