const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { matchId, focusSkillId, focusRole, dateTime, mode, locationOrLink, goals } = req.body;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.userAId !== req.userId && match.userBId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const session = await prisma.session.create({
      data: {
        matchId,
        focusSkillId,
        focusRole,
        dateTime: dateTime ? new Date(dateTime) : null,
        mode,
        locationOrLink,
        goals,
        createdById: req.userId,
      },
      include: {
        match: {
          include: {
            userA: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            userB: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        focusSkill: true,
      },
    });

    res.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get user's sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.userId;

    const sessions = await prisma.session.findMany({
      where: {
        match: {
          OR: [
            { userAId: userId },
            { userBId: userId },
          ],
        },
        ...(status && { status }),
      },
      include: {
        match: {
          include: {
            userA: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            userB: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        focusSkill: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dateTime: status === 'COMPLETED' ? 'desc' : 'asc',
      },
    });

    // Format to show the other user
    const formattedSessions = sessions.map(session => {
      const otherUser = session.match.userAId === userId
        ? session.match.userB
        : session.match.userA;

      return {
        ...session,
        buddy: otherUser,
      };
    });

    res.json(formattedSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// Update session status
router.patch('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, dateTime, mode, locationOrLink, goals } = req.body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        match: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (session.match.userAId !== req.userId && session.match.userBId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        ...(status && { status }),
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(mode && { mode }),
        ...(locationOrLink !== undefined && { locationOrLink }),
        ...(goals !== undefined && { goals }),
      },
      include: {
        match: {
          include: {
            userA: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            userB: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        focusSkill: true,
      },
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

module.exports = router;

