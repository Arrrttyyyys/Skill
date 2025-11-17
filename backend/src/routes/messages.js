const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get conversations list
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
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
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        sessions: {
          where: {
            status: {
              in: ['PROPOSED', 'ACCEPTED'],
            },
          },
          orderBy: {
            dateTime: 'asc',
          },
          take: 1,
        },
      },
    });

    const conversations = matches.map(match => {
      const otherUser = match.userAId === userId ? match.userB : match.userA;
      const lastMessage = match.messages[0] || null;
      const upcomingSession = match.sessions[0] || null;

      return {
        matchId: match.id,
        buddy: otherUser,
        lastMessage,
        upcomingSession,
      };
    }).filter(conv => conv.lastMessage); // Only show conversations with messages

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for a match
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { matchId, content, sessionId } = req.body;
    const senderId = req.userId;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.userAId !== senderId && match.userBId !== senderId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = await prisma.message.create({
      data: {
        matchId,
        senderId,
        content,
        sessionId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;

