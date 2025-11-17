const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.feedback.deleteMany();
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();
  await prisma.match.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  // Create skills
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'UI/UX Design', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'Watercolor Painting', category: 'Arts' } }),
    prisma.skill.create({ data: { name: 'JavaScript', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'React', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'Guitar', category: 'Arts' } }),
    prisma.skill.create({ data: { name: 'Cooking', category: 'Lifestyle' } }),
    prisma.skill.create({ data: { name: 'Yoga', category: 'Fitness' } }),
    prisma.skill.create({ data: { name: 'Mindfulness Coaching', category: 'Wellness' } }),
    prisma.skill.create({ data: { name: 'Video Editing', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'Graphic Design', category: 'Arts' } }),
    prisma.skill.create({ data: { name: 'Music Production', category: 'Arts' } }),
    prisma.skill.create({ data: { name: 'Python', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'Data Analysis', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'Public Speaking', category: 'Professional' } }),
    prisma.skill.create({ data: { name: 'Photography', category: 'Arts' } }),
    prisma.skill.create({ data: { name: 'Spanish', category: 'Language' } }),
    prisma.skill.create({ data: { name: 'French', category: 'Language' } }),
    prisma.skill.create({ data: { name: 'Piano', category: 'Arts' } }),
    prisma.skill.create({ data: { name: 'Web Development', category: 'Tech' } }),
    prisma.skill.create({ data: { name: 'Writing', category: 'Professional' } }),
  ]);

  const skillMap = {};
  skills.forEach(s => {
    skillMap[s.name] = s.id;
  });

  const passwordHash = await bcrypt.hash('demo', 10);

  // Create users
  const emma = await prisma.user.create({
    data: {
      name: 'Emma',
      email: 'emma@skillera.com',
      passwordHash,
      age: 28,
      location: 'Dublin, Ireland',
      timeZone: 'Europe/Dublin',
      bio: 'Passionate designer who loves teaching design principles. Always excited to learn new coding skills!',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      preferredMode: 'EITHER',
      availability: JSON.stringify({
        weekdays: ['evenings'],
        weekends: ['mornings', 'afternoons'],
      }),
    },
  });

  const liam = await prisma.user.create({
    data: {
      name: 'Liam',
      email: 'liam@skillera.com',
      passwordHash,
      age: 32,
      location: 'London, UK',
      timeZone: 'Europe/London',
      bio: 'Full-stack developer exploring creative hobbies. Happy to teach React and JavaScript!',
      avatarUrl: 'https://i.pravatar.cc/150?img=33',
      preferredMode: 'ONLINE',
      availability: JSON.stringify({
        weekdays: ['evenings'],
        weekends: ['afternoons'],
      }),
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah',
      email: 'sarah@skillera.com',
      passwordHash,
      age: 35,
      location: 'New York, USA',
      timeZone: 'America/New_York',
      bio: 'Yoga instructor and mindfulness coach. Looking to expand my creative skills!',
      avatarUrl: 'https://i.pravatar.cc/150?img=45',
      preferredMode: 'EITHER',
      availability: JSON.stringify({
        weekdays: ['mornings', 'evenings'],
        weekends: ['mornings'],
      }),
    },
  });

  const jake = await prisma.user.create({
    data: {
      name: 'Jake',
      email: 'jake@skillera.com',
      passwordHash,
      age: 26,
      location: 'Toronto, Canada',
      timeZone: 'America/Toronto',
      bio: 'Musician and producer. Eager to dive into data science and Python programming.',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      preferredMode: 'EITHER',
      availability: JSON.stringify({
        weekdays: ['evenings'],
        weekends: ['mornings', 'afternoons', 'evenings'],
      }),
    },
  });

  // Create user skills
  // Emma: Offers UI/UX (Advanced), Watercolor (Intermediate) | Wants: JavaScript, Public Speaking
  await prisma.userSkill.createMany({
    data: [
      { userId: emma.id, skillId: skillMap['UI/UX Design'], type: 'TEACH', level: 'Advanced' },
      { userId: emma.id, skillId: skillMap['Watercolor Painting'], type: 'TEACH', level: 'Intermediate' },
      { userId: emma.id, skillId: skillMap['JavaScript'], type: 'LEARN', level: 'Beginner' },
      { userId: emma.id, skillId: skillMap['Public Speaking'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Liam: Offers JavaScript (Advanced), React (Advanced) | Wants: Guitar, Cooking
  await prisma.userSkill.createMany({
    data: [
      { userId: liam.id, skillId: skillMap['JavaScript'], type: 'TEACH', level: 'Advanced' },
      { userId: liam.id, skillId: skillMap['React'], type: 'TEACH', level: 'Advanced' },
      { userId: liam.id, skillId: skillMap['Guitar'], type: 'LEARN', level: 'Beginner' },
      { userId: liam.id, skillId: skillMap['Cooking'], type: 'LEARN', level: 'Intermediate' },
    ],
  });

  // Sarah: Offers Yoga (Expert), Mindfulness (Advanced) | Wants: Video Editing, Graphic Design
  await prisma.userSkill.createMany({
    data: [
      { userId: sarah.id, skillId: skillMap['Yoga'], type: 'TEACH', level: 'Expert' },
      { userId: sarah.id, skillId: skillMap['Mindfulness Coaching'], type: 'TEACH', level: 'Advanced' },
      { userId: sarah.id, skillId: skillMap['Video Editing'], type: 'LEARN', level: 'Beginner' },
      { userId: sarah.id, skillId: skillMap['Graphic Design'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Jake: Offers Guitar (Advanced), Music Production (Intermediate) | Wants: Python, Data Analysis
  await prisma.userSkill.createMany({
    data: [
      { userId: jake.id, skillId: skillMap['Guitar'], type: 'TEACH', level: 'Advanced' },
      { userId: jake.id, skillId: skillMap['Music Production'], type: 'TEACH', level: 'Intermediate' },
      { userId: jake.id, skillId: skillMap['Python'], type: 'LEARN', level: 'Beginner' },
      { userId: jake.id, skillId: skillMap['Data Analysis'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Create additional users for swipe deck
  const additionalUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Maya',
        email: 'maya@skillera.com',
        passwordHash,
        age: 25,
        location: 'San Francisco, USA',
        timeZone: 'America/Los_Angeles',
        bio: 'Photographer and creative professional. Love learning new tech skills!',
        avatarUrl: 'https://i.pravatar.cc/150?img=68',
        preferredMode: 'EITHER',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Alex',
        email: 'alex@skillera.com',
        passwordHash,
        age: 29,
        location: 'Berlin, Germany',
        timeZone: 'Europe/Berlin',
        bio: 'Data scientist passionate about teaching. Learning Spanish in my free time.',
        avatarUrl: 'https://i.pravatar.cc/150?img=50',
        preferredMode: 'ONLINE',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sophie',
        email: 'sophie@skillera.com',
        passwordHash,
        age: 27,
        location: 'Paris, France',
        timeZone: 'Europe/Paris',
        bio: 'Piano teacher and music enthusiast. Excited to learn coding!',
        avatarUrl: 'https://i.pravatar.cc/150?img=51',
        preferredMode: 'EITHER',
        availability: JSON.stringify({
          weekdays: ['mornings', 'evenings'],
          weekends: ['afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ryan',
        email: 'ryan@skillera.com',
        passwordHash,
        age: 31,
        location: 'Austin, USA',
        timeZone: 'America/Chicago',
        bio: 'Web developer and cooking enthusiast. Want to improve my design skills!',
        avatarUrl: 'https://i.pravatar.cc/150?img=52',
        preferredMode: 'ONLINE',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Olivia',
        email: 'olivia@skillera.com',
        passwordHash,
        age: 24,
        location: 'Melbourne, Australia',
        timeZone: 'Australia/Melbourne',
        bio: 'Graphic designer learning yoga and mindfulness. Love connecting with creative people!',
        avatarUrl: 'https://i.pravatar.cc/150?img=53',
        preferredMode: 'IN_PERSON',
        availability: JSON.stringify({
          weekdays: ['mornings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Marcus',
        email: 'marcus@skillera.com',
        passwordHash,
        age: 33,
        location: 'Chicago, USA',
        timeZone: 'America/Chicago',
        bio: 'Public speaking coach and writer. Learning video editing for my content.',
        avatarUrl: 'https://i.pravatar.cc/150?img=54',
        preferredMode: 'ONLINE',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Isabella',
        email: 'isabella@skillera.com',
        passwordHash,
        age: 26,
        location: 'Barcelona, Spain',
        timeZone: 'Europe/Madrid',
        bio: 'Video editor and creative director. Want to learn Python for automation!',
        avatarUrl: 'https://i.pravatar.cc/150?img=55',
        preferredMode: 'EITHER',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'David',
        email: 'david@skillera.com',
        passwordHash,
        age: 30,
        location: 'Seattle, USA',
        timeZone: 'America/Los_Angeles',
        bio: 'Python developer teaching coding. Learning guitar to relax after work!',
        avatarUrl: 'https://i.pravatar.cc/150?img=56',
        preferredMode: 'ONLINE',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Priya',
        email: 'priya@skillera.com',
        passwordHash,
        age: 28,
        location: 'Mumbai, India',
        timeZone: 'Asia/Kolkata',
        bio: 'UI/UX designer and watercolor artist. Excited to learn React!',
        avatarUrl: 'https://i.pravatar.cc/150?img=57',
        preferredMode: 'EITHER',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'James',
        email: 'james@skillera.com',
        passwordHash,
        age: 35,
        location: 'Boston, USA',
        timeZone: 'America/New_York',
        bio: 'Cooking instructor and food blogger. Learning data analysis for my recipes!',
        avatarUrl: 'https://i.pravatar.cc/150?img=58',
        preferredMode: 'IN_PERSON',
        availability: JSON.stringify({
          weekdays: ['mornings', 'evenings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Luna',
        email: 'luna@skillera.com',
        passwordHash,
        age: 23,
        location: 'Portland, USA',
        timeZone: 'America/Los_Angeles',
        bio: 'Yoga instructor and meditation teacher. Want to learn photography!',
        avatarUrl: 'https://i.pravatar.cc/150?img=59',
        preferredMode: 'EITHER',
        availability: JSON.stringify({
          weekdays: ['mornings'],
          weekends: ['mornings', 'afternoons'],
        }),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Noah',
        email: 'noah@skillera.com',
        passwordHash,
        age: 27,
        location: 'Denver, USA',
        timeZone: 'America/Denver',
        bio: 'React developer and JavaScript expert. Learning French for travel!',
        avatarUrl: 'https://i.pravatar.cc/150?img=60',
        preferredMode: 'ONLINE',
        availability: JSON.stringify({
          weekdays: ['evenings'],
          weekends: ['afternoons'],
        }),
      },
    }),
  ]);

  // Create skills for additional users
  // Maya: Offers Photography, Graphic Design | Wants: JavaScript, Video Editing
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[0].id, skillId: skillMap['Photography'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[0].id, skillId: skillMap['Graphic Design'], type: 'TEACH', level: 'Intermediate' },
      { userId: additionalUsers[0].id, skillId: skillMap['JavaScript'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[0].id, skillId: skillMap['Video Editing'], type: 'LEARN', level: 'Intermediate' },
    ],
  });

  // Alex: Offers Python, Data Analysis | Wants: Spanish, Public Speaking
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[1].id, skillId: skillMap['Python'], type: 'TEACH', level: 'Expert' },
      { userId: additionalUsers[1].id, skillId: skillMap['Data Analysis'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[1].id, skillId: skillMap['Spanish'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[1].id, skillId: skillMap['Public Speaking'], type: 'LEARN', level: 'Intermediate' },
    ],
  });

  // Sophie: Offers Piano, Music Production | Wants: JavaScript, React
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[2].id, skillId: skillMap['Piano'], type: 'TEACH', level: 'Expert' },
      { userId: additionalUsers[2].id, skillId: skillMap['Music Production'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[2].id, skillId: skillMap['JavaScript'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[2].id, skillId: skillMap['React'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Ryan: Offers Web Development, Cooking | Wants: UI/UX Design, Graphic Design
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[3].id, skillId: skillMap['Web Development'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[3].id, skillId: skillMap['Cooking'], type: 'TEACH', level: 'Intermediate' },
      { userId: additionalUsers[3].id, skillId: skillMap['UI/UX Design'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[3].id, skillId: skillMap['Graphic Design'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Olivia: Offers Graphic Design, Watercolor Painting | Wants: Yoga, Mindfulness Coaching
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[4].id, skillId: skillMap['Graphic Design'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[4].id, skillId: skillMap['Watercolor Painting'], type: 'TEACH', level: 'Intermediate' },
      { userId: additionalUsers[4].id, skillId: skillMap['Yoga'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[4].id, skillId: skillMap['Mindfulness Coaching'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Marcus: Offers Public Speaking, Writing | Wants: Video Editing, Graphic Design
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[5].id, skillId: skillMap['Public Speaking'], type: 'TEACH', level: 'Expert' },
      { userId: additionalUsers[5].id, skillId: skillMap['Writing'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[5].id, skillId: skillMap['Video Editing'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[5].id, skillId: skillMap['Graphic Design'], type: 'LEARN', level: 'Intermediate' },
    ],
  });

  // Isabella: Offers Video Editing, Graphic Design | Wants: Python, Data Analysis
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[6].id, skillId: skillMap['Video Editing'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[6].id, skillId: skillMap['Graphic Design'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[6].id, skillId: skillMap['Python'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[6].id, skillId: skillMap['Data Analysis'], type: 'LEARN', level: 'Intermediate' },
    ],
  });

  // David: Offers Python, Web Development | Wants: Guitar, Music Production
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[7].id, skillId: skillMap['Python'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[7].id, skillId: skillMap['Web Development'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[7].id, skillId: skillMap['Guitar'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[7].id, skillId: skillMap['Music Production'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Priya: Offers UI/UX Design, Watercolor Painting | Wants: React, JavaScript
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[8].id, skillId: skillMap['UI/UX Design'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[8].id, skillId: skillMap['Watercolor Painting'], type: 'TEACH', level: 'Intermediate' },
      { userId: additionalUsers[8].id, skillId: skillMap['React'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[8].id, skillId: skillMap['JavaScript'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // James: Offers Cooking, Writing | Wants: Data Analysis, Python
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[9].id, skillId: skillMap['Cooking'], type: 'TEACH', level: 'Expert' },
      { userId: additionalUsers[9].id, skillId: skillMap['Writing'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[9].id, skillId: skillMap['Data Analysis'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[9].id, skillId: skillMap['Python'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Luna: Offers Yoga, Mindfulness Coaching | Wants: Photography, Video Editing
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[10].id, skillId: skillMap['Yoga'], type: 'TEACH', level: 'Advanced' },
      { userId: additionalUsers[10].id, skillId: skillMap['Mindfulness Coaching'], type: 'TEACH', level: 'Intermediate' },
      { userId: additionalUsers[10].id, skillId: skillMap['Photography'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[10].id, skillId: skillMap['Video Editing'], type: 'LEARN', level: 'Beginner' },
    ],
  });

  // Noah: Offers React, JavaScript | Wants: French, Public Speaking
  await prisma.userSkill.createMany({
    data: [
      { userId: additionalUsers[11].id, skillId: skillMap['React'], type: 'TEACH', level: 'Expert' },
      { userId: additionalUsers[11].id, skillId: skillMap['JavaScript'], type: 'TEACH', level: 'Expert' },
      { userId: additionalUsers[11].id, skillId: skillMap['French'], type: 'LEARN', level: 'Beginner' },
      { userId: additionalUsers[11].id, skillId: skillMap['Public Speaking'], type: 'LEARN', level: 'Intermediate' },
    ],
  });

  // Create matches
  // Emma ↔ Liam (React ↔ UI/UX)
  const emmaLiamMatch = await prisma.match.create({
    data: {
      userAId: emma.id,
      userBId: liam.id,
      overlappingTeachLearnSummary: JSON.stringify({
        iCanTeachThem: ['UI/UX Design'],
        theyCanTeachMe: ['React'],
      }),
    },
  });

  // Sarah ↔ Jake (Yoga ↔ Music)
  const sarahJakeMatch = await prisma.match.create({
    data: {
      userAId: sarah.id,
      userBId: jake.id,
      overlappingTeachLearnSummary: JSON.stringify({
        iCanTeachThem: ['Yoga'],
        theyCanTeachMe: ['Music Production'],
      }),
    },
  });

  // Create sessions
  // Completed session between Emma and Liam
  const completedSession = await prisma.session.create({
    data: {
      matchId: emmaLiamMatch.id,
      focusSkillId: skillMap['React'],
      focusRole: 'USER_B_TEACHES',
      dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      mode: 'ONLINE',
      locationOrLink: 'https://meet.skillera.com/emma-liam-1',
      goals: 'Learn React basics: components, props, and state management',
      status: 'COMPLETED',
      createdById: liam.id,
    },
  });

  // Upcoming session between Sarah and Jake
  const upcomingSession = await prisma.session.create({
    data: {
      matchId: sarahJakeMatch.id,
      focusSkillId: skillMap['Yoga'],
      focusRole: 'USER_A_TEACHES',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      mode: 'IN_PERSON',
      locationOrLink: 'Local yoga studio downtown',
      goals: 'Introduction to Vinyasa flow and breathing techniques',
      status: 'ACCEPTED',
      createdById: sarah.id,
    },
  });

  // Create messages
  // Emma ↔ Liam messages
  await prisma.message.createMany({
    data: [
      {
        matchId: emmaLiamMatch.id,
        senderId: emma.id,
        content: 'Hey! Excited to help you with UI/UX Design 😊',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        matchId: emmaLiamMatch.id,
        senderId: liam.id,
        content: 'Amazing! I\'m really looking forward to learning React. Maybe we can focus on components and hooks first?',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        matchId: emmaLiamMatch.id,
        senderId: emma.id,
        content: 'Perfect! I\'d love to start with the basics. How does this Saturday afternoon work for you?',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        matchId: emmaLiamMatch.id,
        senderId: liam.id,
        content: 'Saturday works great! I\'ll send you a video link.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        matchId: emmaLiamMatch.id,
        senderId: emma.id,
        content: 'That session was really helpful! Thank you so much for your patience. Would you like to schedule another one?',
        sessionId: completedSession.id,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Sarah ↔ Jake messages
  await prisma.message.createMany({
    data: [
      {
        matchId: sarahJakeMatch.id,
        senderId: sarah.id,
        content: 'Hi Jake! I saw you\'re interested in learning Yoga. I\'d be happy to teach you some basics!',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        matchId: sarahJakeMatch.id,
        senderId: jake.id,
        content: 'That sounds amazing! I\'m a complete beginner. I can teach you music production in return. Does that work?',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        matchId: sarahJakeMatch.id,
        senderId: sarah.id,
        content: 'Perfect match! Let\'s plan our first session. I\'m free this weekend.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Create feedback for completed session
  await prisma.feedback.create({
    data: {
      sessionId: completedSession.id,
      fromUserId: emma.id,
      toUserId: liam.id,
      rating: 5,
      comment: 'Liam was an excellent teacher! He explained React concepts clearly and was very patient with my questions. I feel much more confident now.',
      confidenceImproved: true,
      wouldRecommend: true,
    },
  });

  await prisma.feedback.create({
    data: {
      sessionId: completedSession.id,
      fromUserId: liam.id,
      toUserId: emma.id,
      rating: 5,
      comment: 'Emma is a great learner and asked thoughtful questions. Looking forward to our design session!',
      confidenceImproved: true,
      wouldRecommend: true,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\nDemo accounts:');
  console.log('  emma@skillera.com / demo');
  console.log('  liam@skillera.com / demo');
  console.log('  sarah@skillera.com / demo');
  console.log('  jake@skillera.com / demo');
  console.log('\nAdditional profiles for swipe deck:');
  console.log('  ' + additionalUsers.length + ' additional users created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

