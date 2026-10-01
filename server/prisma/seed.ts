import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NBRLY database seed...');

  // 1. Clean up existing data in reverse order of relations
  await prisma.communityActivity.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.review.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up old database tables.');

  // 2. Create Badges
  const badgesData = [
    {
      code: 'FIRST_HELPER',
      name: 'First Helper',
      description: 'Completed your first neighborhood help.',
      icon: 'HeartHandshake',
    },
    {
      code: 'COMMUNITY_BUILDER',
      name: 'Community Builder',
      description: 'Completed 5+ neighborhood helps.',
      icon: 'Users',
    },
    {
      code: 'QUICK_RESPONDER',
      name: 'Quick Responder',
      description: 'Responded and accepted requests swiftly.',
      icon: 'Zap',
    },
    {
      code: 'TEN_HELPS',
      name: '10 Helps Completed',
      description: 'Helped 10 or more neighbors in your community.',
      icon: 'Award',
    },
    {
      code: 'NEIGHBORHOOD_STAR',
      name: 'Neighborhood Star',
      description: 'Maintained a 4.8+ rating across 10+ completed helps.',
      icon: 'Star',
    },
  ];

  const badges = await Promise.all(
    badgesData.map((b) =>
      prisma.badge.create({
        data: b,
      })
    )
  );
  console.log(`✅ Created ${badges.length} community badges.`);

  const defaultPasswordHash = await bcrypt.hash('nbrly123', 10);

  // 3. Create Users
  const aarav = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Bandra West',
      bio: 'IT student who enjoys helping neighbors with technology, errands and everyday tasks.',
      rating: 4.8,
      completedHelps: 23,
      createdHelpsCount: 12,
      skills: ['Computer Help', 'Smartphone Setup', 'Errands', 'Basic Tech Support', 'Math'],
      joinedAt: 'Aug 2026',
    },
  });

  const rohan = await prisma.user.create({
    data: {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Bandra West',
      bio: 'Avid volunteer and tech enthusiast in Pali Hill.',
      rating: 4.9,
      completedHelps: 18,
      createdHelpsCount: 2,
      skills: ['Technology', 'Grocery / Errands', 'Healthcare / Medicine'],
      joinedAt: 'Jul 2026',
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: 'Priya Shah',
      email: 'priya.shah@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Bandra West',
      bio: 'Educator and community organizer passionate about literacy and senior care.',
      rating: 5.0,
      completedHelps: 12,
      createdHelpsCount: 5,
      skills: ['Education', 'Household', 'Elderly Assistance'],
      joinedAt: 'Jun 2026',
    },
  });

  const neha = await prisma.user.create({
    data: {
      name: 'Neha Kulkarni',
      email: 'neha.kulkarni@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Khar West',
      bio: 'Graphic designer who loves pet sitting and helping seniors with grocery shopping.',
      rating: 4.7,
      completedHelps: 9,
      createdHelpsCount: 3,
      skills: ['Grocery / Errands', 'Household', 'Transport'],
      joinedAt: 'May 2026',
    },
  });

  const vikram = await prisma.user.create({
    data: {
      name: 'Vikram Joshi',
      email: 'vikram.joshi@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Santacruz West',
      bio: 'Retired physics professor helping local high school students with math and sciences.',
      rating: 4.9,
      completedHelps: 15,
      createdHelpsCount: 4,
      skills: ['Education', 'Computer Help', 'Elderly Assistance'],
      joinedAt: 'Apr 2026',
    },
  });

  const ananya = await prisma.user.create({
    data: {
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Bandra East',
      bio: 'Health worker and first-aid volunteer.',
      rating: 4.9,
      completedHelps: 8,
      createdHelpsCount: 1,
      skills: ['Healthcare / Medicine', 'Elderly Assistance', 'Errands'],
      joinedAt: 'Sep 2026',
    },
  });

  console.log('✅ Created 6 community member accounts.');

  // 4. Award Badges
  for (const badge of badges) {
    await prisma.userBadge.create({
      data: {
        userId: aarav.id,
        badgeId: badge.id,
      },
    });
  }

  // Rohan & Priya badges
  await prisma.userBadge.createMany({
    data: [
      { userId: rohan.id, badgeId: badges[0].id },
      { userId: rohan.id, badgeId: badges[1].id },
      { userId: rohan.id, badgeId: badges[2].id },
      { userId: rohan.id, badgeId: badges[3].id },
      { userId: priya.id, badgeId: badges[0].id },
      { userId: priya.id, badgeId: badges[1].id },
      { userId: priya.id, badgeId: badges[2].id },
      { userId: vikram.id, badgeId: badges[0].id },
      { userId: vikram.id, badgeId: badges[1].id },
      { userId: vikram.id, badgeId: badges[3].id },
    ],
  });

  // 5. Create Help Requests
  const req1 = await prisma.helpRequest.create({
    data: {
      title: 'Pick up blood pressure medication from Apollo Pharmacy',
      description: 'Prescription is already paid online. Need someone walking past Turner Road to collect the sealed package and leave it at building security.',
      category: 'Healthcare / Medicine',
      urgency: 'URGENT',
      neighborhood: 'Bandra West',
      preferredDate: 'Today',
      preferredTime: 'Before 6:00 PM',
      reward: 'Homemade cookies 🍪',
      status: 'OPEN',
      requesterId: priya.id,
    },
  });

  const req2 = await prisma.helpRequest.create({
    data: {
      title: 'Setup WiFi router & Smart TV in living room',
      description: 'Just moved to Perry Cross Rd. Need help configuring the JioFiber router and connecting 2 laptops and a Samsung TV.',
      category: 'Technology',
      urgency: 'TODAY',
      neighborhood: 'Bandra West',
      preferredDate: 'Today',
      preferredTime: '7:30 PM',
      reward: 'Filter coffee + ₹150 for your time',
      status: 'OPEN',
      requesterId: rohan.id,
    },
  });

  const req3 = await prisma.helpRequest.create({
    data: {
      title: 'High school trigonometry & calculus doubt clearing',
      description: '10th grade student struggling with quadratic equations and triangle theorems before upcoming term exams.',
      category: 'Education',
      urgency: 'FLEXIBLE',
      neighborhood: 'Bandra West',
      preferredDate: 'Saturday',
      preferredTime: '11:00 AM – 1:00 PM',
      reward: 'Warm samosas and tea',
      status: 'OPEN',
      requesterId: priya.id,
    },
  });

  const req4 = await prisma.helpRequest.create({
    data: {
      title: 'Heavy grocery cartons carry to 3rd floor (no lift)',
      description: 'Monthly pantry delivery arriving. 3 large boxes of oil, rice, and dry goods. Need 15 mins of muscle assistance.',
      category: 'Grocery / Errands',
      urgency: 'TODAY',
      neighborhood: 'Khar West',
      preferredDate: 'Today',
      preferredTime: '5:00 PM',
      reward: 'Chilled tender coconut water',
      status: 'OPEN',
      requesterId: neha.id,
    },
  });

  const req5 = await prisma.helpRequest.create({
    data: {
      title: 'Companion walk for elderly grandmother in Joggers Park',
      description: 'My 78yo grandmother loves evening walks around 5:30 PM. Looking for a patient neighbor to accompany her for 30 mins.',
      category: 'Elderly Assistance',
      urgency: 'FLEXIBLE',
      neighborhood: 'Bandra West',
      preferredDate: 'Tomorrow',
      preferredTime: '5:30 PM – 6:15 PM',
      reward: 'Heartfelt gratitude & blessing',
      status: 'OPEN',
      requesterId: vikram.id,
    },
  });

  const req6 = await prisma.helpRequest.create({
    data: {
      title: 'Need jumper cables to start Maruti Swift in basement',
      description: 'Car battery drained overnight. Parked in B2 basement of St. Leo Road society. Need a neighbor with jumper cables.',
      category: 'Transport',
      urgency: 'URGENT',
      neighborhood: 'Bandra West',
      preferredDate: 'Today',
      preferredTime: 'Immediate',
      reward: '₹200 or tea on me',
      status: 'OPEN',
      requesterId: rohan.id,
    },
  });

  // Accepted request with assignment
  const reqAccepted = await prisma.helpRequest.create({
    data: {
      title: 'Emergency cat carrier transport to Vet Clinic',
      description: 'Cat has fever, need a ride or help carrying crate to Dr. Cooper Clinic on Hill Road.',
      category: 'Transport',
      urgency: 'URGENT',
      neighborhood: 'Bandra West',
      preferredDate: 'Today',
      preferredTime: '6:00 PM',
      reward: 'Chocolates & gratitude',
      status: 'ACCEPTED',
      requesterId: neha.id,
    },
  });

  await prisma.assignment.create({
    data: {
      requestId: reqAccepted.id,
      helperId: aarav.id,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  // Completed request with assignment and reviews
  const reqCompleted = await prisma.helpRequest.create({
    data: {
      title: 'Assemble IKEA study desk and chair',
      description: 'Need assistance tightening Allen key bolts and leveling desk legs for my home study room.',
      category: 'Household',
      urgency: 'TODAY',
      neighborhood: 'Bandra West',
      preferredDate: 'Yesterday',
      preferredTime: '4:00 PM',
      reward: 'Snacks & ₹250',
      status: 'COMPLETED',
      requesterId: priya.id,
    },
  });

  await prisma.assignment.create({
    data: {
      requestId: reqCompleted.id,
      helperId: aarav.id,
      status: 'COMPLETED',
      acceptedAt: new Date(Date.now() - 86400000),
      startedAt: new Date(Date.now() - 80000000),
      completedAt: new Date(Date.now() - 75000000),
    },
  });

  // 6. Create Reviews
  await prisma.review.create({
    data: {
      requestId: reqCompleted.id,
      reviewerId: priya.id,
      revieweeId: aarav.id,
      rating: 5,
      comment: 'Very helpful and arrived on time. Assembled the desk flawlessly!',
      createdAt: new Date(Date.now() - 72000000),
    },
  });

  await prisma.review.create({
    data: {
      requestId: reqCompleted.id,
      reviewerId: rohan.id,
      revieweeId: aarav.id,
      rating: 5,
      comment: 'Helped me set up my laptop quickly and patiently explained everything.',
      createdAt: new Date(Date.now() - 172800000),
    },
  });

  await prisma.review.create({
    data: {
      requestId: reqCompleted.id,
      reviewerId: vikram.id,
      revieweeId: aarav.id,
      rating: 5,
      comment: 'Dependable and polite young man. Picked up heavy groceries with zero hesitation.',
      createdAt: new Date(Date.now() - 345600000),
    },
  });

  await prisma.review.create({
    data: {
      requestId: reqCompleted.id,
      reviewerId: neha.id,
      revieweeId: aarav.id,
      rating: 4,
      comment: 'Great help troubleshooting my phone settings. Highly recommended neighbor!',
      createdAt: new Date(Date.now() - 518400000),
    },
  });

  // 7. Create Community Activities
  const activitiesData = [
    {
      type: 'HELP_COMPLETED' as const,
      userName: 'Rohan Mehta',
      targetName: 'Priya Shah',
      requestTitle: 'Laptop Setup',
      timestamp: '12 min ago',
    },
    {
      type: 'HELP_COMPLETED' as const,
      userName: 'Aarav Sharma',
      targetName: 'Vikram Joshi',
      requestTitle: 'Medicine Pickup',
      timestamp: '1 hr ago',
    },
    {
      type: 'HELP_ACCEPTED' as const,
      userName: 'Aarav Sharma',
      targetName: 'Neha Kulkarni',
      requestTitle: 'Cat Carrier Transport',
      timestamp: '1.5 hrs ago',
    },
    {
      type: 'REQUEST_CREATED' as const,
      userName: 'Priya Shah',
      targetName: undefined,
      requestTitle: 'Pick up BP medication from Apollo',
      timestamp: '2 hrs ago',
    },
    {
      type: 'MEMBER_JOINED' as const,
      userName: 'Ananya Deshmukh',
      targetName: undefined,
      requestTitle: undefined,
      timestamp: '3 hrs ago',
    },
    {
      type: 'HELP_COMPLETED' as const,
      userName: 'Vikram Joshi',
      targetName: 'Priya Shah',
      requestTitle: 'Math Tutoring Session',
      timestamp: '5 hrs ago',
    },
  ];

  await prisma.communityActivity.createMany({
    data: activitiesData,
  });

  console.log('✅ Created community activity feed.');
  console.log('🎉 NBRLY Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
