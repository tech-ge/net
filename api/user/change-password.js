import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import crypto from 'crypto';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { userId, currentPassword, newPassword } = req.body;

  try {
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const hashedCurrentPassword = hashPassword(currentPassword);
    if (user.password !== hashedCurrentPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update to new password
    const hashedNewPassword = hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!"
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: error.message });
  }
}
