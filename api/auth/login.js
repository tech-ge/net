import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import crypto from 'crypto';

// Simple password hash (use bcrypt in production)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Return user data (in production, use JWT tokens)
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        package: user.package,
        hasPremiumPackage: user.hasPremiumPackage,
        totalBalance: user.totalBalance,
        amountWithdrawn: user.amountWithdrawn,
        activeDirectReferrals: user.activeDirectReferrals,
        canBidOnTasks: user.canBidOnTasks,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
}
