const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// Update user profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, bio, avatarUrl, preferredMode, availability, location, timeZone } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(preferredMode && { preferredMode }),
        ...(availability !== undefined && { availability }),
        ...(location !== undefined && { location }),
        ...(timeZone !== undefined && { timeZone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        location: true,
        timeZone: true,
        bio: true,
        avatarUrl: true,
        preferredMode: true,
        availability: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Upload avatar
router.post('/:id/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create URL for the uploaded file
    // Assuming server runs on localhost:3001 or similar
    // In production, this should be a full URL or relative path handled by frontend
    const avatarUrl = `/uploads/profiles/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Update user skills
router.post('/:id/skills', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { skills } = req.body; // Array of { skillId, type, level } or { skillName, type, level }

    // Delete existing skills
    await prisma.userSkill.deleteMany({
      where: { userId: id },
    });

    // Create new skills
    const skillPromises = skills.map(async ({ skillName, skillId, type, level }) => {
      let finalSkillId = skillId;

      if (skillName && !skillId) {
        // Find or create skill by name
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });
        finalSkillId = skill.id;
      }

      return prisma.userSkill.create({
        data: {
          userId: id,
          skillId: finalSkillId,
          type,
          level,
        },
        include: {
          skill: true,
        },
      });
    });

    const createdSkills = await Promise.all(skillPromises);

    res.json(createdSkills);
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ error: 'Failed to update skills' });
  }
});

// Get user profile with stats
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get user with skills only (optimize - don't need all matches for profile)
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get feedback stats - simplified queries
    // Get all feedback received by this user
    const allFeedback = await prisma.feedback.findMany({
      where: {
        toUserId: id,
      },
      include: {
        session: {
          select: {
            focusRole: true,
            match: {
              select: {
                userAId: true,
                userBId: true,
              },
            },
          },
        },
      },
    });

    // Filter feedback by role
    const feedbackAsTeacher = allFeedback.filter(f => {
      if (!f.session || !f.session.focusRole) return false;
      const isUserA = f.session.match.userAId === id;
      const isTeaching = f.session.focusRole === 'USER_A_TEACHES' || f.session.focusRole === 'USER_B_TEACHES';
      return (isUserA && f.session.focusRole === 'USER_A_TEACHES') ||
        (!isUserA && f.session.focusRole === 'USER_B_TEACHES');
    });

    const feedbackAsLearner = allFeedback.filter(f => {
      if (!f.session || !f.session.focusRole) return false;
      const isUserA = f.session.match.userAId === id;
      return (isUserA && f.session.focusRole === 'USER_B_TEACHES') ||
        (!isUserA && f.session.focusRole === 'USER_A_TEACHES');
    });

    const completedSessions = await prisma.session.count({
      where: {
        OR: [
          { match: { userAId: id } },
          { match: { userBId: id } },
        ],
        status: 'COMPLETED',
      },
    });

    const avgRatingAsTeacher = feedbackAsTeacher.length > 0
      ? feedbackAsTeacher.reduce((sum, f) => sum + f.rating, 0) / feedbackAsTeacher.length
      : 0;

    const avgRatingAsLearner = feedbackAsLearner.length > 0
      ? feedbackAsLearner.reduce((sum, f) => sum + f.rating, 0) / feedbackAsLearner.length
      : 0;

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      ...userWithoutPassword,
      stats: {
        completedSessions,
        avgRatingAsTeacher: Math.round(avgRatingAsTeacher * 10) / 10,
        avgRatingAsLearner: Math.round(avgRatingAsLearner * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;

