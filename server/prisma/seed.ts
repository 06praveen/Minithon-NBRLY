import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NBRLY database seed (rich multi-neighborhood dataset)...');

  // 1. Clean up existing data in reverse order of relations (idempotent)
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

  // 3. Create 8 Users across Mumbai neighborhoods with realistic coordinates
  const aarav = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Bandra West',
      locationName: 'Bandra West, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
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
      locationName: 'Pali Hill, Bandra West, Mumbai',
      latitude: 19.0624,
      longitude: 72.8273,
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
      locationName: 'Perry Cross Rd, Bandra West, Mumbai',
      latitude: 19.0560,
      longitude: 72.8260,
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
      locationName: 'Khar West, Mumbai',
      latitude: 19.0699,
      longitude: 72.8335,
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
      locationName: 'Santacruz West, Mumbai',
      latitude: 19.0843,
      longitude: 72.8360,
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
      locationName: 'Bandra East, Mumbai',
      latitude: 19.0607,
      longitude: 72.8465,
      bio: 'Health worker and first-aid volunteer.',
      rating: 4.9,
      completedHelps: 8,
      createdHelpsCount: 1,
      skills: ['Healthcare / Medicine', 'Elderly Assistance', 'Errands'],
      joinedAt: 'Sep 2026',
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Juhu',
      locationName: 'Juhu, Mumbai',
      latitude: 19.1075,
      longitude: 72.8263,
      bio: 'Fitness trainer and active animal welfare volunteer.',
      rating: 4.8,
      completedHelps: 11,
      createdHelpsCount: 3,
      skills: ['Transport', 'Household', 'Errands'],
      joinedAt: 'May 2026',
    },
  });

  const deepa = await prisma.user.create({
    data: {
      name: 'Deepa Iyer',
      email: 'deepa.iyer@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      neighborhood: 'Vile Parle',
      locationName: 'Vile Parle West, Mumbai',
      latitude: 19.0998,
      longitude: 72.8436,
      bio: 'College counselor and plant parent who enjoys sharing extra home-cooked meals.',
      rating: 5.0,
      completedHelps: 7,
      createdHelpsCount: 2,
      skills: ['Education', 'Household', 'Grocery / Errands'],
      joinedAt: 'Aug 2026',
    },
  });

  console.log('✅ Created 8 realistic community member accounts.');

  // 4. Award Badges
  for (const badge of badges) {
    await prisma.userBadge.create({
      data: {
        userId: aarav.id,
        badgeId: badge.id,
      },
    });
  }

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
      { userId: rahul.id, badgeId: badges[0].id },
      { userId: rahul.id, badgeId: badges[1].id },
      { userId: deepa.id, badgeId: badges[0].id },
    ],
  });

  // 5. Create Diverse Help Requests across Mumbai neighborhoods
  const requestsData = [
    {
      title: 'Pick up blood pressure medication from Apollo Pharmacy',
      description: 'Prescription is already paid online. Need someone walking past Turner Road to collect the sealed package and leave it at building security.',
      category: 'Healthcare / Medicine',
      urgency: 'URGENT' as const,
      neighborhood: 'Bandra West',
      locationName: 'Turner Road, Bandra West, Mumbai',
      latitude: 19.0585,
      longitude: 72.8290,
      preferredDate: 'Today',
      preferredTime: 'Before 6:00 PM',
      reward: 'Homemade cookies 🍪',
      status: 'OPEN' as const,
      requesterId: priya.id,
    },
    {
      title: 'Setup WiFi router & Smart TV in living room',
      description: 'Just moved to Perry Cross Rd. Need help configuring the JioFiber router and connecting 2 laptops and a Samsung TV.',
      category: 'Technology',
      urgency: 'TODAY' as const,
      neighborhood: 'Bandra West',
      locationName: 'Perry Cross Rd, Bandra West, Mumbai',
      latitude: 19.0560,
      longitude: 72.8260,
      preferredDate: 'Today',
      preferredTime: '7:30 PM',
      reward: 'Filter coffee + ₹150 for your time',
      status: 'OPEN' as const,
      requesterId: rohan.id,
    },
    {
      title: 'High school trigonometry & calculus doubt clearing',
      description: '10th grade student struggling with quadratic equations and triangle theorems before upcoming term exams.',
      category: 'Education',
      urgency: 'FLEXIBLE' as const,
      neighborhood: 'Bandra West',
      locationName: 'St. Leo Road, Bandra West, Mumbai',
      latitude: 19.0615,
      longitude: 72.8285,
      preferredDate: 'Saturday',
      preferredTime: '11:00 AM – 1:00 PM',
      reward: 'Warm samosas and tea',
      status: 'OPEN' as const,
      requesterId: priya.id,
    },
    {
      title: 'Heavy grocery cartons carry to 3rd floor (no lift)',
      description: 'Monthly pantry delivery arriving. 3 large boxes of oil, rice, and dry goods. Need 15 mins of muscle assistance.',
      category: 'Grocery / Errands',
      urgency: 'TODAY' as const,
      neighborhood: 'Khar West',
      locationName: '14th Road, Khar West, Mumbai',
      latitude: 19.0699,
      longitude: 72.8335,
      preferredDate: 'Today',
      preferredTime: '5:00 PM',
      reward: 'Chilled tender coconut water',
      status: 'OPEN' as const,
      requesterId: neha.id,
    },
    {
      title: 'Companion walk for elderly grandmother in Joggers Park',
      description: 'My 78yo grandmother loves evening walks around 5:30 PM. Looking for a patient neighbor to accompany her for 30 mins.',
      category: 'Elderly Assistance',
      urgency: 'FLEXIBLE' as const,
      neighborhood: 'Bandra West',
      locationName: 'Joggers Park, Bandra West, Mumbai',
      latitude: 19.0640,
      longitude: 72.8245,
      preferredDate: 'Tomorrow',
      preferredTime: '5:30 PM – 6:15 PM',
      reward: 'Heartfelt gratitude & blessing',
      status: 'OPEN' as const,
      requesterId: vikram.id,
    },
    {
      title: 'Need jumper cables to start Maruti Swift in basement',
      description: 'Car battery drained overnight. Parked in B2 basement of St. Leo Road society. Need a neighbor with jumper cables.',
      category: 'Transport',
      urgency: 'URGENT' as const,
      neighborhood: 'Bandra West',
      locationName: 'St. Leo Road, Bandra West, Mumbai',
      latitude: 19.0610,
      longitude: 72.8290,
      preferredDate: 'Today',
      preferredTime: 'Immediate',
      reward: '₹200 or tea on me',
      status: 'OPEN' as const,
      requesterId: rohan.id,
    },
    {
      title: 'Emergency cat carrier transport to Vet Clinic on Hill Road',
      description: 'Cat has fever, need a ride or hand carrying crate to Dr. Cooper Clinic.',
      category: 'Transport',
      urgency: 'URGENT' as const,
      neighborhood: 'Bandra West',
      locationName: 'Hill Road, Bandra West, Mumbai',
      latitude: 19.0550,
      longitude: 72.8310,
      preferredDate: 'Today',
      preferredTime: '6:30 PM',
      reward: 'Chocolates & gratitude',
      status: 'OPEN' as const,
      requesterId: neha.id,
    },
    {
      title: 'Help elderly neighbor with smartphone banking app (UPI)',
      description: 'Need patient guidance setting up GPay on new Android phone with two-factor verification.',
      category: 'Technology',
      urgency: 'TODAY' as const,
      neighborhood: 'Santacruz West',
      locationName: 'Santacruz West, Mumbai',
      latitude: 19.0843,
      longitude: 72.8360,
      preferredDate: 'Today',
      preferredTime: '4:30 PM',
      reward: 'Tea and homemade biscuits',
      status: 'OPEN' as const,
      requesterId: vikram.id,
    },
    {
      title: 'Carry 4 indoor plant pots down to garden balcony',
      description: 'Heavy clay pots need relocation before balcony painting starts tomorrow morning.',
      category: 'Household',
      urgency: 'TODAY' as const,
      neighborhood: 'Juhu',
      locationName: 'Juhu Tara Rd, Juhu, Mumbai',
      latitude: 19.1075,
      longitude: 72.8263,
      preferredDate: 'Today',
      preferredTime: '5:30 PM',
      reward: 'Fresh aloe vera sapling',
      status: 'OPEN' as const,
      requesterId: rahul.id,
    },
    {
      title: 'Need a drill machine for 20 mins to hang curtain rods',
      description: 'Moving into new flat near Mithibai College. Need hammer drill with 6mm bit for masonry wall.',
      category: 'Household',
      urgency: 'FLEXIBLE' as const,
      neighborhood: 'Vile Parle',
      locationName: 'Vile Parle West, Mumbai',
      latitude: 19.0998,
      longitude: 72.8436,
      preferredDate: 'Sunday',
      preferredTime: 'Afternoon',
      reward: 'Home-baked lemon cake slice',
      status: 'OPEN' as const,
      requesterId: deepa.id,
    },
    {
      title: 'Need help moving office monitors to storage in Thane (>20 km away)',
      description: 'Transporting surplus monitors to Ghodbunder warehouse in Thane. Looking for someone with a spacious boot.',
      category: 'Transport',
      urgency: 'FLEXIBLE' as const,
      neighborhood: 'Thane',
      locationName: 'Ghodbunder Road, Thane, Mumbai',
      latitude: 19.2183,
      longitude: 72.9781,
      preferredDate: 'Next Weekend',
      preferredTime: 'Morning',
      reward: '₹500 petrol contribution',
      status: 'OPEN' as const,
      requesterId: rohan.id,
    },
  ];

  for (const req of requestsData) {
    await prisma.helpRequest.create({ data: req });
  }

  // Accepted Request with active assignment
  const reqAccepted = await prisma.helpRequest.create({
    data: {
      title: 'Pick up medical test report from Suburban Diagnostics',
      description: 'Thyroid & blood report ready at Waterfield Road center. Need someone to collect hardcopy.',
      category: 'Healthcare / Medicine',
      urgency: 'TODAY',
      neighborhood: 'Bandra West',
      locationName: 'Waterfield Road, Bandra West, Mumbai',
      latitude: 19.0570,
      longitude: 72.8300,
      preferredDate: 'Today',
      preferredTime: '6:00 PM',
      reward: 'Cold coffee',
      status: 'ACCEPTED',
      requesterId: priya.id,
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

  // Completed Requests with assignments and reviews
  const reqCompleted1 = await prisma.helpRequest.create({
    data: {
      title: 'Assemble IKEA study desk and chair',
      description: 'Need assistance tightening Allen key bolts and leveling desk legs for home study room.',
      category: 'Household',
      urgency: 'TODAY',
      neighborhood: 'Bandra West',
      locationName: 'Pali Mala Road, Bandra West, Mumbai',
      latitude: 19.0630,
      longitude: 72.8280,
      preferredDate: 'Yesterday',
      preferredTime: '4:00 PM',
      reward: 'Snacks & ₹250',
      status: 'COMPLETED',
      requesterId: priya.id,
    },
  });

  await prisma.assignment.create({
    data: {
      requestId: reqCompleted1.id,
      helperId: aarav.id,
      status: 'COMPLETED',
      acceptedAt: new Date(Date.now() - 86400000),
      startedAt: new Date(Date.now() - 80000000),
      completedAt: new Date(Date.now() - 75000000),
    },
  });

  const reqCompleted2 = await prisma.helpRequest.create({
    data: {
      title: 'Urgent insulin injection pen collection from chemist',
      description: 'Cold storage package needed immediately for diabetic senior.',
      category: 'Healthcare / Medicine',
      urgency: 'URGENT',
      neighborhood: 'Bandra West',
      locationName: 'Hill Road, Bandra West, Mumbai',
      latitude: 19.0555,
      longitude: 72.8305,
      preferredDate: '2 days ago',
      preferredTime: '2:00 PM',
      reward: 'Blessings & gratitude',
      status: 'COMPLETED',
      requesterId: rohan.id,
    },
  });

  await prisma.assignment.create({
    data: {
      requestId: reqCompleted2.id,
      helperId: aarav.id,
      status: 'COMPLETED',
      acceptedAt: new Date(Date.now() - 172800000),
      startedAt: new Date(Date.now() - 170000000),
      completedAt: new Date(Date.now() - 165000000),
    },
  });

  // 6. Create Reviews
  await prisma.review.create({
    data: {
      requestId: reqCompleted1.id,
      reviewerId: priya.id,
      revieweeId: aarav.id,
      rating: 5,
      comment: 'Very helpful and arrived on time. Assembled the desk flawlessly and left the room spotless!',
      createdAt: new Date(Date.now() - 72000000),
    },
  });

  await prisma.review.create({
    data: {
      requestId: reqCompleted1.id,
      reviewerId: rohan.id,
      revieweeId: aarav.id,
      rating: 5,
      comment: 'Helped me set up my laptop quickly and patiently explained everything.',
      createdAt: new Date(Date.now() - 172800000),
    },
  });

  await prisma.review.create({
    data: {
      requestId: reqCompleted2.id,
      reviewerId: vikram.id,
      revieweeId: aarav.id,
      rating: 5,
      comment: 'Dependable and polite young man. Picked up heavy groceries with zero hesitation.',
      createdAt: new Date(Date.now() - 345600000),
    },
  });

  await prisma.review.create({
    data: {
      requestId: reqCompleted2.id,
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
      userName: 'Aarav Sharma',
      targetName: 'Priya Shah',
      requestTitle: 'IKEA Desk Assembly',
      timestamp: '15 min ago',
    },
    {
      type: 'HELP_COMPLETED' as const,
      userName: 'Rohan Mehta',
      targetName: 'Vikram Joshi',
      requestTitle: 'Insulin Collection',
      timestamp: '1 hr ago',
    },
    {
      type: 'HELP_ACCEPTED' as const,
      userName: 'Aarav Sharma',
      targetName: 'Priya Shah',
      requestTitle: 'Diagnostics Report Pickup',
      timestamp: '2 hrs ago',
    },
    {
      type: 'REQUEST_CREATED' as const,
      userName: 'Rahul Verma',
      targetName: undefined,
      requestTitle: 'Carry Balcony Pots',
      timestamp: '3 hrs ago',
    },
    {
      type: 'MEMBER_JOINED' as const,
      userName: 'Deepa Iyer',
      targetName: undefined,
      requestTitle: undefined,
      timestamp: '4 hrs ago',
    },
    {
      type: 'HELP_COMPLETED' as const,
      userName: 'Vikram Joshi',
      targetName: 'Priya Shah',
      requestTitle: 'Math Tutoring Session',
      timestamp: '6 hrs ago',
    },
  ];

  await prisma.communityActivity.createMany({
    data: activitiesData,
  });

  console.log('✅ Created 14+ help requests, assignments, reviews, and community activities.');
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
