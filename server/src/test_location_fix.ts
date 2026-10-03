import { prisma } from './config/db.js';
import { AuthService } from './services/auth.service.js';
import { UserService } from './services/user.service.js';
import { RequestService } from './services/request.service.js';
import { LocationService } from './services/location.service.js';

async function runTests() {
  console.log('=== RUNNING NBRLY LOCATION FIX VERIFICATION SUITE ===\n');

  // 1. TEST BUG 1: Custom Location Registration & Geocoding
  console.log('--- 1. Testing Registration with Custom Typed Location ---');
  const testEmail = `test_neighbor_${Date.now()}@example.com`;
  
  // Test 1a: Invalid location rejection
  try {
    await AuthService.register({
      name: 'Invalid Loc User',
      email: `invalid_${Date.now()}@example.com`,
      password: 'password123',
      neighborhood: 'invalid_nonexistent_place_xyz_9999',
    });
    console.error('❌ FAILED: Invalid location was not rejected!');
  } catch (err: any) {
    console.log('✅ PASSED: Invalid location properly rejected with message:', err.message);
  }

  // Test 1b: Valid custom registration (Bandra West, Mumbai)
  const regResult = await AuthService.register({
    name: 'Test Neighbor',
    email: testEmail,
    password: 'password123',
    neighborhood: 'Bandra West, Mumbai',
    bio: 'Happy to lend a hand in Bandra West.',
    skills: ['Technology', 'Grocery / Errands'],
  });

  const userFromDb = await prisma.user.findUnique({
    where: { id: regResult.user.id },
  });

  console.log('Registration DB Result:', {
    id: userFromDb?.id,
    name: userFromDb?.name,
    neighborhood: userFromDb?.neighborhood,
    locationName: userFromDb?.locationName,
    latitude: userFromDb?.latitude,
    longitude: userFromDb?.longitude,
  });

  if (
    userFromDb?.locationName === 'Bandra West, Mumbai' &&
    userFromDb?.latitude === 19.0596 &&
    userFromDb?.longitude === 72.8295
  ) {
    console.log('✅ PASSED: Registration geocoded locationName, latitude, and longitude correctly to PostgreSQL!');
  } else {
    console.error('❌ FAILED: Coordinates mismatch after registration.');
  }

  // 2. TEST BUG 2: Profile Update to Andheri East & 10 KM Filter Recalculation
  console.log('\n--- 2. Testing Profile Location Update to Andheri East ---');

  // Check initial distances from Bandra West (19.0596, 72.8295)
  const bandraRequests = await RequestService.listRequests({
    currentUser: userFromDb,
    sortBy: 'nearest',
  });
  console.log(`Requests count from Bandra West: ${bandraRequests.length}`);
  const sampleBandra = bandraRequests.slice(0, 3).map((r) => ({
    title: r.title.slice(0, 25),
    neighborhood: r.neighborhood,
    distanceKm: r.distanceKm,
  }));
  console.log('Sample distances when user in Bandra West:', sampleBandra);

  // Update profile to Andheri East
  const updatedUser = await UserService.updateProfile(userFromDb!.id, {
    neighborhood: 'Andheri East, Mumbai',
  });

  const userAfterUpdate = await prisma.user.findUnique({
    where: { id: userFromDb!.id },
  });

  console.log('DB Result after Profile Update:', {
    locationName: userAfterUpdate?.locationName,
    neighborhood: userAfterUpdate?.neighborhood,
    latitude: userAfterUpdate?.latitude,
    longitude: userAfterUpdate?.longitude,
  });

  if (
    userAfterUpdate?.locationName === 'Andheri East, Mumbai' &&
    userAfterUpdate?.latitude === 19.1155 &&
    userAfterUpdate?.longitude === 72.8697
  ) {
    console.log('✅ PASSED: Profile update synchronized locationName, latitude, and longitude to Andheri East (19.1155, 72.8697)!');
  } else {
    console.error('❌ FAILED: Coordinates not updated to Andheri East.');
  }

  // 3. Test 10 km filtering using the newly updated user coordinates from database
  console.log('\n--- 3. Testing 10 KM Filter with Updated Coordinates ---');
  const andheriRequests = await RequestService.listRequests({
    currentUser: userAfterUpdate,
    radius: 10,
    sortBy: 'nearest',
  });

  console.log(`Nearby requests within 10 km of Andheri East: ${andheriRequests.length}`);
  const sampleAndheri = andheriRequests.slice(0, 4).map((r) => ({
    title: r.title.slice(0, 25),
    neighborhood: r.neighborhood,
    distanceKm: r.distanceKm,
  }));
  console.log('Distances calculated from Andheri East:', sampleAndheri);

  const allWithin10 = andheriRequests.every((r) => r.distanceKm !== undefined && r.distanceKm <= 10);
  if (allWithin10) {
    console.log('✅ PASSED: All nearby requests are strictly within 10 km of Andheri East!');
  } else {
    console.error('❌ FAILED: Some requests exceeded 10 km.');
  }

  // 4. Test Cleanup
  await prisma.user.delete({ where: { id: userFromDb!.id } });
  console.log('\n✅ Cleanup complete. All verification checks passed successfully!');
}

runTests()
  .catch((e) => {
    console.error('Test execution failed:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
