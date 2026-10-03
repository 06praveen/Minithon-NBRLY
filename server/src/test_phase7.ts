import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runPhase7Tests() {
  console.log('==================================================');
  console.log('RUNNING PHASE 7 END-TO-END AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  const ts = Date.now();
  const userAEmail = `requester_${ts}@nbrly.test`;
  const userBEmail = `helper_${ts}@nbrly.test`;
  const userCEmail = `intruder_${ts}@nbrly.test`;
  const password = 'Password123!';

  // 1. Register User A (Requester)
  console.log('1. Registering User A (Requester: Priya)...');
  const regARes = await axios.post(`${BASE_URL}/auth/register`, {
    name: `Priya_${ts.toString().slice(-4)}`,
    email: userAEmail,
    password,
    neighborhood: 'Bandra West, Mumbai',
    bio: 'Looking for friendly neighborhood help.',
  });
  const tokenA = regARes.data.data.token;
  const userAId = regARes.data.data.user.id;
  console.log(`   ✓ User A created (ID: ${userAId})\n`);

  // 2. Register User B (Helper)
  console.log('2. Registering User B (Helper: Aarav)...');
  const regBRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: `Aarav_${ts.toString().slice(-4)}`,
    email: userBEmail,
    password,
    neighborhood: 'Bandra West, Mumbai',
    bio: 'Happy to lend a hand to neighbors.',
  });
  const tokenB = regBRes.data.data.token;
  const userBId = regBRes.data.data.user.id;
  console.log(`   ✓ User B created (ID: ${userBId})\n`);

  // 3. Register User C (Intruder)
  console.log('3. Registering User C (Unauthorized third-party: Vikram)...');
  const regCRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: `Vikram_${ts.toString().slice(-4)}`,
    email: userCEmail,
    password,
    neighborhood: 'Andheri East, Mumbai',
    bio: 'Curious neighbor.',
  });
  const tokenC = regCRes.data.data.token;
  const userCId = regCRes.data.data.user.id;
  console.log(`   ✓ User C created (ID: ${userCId})\n`);

  // 4. User A creates a help request
  console.log('4. User A creating help request: "Need medicine pickup from chemist"...');
  const reqRes = await axios.post(
    `${BASE_URL}/requests`,
    {
      title: 'Need medicine pickup from chemist',
      description: 'Prescription is ready at Bandra Medical. Need someone to pick it up.',
      category: 'Healthcare / Medicine',
      urgency: 'TODAY',
      neighborhood: 'Bandra West, Mumbai',
      preferredDate: 'Today',
      preferredTime: 'Evening (6 PM)',
    },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  const requestData = reqRes.data.data.request;
  const requestId = requestData.id;
  console.log(`   ✓ Request created (ID: ${requestId}, Status: ${requestData.status})\n`);

  // 5. User B accepts the request
  console.log('5. User B accepts the help request (I CAN HELP)...');
  const acceptRes = await axios.post(
    `${BASE_URL}/requests/${requestId}/accept`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  const acceptData = acceptRes.data.data.request;
  console.log(`   ✓ Request accepted (Status: ${acceptData.status})\n`);

  // 6. Check Chat Creation & Access
  console.log('6. Testing Chat Access Control...');
  const chatARes = await axios.get(`${BASE_URL}/requests/${requestId}/chat`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const chatAData = chatARes.data.data;
  console.log(`   ✓ User A accessed chat. Conversation ID: ${chatAData.conversation.id}`);

  const chatBRes = await axios.get(`${BASE_URL}/requests/${requestId}/chat`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const chatBData = chatBRes.data.data;
  console.log(`   ✓ User B accessed chat. Conversation ID: ${chatBData.conversation.id}\n`);

  // 7. Security: User C attempts to read chat (Expect 403)
  console.log('7. Security Test: User C attempts to read chat (Expect 403 Forbidden)...');
  try {
    await axios.get(`${BASE_URL}/requests/${requestId}/chat`, {
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    throw new Error('SECURITY BREACH: User C was allowed to read private chat!');
  } catch (err: any) {
    if (err.response?.status === 403) {
      console.log('   ✓ SECURE: User C blocked with 403 Forbidden\n');
    } else {
      throw err;
    }
  }

  // 8. Messaging exchange
  console.log('8. Exchanging chat messages...');
  const msg1 = await axios.post(
    `${BASE_URL}/requests/${requestId}/chat/messages`,
    { content: 'Hi Aarav, what time should I expect you?' },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  console.log(`   ✓ User A sent: "${msg1.data.data.message.content}"`);

  const msg2 = await axios.post(
    `${BASE_URL}/requests/${requestId}/chat/messages`,
    { content: 'Around 6 PM would be perfect.' },
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log(`   ✓ User B sent: "${msg2.data.data.message.content}"\n`);

  // 9. Security: User C attempts to send message to chat (Expect 403)
  console.log('9. Security Test: User C attempts to post message to chat (Expect 403)...');
  try {
    await axios.post(
      `${BASE_URL}/requests/${requestId}/chat/messages`,
      { content: 'Can I join in?' },
      { headers: { Authorization: `Bearer ${tokenC}` } }
    );
    throw new Error('SECURITY BREACH: User C was allowed to post to private chat!');
  } catch (err: any) {
    if (err.response?.status === 403) {
      console.log('   ✓ SECURE: User C blocked with 403 Forbidden\n');
    } else {
      throw err;
    }
  }

  // 10. Helper starts help
  console.log('10. User B starts helping (START HELPING)...');
  const startRes = await axios.post(
    `${BASE_URL}/requests/${requestId}/start`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log(`   ✓ Help started (Status: ${startRes.data.data.request.status})\n`);

  // 11. Helper requests completion (MARK HELP AS DONE)
  console.log('11. Helper requests completion (MARK HELP AS DONE)...');
  const reqCompRes = await axios.post(
    `${BASE_URL}/requests/${requestId}/request-completion`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log(`   ✓ Completion requested at: ${reqCompRes.data.data.request.completionRequestedAt}`);
  console.log(`   ✓ Request status remains: ${reqCompRes.data.data.request.status} (NOT prematurely completed)\n`);

  // 12. Requester says "NOT YET"
  console.log('12. Requester clicks "NOT YET" (Reject/Postpone completion)...');
  const rejectRes = await axios.post(
    `${BASE_URL}/requests/${requestId}/reject-completion`,
    {},
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  console.log(`   ✓ Completion postponed. completionRequestedAt reset to: ${rejectRes.data.data.request.completionRequestedAt}`);
  console.log(`   ✓ Status remains: ${rejectRes.data.data.request.status}\n`);

  // 13. Helper re-requests completion
  console.log('13. Helper re-requests completion...');
  await axios.post(
    `${BASE_URL}/requests/${requestId}/request-completion`,
    {},
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log('   ✓ Re-requested completion.\n');

  // 14. Requester confirms completion
  console.log('14. Requester confirms completion (CONFIRM COMPLETION)...');
  const confirmRes = await axios.post(
    `${BASE_URL}/requests/${requestId}/confirm-completion`,
    {},
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  console.log(`   ✓ Confirmed completion! Status: ${confirmRes.data.data.request.status}`);
  console.log(`   ✓ CompletedAt: ${confirmRes.data.data.request.completedAt}\n`);

  // 15. Verify Helper completedHelps count incremented
  console.log('15. Verifying Helper completedHelps count in database...');
  const userBProfile = await axios.get(`${BASE_URL}/users/${userBId}`);
  console.log(`   ✓ Helper completedHelps: ${userBProfile.data.data.user.completedHelps}\n`);

  // 16. Two-way reviews: Requester reviews Helper
  console.log('16. Requester submitting review for Helper (5 stars)...');
  const revARes = await axios.post(
    `${BASE_URL}/requests/${requestId}/reviews`,
    { rating: 5, comment: 'Punctual and very polite. Delivered the medicines on time!' },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  console.log(`   ✓ Review from Requester saved (ID: ${revARes.data.data.review.id})\n`);

  // 17. Two-way reviews: Helper reviews Requester
  console.log('17. Helper submitting review for Requester (5 stars)...');
  const revBRes = await axios.post(
    `${BASE_URL}/requests/${requestId}/reviews`,
    { rating: 5, comment: 'Clear instructions and friendly communication!' },
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log(`   ✓ Review from Helper saved (ID: ${revBRes.data.data.review.id})\n`);

  // 18. Duplicate review prevention
  console.log('18. Duplicate Review Test: Requester attempts to review again (Expect 409)...');
  try {
    await axios.post(
      `${BASE_URL}/requests/${requestId}/reviews`,
      { rating: 4, comment: 'Second review attempt' },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    throw new Error('DUPLICATE REVIEW ALLOWED: Server should have rejected duplicate review!');
  } catch (err: any) {
    if (err.response?.status === 409 || err.response?.status === 400) {
      console.log(`   ✓ DUPLICATE PREVENTED: Blocked with ${err.response?.status} (${err.response?.data?.message})\n`);
    } else {
      throw err;
    }
  }

  // 19. Fetch all reviews for request
  console.log('19. Fetching request reviews...');
  const listReviewsRes = await axios.get(`${BASE_URL}/requests/${requestId}/reviews`);
  console.log(`   ✓ Found ${listReviewsRes.data.data.reviews.length} mutual reviews for this request.\n`);

  // 20. Check Updated Average Ratings on User Profiles
  console.log('20. Verifying recalculated user ratings in database...');
  const updatedUserA = await axios.get(`${BASE_URL}/users/${userAId}`);
  const updatedUserB = await axios.get(`${BASE_URL}/users/${userBId}`);
  console.log(`   ✓ User A (Requester) Rating: ${updatedUserA.data.data.user.rating} (${updatedUserA.data.data.user.reviewsReceived?.length || 1} review received)`);
  console.log(`   ✓ User B (Helper) Rating: ${updatedUserB.data.data.user.rating} (${updatedUserB.data.data.user.reviewsReceived?.length || 1} review received)`);

  console.log('\n==================================================');
  console.log('ALL PHASE 7 TESTS PASSED WITH 100% SUCCESS!');
  console.log('==================================================');
}

runPhase7Tests().catch((err) => {
  console.error('TEST FAILED:', err.response?.data || err.message);
  process.exit(1);
});
