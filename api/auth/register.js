import connectToDatabase from '../../utils/db';
import User from '../../models/User';
import { validateUsername, validateEmail, validatePhone, isNoSQLInjectionAttempt } from '../../utils/security';
import crypto from 'crypto';

// Simple password hash (use bcrypt in production)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  await connectToDatabase();
  const { username, fullName, email, phone, password, referrerName } = req.body;

  try {
    // 1. INPUT VALIDATION & SECURITY CHECKS
    if (!username || !validateUsername(username)) {
      return res.status(400).json({ error: "Invalid username format (3-20 alphanumeric characters)" });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (isNoSQLInjectionAttempt(username) || isNoSQLInjectionAttempt(referrerName)) {
      return res.status(400).json({ error: "Invalid input detected" });
    }

    // 2. FORCED REFERRAL CHECK (Server-Side Validation)
    if (!referrerName) {
      return res.status(400).json({ error: "A valid TechGeo referral link is required." });
    }

    const level1 = await User.findOne({ username: referrerName, active: true });
    if (!level1) {
      return res.status(400).json({ error: "Invalid referral link. Referrer not found or inactive." });
    }

    // 3. CHECK IF USERNAME/EMAIL ALREADY EXISTS
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already registered." });
    }

    // 4. CREATE THE NEW USER
    const newUser = await User.create({
      username,
      fullName,
      email,
      phone,
      password: hashPassword(password),
      referrer: referrerName,
      active: true,
      hasPaidJoiningFee: true, // Assuming 600 BOB payment is confirmed externally
      totalBalance: 0
    });

    // 5. THE 4-LEVEL PAYOUT LOGIC (When a new user joins)
    // Level 1 (Direct Inviter): 200 BOB
    await User.findByIdAndUpdate(level1._id, { 
      $inc: { 
        totalBalance: 200,
        referralEarnings: 200,
        totalReferralCount: 1,
        activeDirectReferrals: 1
      }
    });

    // Level 2 (Grandparent): 100 BOB
    if (level1.referrer) {
      const level2 = await User.findOne({ username: level1.referrer, active: true });
      if (level2) {
        await User.findByIdAndUpdate(level2._id, { 
          $inc: { 
            totalBalance: 100,
            referralEarnings: 100
          }
        });

        // Level 3 (Great-Grandparent): 50 BOB
        if (level2.referrer) {
          const level3 = await User.findOne({ username: level2.referrer, active: true });
          if (level3) {
            await User.findByIdAndUpdate(level3._id, { 
              $inc: { 
                totalBalance: 50,
                referralEarnings: 50
              }
            });

            // Level 4 (Great-Great-Grandparent): 50 BOB
            if (level3.referrer) {
              const level4 = await User.findOne({ username: level3.referrer, active: true });
              if (level4) {
                await User.findByIdAndUpdate(level4._id, { 
                  $inc: { 
                    totalBalance: 50,
                    referralEarnings: 50
                  }
                });
              }
            }
          }
        }
      }
    }

    return res.status(201).json({ 
      success: true, 
      message: "Welcome to TechGeo! Account created successfully.",
      userId: newUser._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message });
  }
}