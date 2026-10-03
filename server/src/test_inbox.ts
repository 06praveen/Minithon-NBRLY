import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runInboxTests() {
  console.log('==================================================');
  console.log('RUNNING NBRLY INBOX & SMART MATCH NOTIFICATION TESTS');
  console.log('==================================================\n');

  const ts = Date.now();
  const emailA = `requester_inbox_${ts}@nbrly.test`;
  const emailB = `helper_inbox_${ts}@nbrly.test`;
  const password = 'Password123!';

  // 1. Register User A (Requester: Priya in Bandra West)
  console.log('1. Registering User A (Requester: Priya in Bandra West)...');
  const regARes = await axios.post(`${BASE_URL}/auth/register`, {
    name: `Priya_${ts.toString().slice(-4)}`,
    email: emailA,
    password,
    neighborhood: 'Bandra West, Mumbai',
    bio: 'Need help with various home tasks.',
  });
  const tokenA = regARes.data.data.token;
  const userAId = regARes.data.data.user.id;
  console.log(`   ✓ User A created (ID: ${userAId})\n`);

  // 2. Register User B (Helper: Aarav in Khar West, Computer skills, ~2 km away)
  console.log('2. Registering User B (Helper: Aarav with Technical Help skills in Khar West)...');
  const regBRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: `Aarav_${ts.toString().slice(-4)}`,
    email: emailB,
    password,
    neighborhood: 'Khar West, Mumbai',
    bio: 'Tech enthusiast and helpful neighbor.',
    skills: ['Technology', 'Computer Help', 'Electronics'],
  });
  const tokenB = regBRes.data.data.token;
  const userBId = regBRes.data.data.user.id;
  console.log(`   ✓ User B created (ID: ${userBId})\n`);

  // 3. User A creates a Technical Help request
  console.log('3. User A creating request: "Need help with laptop setup"...');
  const reqRes = await axios.post(
    `${BASE_URL}/requests`,
    {
      title: 'Need help with laptop setup',
      description: 'Need assistance installing development tools and configuring Wi-Fi router.',
      category: 'Technology',
      urgency: 'TODAY',
      neighborhood: 'Bandra West, Mumbai',
      preferredDate: 'Today',
      preferredTime: 'Evening (6 PM)',
    },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  const request = reqRes.data.data.request;
  const requestId = request.id;
  console.log(`   ✓ Request created (ID: ${requestId}, Category: ${request.category})\n`);

  // Give asynchronous match evaluation a moment
  await new Promise((r) => setTimeout(r, 600));

  // 4. Verify User B receives SMART MATCH notification
  console.log('4. Verifying Smart Match notification received by User B...');
  const notifsBRes = await axios.get(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const notifsB = notifsBRes.data.data.notifications;
  const matchNotif = notifsB.find((n: any) => n.type === 'MATCH' && n.requestId === requestId);

  if (!matchNotif) {
    throw new Error('FAILED: User B did not receive MATCH notification for qualifying request!');
  }
  console.log(`   ✓ User B received MATCH notification: "${matchNotif.title}" — "${matchNotif.message}"`);
  console.log(`   ✓ Match Score: ${matchNotif.matchScore}% | Distance: ${matchNotif.distanceKm} km\n`);

  // 5. Check Unread Count API
  console.log('5. Testing unread count API for User B...');
  const unreadBRes = await axios.get(`${BASE_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`   ✓ User B Unread Count: ${unreadBRes.data.data.unreadCount}`);

  // 6. User B marks notification as read
  console.log('6. Marking notification as read...');
  await axios.patch(
    `${BASE_URL}/notifications/${matchNotif.id}/read`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  const unreadBAfter = await axios.get(`${BASE_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  console.log(`   ✓ User B Unread Count after read: ${unreadBAfter.data.data.unreadCount}\n`);

  // 7. User B accepts request (I CAN HELP)
  console.log('7. User B accepts the request (I CAN HELP)...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/accept`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log('   ✓ Request accepted by User B.\n');

  await new Promise((r) => setTimeout(r, 500));

  // 8. Verify User A receives REQUEST_ACCEPTED notification
  console.log('8. Verifying REQUEST_ACCEPTED notification received by User A...');
  const notifsARes = await axios.get(`${BASE_URL}/notifications?tab=requests`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const acceptNotif = notifsARes.data.data.notifications.find(
    (n: any) => n.type === 'REQUEST_ACCEPTED' && n.requestId === requestId
  );
  if (!acceptNotif) {
    throw new Error('FAILED: User A did not receive REQUEST_ACCEPTED notification!');
  }
  console.log(`   ✓ User A received: "${acceptNotif.title}" — "${acceptNotif.message}"\n`);

  // 9. User B sends chat message
  console.log('9. User B sends chat message: "Hi Priya, I can help at 6 PM."...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/chat/messages`,
    { content: 'Hi Priya, I can help at 6 PM.' },
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );

  await new Promise((r) => setTimeout(r, 500));

  // 10. Verify User A receives NEW_MESSAGE notification
  console.log('10. Verifying NEW_MESSAGE notification received by User A...');
  const notifsAMsgRes = await axios.get(`${BASE_URL}/notifications?tab=messages`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const msgNotif = notifsAMsgRes.data.data.notifications.find(
    (n: any) => n.type === 'NEW_MESSAGE' && n.requestId === requestId
  );
  if (!msgNotif) {
    throw new Error('FAILED: User A did not receive NEW_MESSAGE notification!');
  }
  console.log(`   ✓ User A received: "${msgNotif.title}" — "${msgNotif.message}"\n`);

  // 11. User B starts helping
  console.log('11. User B starts help (START HELPING)...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/start`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );

  await new Promise((r) => setTimeout(r, 500));

  // 12. Verify User A receives REQUEST_STARTED notification
  console.log('12. Verifying REQUEST_STARTED notification received by User A...');
  const notifsAStartedRes = await axios.get(`${BASE_URL}/notifications?tab=requests`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const startNotif = notifsAStartedRes.data.data.notifications.find(
    (n: any) => n.type === 'REQUEST_STARTED' && n.requestId === requestId
  );
  if (!startNotif) {
    throw new Error('FAILED: User A did not receive REQUEST_STARTED notification!');
  }
  console.log(`   ✓ User A received: "${startNotif.title}" — "${startNotif.message}"\n`);

  // 13. User B requests completion (MARK HELP AS DONE)
  console.log('13. User B marks help as done (MARK HELP AS DONE)...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/request-completion`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );

  await new Promise((r) => setTimeout(r, 500));

  // 14. Verify User A receives COMPLETION_REQUESTED notification
  console.log('14. Verifying COMPLETION_REQUESTED notification received by User A...');
  const notifsACompReq = await axios.get(`${BASE_URL}/notifications?tab=requests`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const compReqNotif = notifsACompReq.data.data.notifications.find(
    (n: any) => n.type === 'COMPLETION_REQUESTED' && n.requestId === requestId
  );
  if (!compReqNotif) {
    throw new Error('FAILED: User A did not receive COMPLETION_REQUESTED notification!');
  }
  console.log(`   ✓ User A received: "${compReqNotif.title}" — "${compReqNotif.message}"\n`);

  // 15. User A confirms completion (CONFIRM COMPLETION)
  console.log('15. User A confirms completion (CONFIRM COMPLETION)...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/confirm-completion`,
    {},
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );

  await new Promise((r) => setTimeout(r, 500));

  // 16. Verify User B receives REQUEST_COMPLETED & REVIEW_AVAILABLE notifications
  console.log('16. Verifying REQUEST_COMPLETED & REVIEW_AVAILABLE notifications for User B...');
  const notifsBComp = await axios.get(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const compNotifB = notifsBComp.data.data.notifications.find(
    (n: any) => n.type === 'REQUEST_COMPLETED' && n.requestId === requestId
  );
  const revNotifB = notifsBComp.data.data.notifications.find(
    (n: any) => n.type === 'REVIEW_AVAILABLE' && n.requestId === requestId
  );
  if (!compNotifB || !revNotifB) {
    throw new Error('FAILED: User B did not receive REQUEST_COMPLETED / REVIEW_AVAILABLE notifications!');
  }
  console.log(`   ✓ User B received: "${compNotifB.title}" — "${compNotifB.message}"`);
  console.log(`   ✓ User B received: "${revNotifB.title}" — "${revNotifB.message}"\n`);

  // 17. User A submits review for User B
  console.log('17. User A submits review (5★) for User B...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/reviews`,
    { rating: 5, comment: 'Super fast laptop setup! Thank you!' },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );

  // 18. User B submits review for User A
  console.log('18. User B submits review (5★) for User A...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/reviews`,
    { rating: 5, comment: 'Great neighbor to help!' },
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );

  await new Promise((r) => setTimeout(r, 500));

  // 19. Check Conversations Hub API
  console.log('19. Testing Conversations Hub API (GET /api/notifications/conversations)...');
  const convosRes = await axios.get(`${BASE_URL}/notifications/conversations`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const convos = convosRes.data.data.conversations;
  const matchConvo = convos.find((c: any) => c.requestId === requestId);
  if (!matchConvo) {
    throw new Error('FAILED: Conversations hub did not list the active help conversation!');
  }
  console.log(`   ✓ Active conversation found with: ${matchConvo.otherParty.name}`);
  console.log(`   ✓ Last message: "${matchConvo.lastMessage.content}"\n`);

  // 20. Test Mark All As Read
  console.log('20. Testing Mark All As Read (PATCH /api/notifications/read-all)...');
  await axios.patch(
    `${BASE_URL}/notifications/read-all`,
    {},
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  const unreadAFinal = await axios.get(`${BASE_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  console.log(`   ✓ User A Unread Count after read-all: ${unreadAFinal.data.data.unreadCount}\n`);

  console.log('==================================================');
  console.log('ALL INBOX & NOTIFICATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('==================================================');
}

runInboxTests().catch((err) => {
  console.error('TEST FAILED:', err.response?.data || err.message);
  process.exit(1);
});
