import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import Bid from '../../models/Bid';
import Submission from '../../models/Submission';
import { validateSubmissionContent } from '../../utils/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, bidId, content } = req.body;

  try {
    if (!userId || !bidId || !content) {
      return res.status(400).json({ error: "User ID, bid ID, and content required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Check if bid belongs to user
    if (bid.userId.toString() !== userId) {
      return res.status(403).json({ error: "This bid does not belong to you" });
    }

    // Check if bid is approved
    if (bid.status !== 'Approved') {
      return res.status(400).json({
        error: "You can only submit content for approved bids",
        bidStatus: bid.status
      });
    }

    // Check if submission already exists for this bid
    const existingSubmission = await Submission.findOne({ bidId });
    if (existingSubmission) {
      return res.status(400).json({ error: "Submission already exists for this bid" });
    }

    // Validate submission content (security + format)
    const validation = validateSubmissionContent(content);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Create the submission
    const submission = await Submission.create({
      userId,
      bidId,
      username: user.username,
      taskType: bid.taskType,
      content: validation.sanitized,
      paymentAmount: bid.payoutAmount,
      status: 'Submitted'
    });

    return res.status(201).json({
      success: true,
      message: "Work submitted successfully! Awaiting admin review.",
      submissionId: submission._id,
      taskType: bid.taskType
    });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: error.message });
  }
}
