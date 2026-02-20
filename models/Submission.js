import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
  username: String,
  taskType: { type: String, enum: ['Blog', 'Survey'], required: true },
  content: { type: String, required: true }, // The actual blog/survey content
  status: { type: String, enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'], default: 'Submitted' },
  adminNotes: String,
  paymentAmount: { type: Number }, // 30 for Blog, 20 for Survey
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
