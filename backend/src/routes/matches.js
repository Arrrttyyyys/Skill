const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get swipe deck (potential matches)
router.get('/deck', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { onlineOnly, timeZone, category } = req.query;

    // Get current user's skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const teachesSkills = user.skills.filter(s => s.type === 'TEACH').map(s => s.skillId);
    const learnsSkills = user.skills.filter(s => s.type === 'LEARN').map(s => s.skillId);

    // Get existing matches
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
      select: {
        userAId: true,
        userBId: true,
      },
    });

    const excludedUserIds = new Set([userId]);
    existingMatches.forEach(m => {
      excludedUserIds.add(m.userAId);
      excludedUserIds.add(m.userBId);
    });

    // Find compatible users
    const compatibleUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: Array.from(excludedUserIds),
        },
        ...(onlineOnly === 'true' && {
          preferredMode: {
            in: ['ONLINE', 'EITHER'],
          },
        }),
        skills: {
          some: {
            OR: [
              // They want to learn what I can teach
              {
                type: 'LEARN',
                skillId: {
                  in: teachesSkills,
                },
              },
              // They can teach what I want to learn
              {
                type: 'TEACH',
                skillId: {
                  in: learnsSkills,
                },
              },
            ],
            ...(category && {
              skill: {
                category: category,
              },
            }),
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Calculate compatibility for each user
    const deck = compatibleUsers.map(otherUser => {
      const otherTeaches = otherUser.skills.filter(s => s.type === 'TEACH').map(s => ({
        skill: s.skill,
        level: s.level,
      }));
      const otherLearns = otherUser.skills.filter(s => s.type === 'LEARN').map(s => ({
        skill: s.skill,
        level: s.level,
      }));

      // Skills I can teach them
      const iCanTeachThem = user.skills
        .filter(s => s.type === 'TEACH')
        .filter(s => otherLearns.some(ol => ol.skill.id === s.skillId))
        .map(s => ({
          skill: s.skill,
          level: s.level,
        }));

      // Skills they can teach me
      const theyCanTeachMe = otherTeaches.filter(ot =>
        user.skills.some(s => s.type === 'LEARN' && s.skillId === ot.skill.id)
      ).map(ot => ({
        skill: ot.skill,
        level: ot.level,
      }));

      return {
        ...otherUser,
        compatibility: {
          iCanTeachThem,
          theyCanTeachMe,
          matchCount: iCanTeachThem.length + theyCanTeachMe.length,
        },
      };
    });

    res.json(deck);
  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({ error: 'Failed to get swipe deck' });
  }
});

// Create a match (when user swipes right)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.userId;

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot match with yourself' });
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: otherUserId },
          { userAId: otherUserId, userBId: userId },
        ],
      },
    });

    if (existingMatch) {
      return res.json(existingMatch);
    }

    // Get users and their skills for compatibility summary
    const [user, otherUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: {
            include: { skill: true },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: otherUserId },
        include: {
          skills: {
            include: { skill: true },
          },
        },
      }),
    ]);

    const iCanTeachThem = user.skills
      .filter(s => s.type === 'TEACH')
      .filter(s => otherUser.skills.some(os => os.type === 'LEARN' && os.skillId === s.skillId))
      .map(s => s.skill.name);

    const theyCanTeachMe = otherUser.skills
      .filter(s => s.type === 'TEACH')
      .filter(s => user.skills.some(us => us.type === 'LEARN' && us.skillId === s.skillId))
      .map(s => s.skill.name);

    const summary = {
      iCanTeachThem,
      theyCanTeachMe,
    };

    // Create match
    const match = await prisma.match.create({
      data: {
        userAId: userId,
        userBId: otherUserId,
        overlappingTeachLearnSummary: JSON.stringify(summary),
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            location: true,
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            location: true,
          },
        },
      },
    });

    res.json(match);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Get user's matches (buddies)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
        status: 'ACTIVE',
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            location: true,
            bio: true,
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            location: true,
            bio: true,
          },
        },
        sessions: {
          orderBy: {
            dateTime: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        matchedAt: 'desc',
      },
    });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => {
      const otherUser = match.userAId === userId ? match.userB : match.userA;
      const summary = match.overlappingTeachLearnSummary
        ? JSON.parse(match.overlappingTeachLearnSummary)
        : { iCanTeachThem: [], theyCanTeachMe: [] };

      return {
        id: match.id,
        matchedAt: match.matchedAt,
        buddy: otherUser,
        compatibility: summary,
        latestSession: match.sessions[0] || null,
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Get match detail
router.get('/:matchId', authMiddleware, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        userA: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        userB: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        sessions: {
          include: {
            focusSkill: true,
          },
          orderBy: {
            dateTime: 'desc',
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const otherUser = match.userAId === userId ? match.userB : match.userA;
    const summary = match.overlappingTeachLearnSummary
      ? JSON.parse(match.overlappingTeachLearnSummary)
      : { iCanTeachThem: [], theyCanTeachMe: [] };

    res.json({
      id: match.id,
      matchedAt: match.matchedAt,
      buddy: otherUser,
      compatibility: summary,
      sessions: match.sessions,
    });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
});

module.exports = router;

