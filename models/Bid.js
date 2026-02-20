import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  sampleText: { type: String, required: true }, // Sanitized in API
  taskType: { type: String, enum: ['Blog', 'Survey'], required: true },
  payoutAmount: { type: Number }, // 30 for Blog, 20 for Survey
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Expired'], default: 'Pending' },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }, // Linked after approval
  expiresAt: Date, // Bid validity period (e.g., 30 days)
}, { timestamps: true });

export default mongoose.models.Bid || mongoose.model('Bid', BidSchema);