const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create feedback
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sessionId, toUserId, rating, comment, confidenceImproved, wouldRecommend } = req.body;
    const fromUserId = req.userId;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        match: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.match.userAId !== fromUserId && session.match.userBId !== fromUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Session must be completed to give feedback' });
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        sessionId_fromUserId_toUserId: {
          sessionId,
          fromUserId,
          toUserId,
        },
      },
    });

    if (existingFeedback) {
      // Update existing feedback
      const feedback = await prisma.feedback.update({
        where: {
          sessionId_fromUserId_toUserId: {
            sessionId,
            fromUserId,
            toUserId,
          },
        },
        data: {
          rating,
          comment,
          confidenceImproved,
          wouldRecommend,
        },
      });

      return res.json(feedback);
    }

    const feedback = await prisma.feedback.create({
      data: {
        sessionId,
        fromUserId,
        toUserId,
        rating,
        comment,
        confidenceImproved,
        wouldRecommend,
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

// Get feedback for a session
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        match: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.match.userAId !== userId && session.match.userBId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const feedback = await prisma.feedback.findMany({
      where: { sessionId },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

module.exports = router;

