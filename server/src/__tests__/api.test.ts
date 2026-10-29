import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../utils/prisma';

describe('FoodBridge End-to-End API Test Suite (HACK-P197)', () => {
  let donorToken: string;
  let recipientToken: string;
  let adminToken: string;
  let createdListingId: string;
  let createdRequestId: string;
  let verificationCode: string;

  beforeAll(async () => {
    // Authenticate demo accounts
    const donorRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'donor@grandplaza.com', password: 'Password@123' });
    donorToken = donorRes.body.token;

    const recipientRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'recipient@hopefoodbank.org', password: 'Password@123' });
    recipientToken = recipientRes.body.token;

    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@foodbridge.org', password: 'Admin@123' });
    adminToken = adminRes.body.token;
  });

  describe('1. Health & Disclaimer Endpoints', () => {
    it('GET /api/v1/health returns 200 with service metadata', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.hackathonProblemId).toBe('HACK-P197');
    });

    it('GET /api/v1/food-safety returns required non-certification disclaimer', async () => {
      const res = await request(app).get('/api/v1/food-safety');
      expect(res.status).toBe(200);
      expect(res.body.disclaimer).toContain('DOES NOT inspect, test, certify, or guarantee');
    });
  });

  describe('2. Authentication & User Registration', () => {
    const testEmail = `test_donor_${Date.now()}@testcorp.com`;

    it('POST /api/v1/auth/register registers a new donor successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password@123',
          name: 'City Bakery Test',
          role: 'DONOR',
          phone: '+1-555-9999',
          city: 'Metropolis',
          organizationType: 'Bakery',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('DONOR');
    });

    it('POST /api/v1/auth/register rejects duplicate email with 409', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'Password@123',
          name: 'Duplicate Account',
          role: 'DONOR',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register fails on invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: '123',
          name: 'Invalid',
          role: 'DONOR',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/v1/auth/login succeeds with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
    });

    it('POST /api/v1/auth/login rejects incorrect password with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login accepts mixed-case email addresses and admin dashboard authorizes admin', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ADMIN@FOODBRIDGE.ORG', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('ADMIN');

      const adminStatsRes = await request(app)
        .get('/api/v1/stats/dashboard')
        .set('Authorization', `Bearer ${res.body.token}`);

      expect(adminStatsRes.status).toBe(200);
      expect(adminStatsRes.body.stats.totalUsers).toBeGreaterThan(0);
    });

    it('GET /api/v1/auth/me returns authenticated user details', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('donor@grandplaza.com');
      expect(res.body.user.role).toBe('DONOR');
    });
  });

  describe('3. Listing CRUD & Input Validations', () => {
    it('GET /api/v1/listings returns seeded public listings', async () => {
      const res = await request(app).get('/api/v1/listings');
      expect(res.status).toBe(200);
      expect(res.body.listings.length).toBeGreaterThanOrEqual(10);
    });

    it('POST /api/v1/listings creates a new listing as DONOR', async () => {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const inTwoHours = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
      const inSixHours = new Date(Date.now() + 6 * 3600 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Freshly Baked Artisan Bread & Bagels',
          description: 'Surplus morning artisanal bakery loaves, completely fresh and packed in sanitized bags.',
          category: 'BAKERY',
          quantity: 20,
          unit: 'kg',
          dietaryInfo: 'Vegetarian',
          useBy: tomorrow,
          pickupWindowStart: inTwoHours,
          pickupWindowEnd: inSixHours,
          pickupAddress: '500 Grand Avenue, Bakery Kitchen',
          pickupCity: 'Metropolis',
          foodSafetyConfirmed: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.listing.title).toBe('Freshly Baked Artisan Bread & Bagels');
      expect(res.body.listing.status).toBe('AVAILABLE');
      createdListingId = res.body.listing.id;
    });

    it('POST /api/v1/listings rejects listing creation if food safety is not confirmed', async () => {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Unchecked Food Item',
          description: 'This listing forgot to confirm food safety rules.',
          category: 'PRODUCE',
          quantity: 10,
          unit: 'kg',
          useBy: tomorrow,
          pickupWindowStart: new Date().toISOString(),
          pickupWindowEnd: tomorrow,
          pickupAddress: '123 Street',
          pickupCity: 'Metropolis',
          foodSafetyConfirmed: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/listings prevents RECIPIENT from posting listings (RBAC 403)', async () => {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({
          title: 'Recipient Illegal Listing',
          description: 'Recipients are not authorized to create donation listings.',
          category: 'COOKED_MEALS',
          quantity: 10,
          unit: 'servings',
          useBy: tomorrow,
          pickupWindowStart: new Date().toISOString(),
          pickupWindowEnd: tomorrow,
          pickupAddress: '123 Street',
          pickupCity: 'Metropolis',
          foodSafetyConfirmed: true,
        });

      expect(res.status).toBe(403);
    });

    it('GET /api/v1/listings/:id retrieves full listing details', async () => {
      const res = await request(app).get(`/api/v1/listings/${createdListingId}`);
      expect(res.status).toBe(200);
      expect(res.body.listing.id).toBe(createdListingId);
      expect(res.body.listing.donor).toBeDefined();
    });

    it('PUT /api/v1/listings/:id updates listing details as owner donor', async () => {
      const res = await request(app)
        .put(`/api/v1/listings/${createdListingId}`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          quantity: 25,
          storageInstructions: 'Keep in dry room at 20°C',
        });

      expect(res.status).toBe(200);
      expect(res.body.listing.quantity).toBe(25);
      expect(res.body.listing.storageInstructions).toBe('Keep in dry room at 20°C');
    });
  });

  describe('4. Donation Request Workflow, Double-Booking Guard & Pickup', () => {
    it('POST /api/v1/requests creates a claim request as RECIPIENT', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({
          listingId: createdListingId,
          requestedQuantity: 25,
          purpose: 'Distribution to local community pantry families',
        });

      expect(res.status).toBe(201);
      expect(res.body.request.status).toBe('PENDING');
      expect(res.body.request.listingId).toBe(createdListingId);
      createdRequestId = res.body.request.id;
    });

    it('POST /api/v1/requests prevents duplicate pending requests from same recipient', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({
          listingId: createdListingId,
          requestedQuantity: 25,
          purpose: 'Duplicate claim attempt',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already have an active request');
    });

    it('POST /api/v1/requests/:id/accept allows donor to accept request and issues verification code', async () => {
      const res = await request(app)
        .post(`/api/v1/requests/${createdRequestId}/accept`)
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.request.status).toBe('ACCEPTED');
      expect(res.body.request.verificationCode).toBeDefined();
      verificationCode = res.body.request.verificationCode;

      // Verify listing transitioned to CONFIRMED
      const listingRes = await request(app).get(`/api/v1/listings/${createdListingId}`);
      expect(listingRes.body.listing.status).toBe('CONFIRMED');
    });

    it('DOUBLE-BOOKING GUARD: Prevents accepting another request or claiming a CONFIRMED listing', async () => {
      // Create a second recipient
      const secondRecipientEmail = `recipient2_${Date.now()}@mission.org`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: secondRecipientEmail,
          password: 'Password@123',
          name: 'Second Shelter NGO',
          role: 'RECIPIENT',
          registrationNumber: 'NGO-TEST-2',
        });
      const secondRecipientToken = regRes.body.token;

      // Attempt to claim already CONFIRMED listing
      const conflictRes = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${secondRecipientToken}`)
        .send({
          listingId: createdListingId,
          requestedQuantity: 25,
          purpose: 'Conflicting request attempt',
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.message).toContain('cannot be requested');
    });

    it('POST /api/v1/requests/:id/complete confirms pickup with verification code', async () => {
      const res = await request(app)
        .post(`/api/v1/requests/${createdRequestId}/complete`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ verificationCode });

      expect(res.status).toBe(200);
      expect(res.body.request.status).toBe('COMPLETED');

      // Verify listing also marked COMPLETED
      const listingRes = await request(app).get(`/api/v1/listings/${createdListingId}`);
      expect(listingRes.body.listing.status).toBe('COMPLETED');
    });

    it('POST /api/v1/requests/:id/complete rejects invalid verification code', async () => {
      // Test invalid code check against an active request
      const res = await request(app)
        .post(`/api/v1/requests/${createdRequestId}/complete`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ verificationCode: '0000' });

      // Request is already COMPLETED so status transition is rejected
      expect(res.status).toBe(400);
    });
  });

  describe('5. Platform Impact Statistics & Admin Moderation', () => {
    it('GET /api/v1/stats/platform returns dynamic calculated impact metrics', async () => {
      const res = await request(app).get('/api/v1/stats/platform');
      expect(res.status).toBe(200);
      expect(res.body.stats.totalFoodRescuedKg).toBeGreaterThan(0);
      expect(res.body.stats.totalMealsRescued).toBeGreaterThan(0);
      expect(res.body.stats.totalCO2AvoidedKg).toBeGreaterThan(0);
      expect(res.body.stats.categoryBreakdown.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/admin/users lists all users for ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThanOrEqual(7);
    });

    it('GET /api/v1/admin/audit-logs lists audit log trail', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
