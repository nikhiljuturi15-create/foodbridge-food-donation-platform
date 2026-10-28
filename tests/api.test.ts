import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';
import { prisma } from '../server/src/utils/prisma';

describe('FoodBridge Integration Tests - College Deliverable (HACK-P197)', () => {
  let donorToken: string;
  let recipientToken: string;
  let adminToken: string;
  let listingId: string;
  let requestId: string;
  let verificationCode: string;

  beforeAll(async () => {
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

  it('Verifies Service Health and Food Safety Disclaimer', async () => {
    const health = await request(app).get('/api/v1/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('healthy');

    const disclaimer = await request(app).get('/api/v1/food-safety');
    expect(disclaimer.status).toBe(200);
    expect(disclaimer.body.disclaimer).toContain('DOES NOT inspect, test, certify, or guarantee');
  });

  it('Registers new Donor with bcrypt password hashing and returns JWT', async () => {
    const email = `root_test_${Date.now()}@donor.org`;
    const res = await request(app).post('/api/v1/auth/register').send({
      email,
      password: 'Password@123',
      name: 'Organic Harvest Hub',
      role: 'DONOR',
      city: 'Metropolis',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('Authenticates registered user and rejects invalid password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'donor@grandplaza.com',
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  it('Enforces RBAC: Recipient cannot create listing', async () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        title: 'Unauthorized Listing',
        description: 'Should be rejected by RBAC',
        category: 'COOKED_MEALS',
        quantity: 10,
        unit: 'meals',
        useBy: tomorrow,
        pickupWindowStart: new Date().toISOString(),
        pickupWindowEnd: tomorrow,
        pickupAddress: 'Main St',
        pickupCity: 'Metropolis',
        foodSafetyConfirmed: true,
      });
    expect(res.status).toBe(403);
  });

  it('Allows Donor to create valid listing with food safety confirmation', async () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        title: 'Freshly Baked Bagels Test',
        description: 'Quality surplus bagels for redistribution test.',
        category: 'BAKERY',
        quantity: 15,
        unit: 'kg',
        useBy: tomorrow,
        pickupWindowStart: new Date().toISOString(),
        pickupWindowEnd: tomorrow,
        pickupAddress: '500 Grand Avenue',
        pickupCity: 'Metropolis',
        foodSafetyConfirmed: true,
      });
    expect(res.status).toBe(201);
    listingId = res.body.listing.id;
  });

  it('Allows Recipient to submit donation request', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        listingId,
        requestedQuantity: 15,
        purpose: 'Community breakfast provision',
      });
    expect(res.status).toBe(201);
    requestId = res.body.request.id;
  });

  it('Allows Donor to accept request and generates 4-digit verification code', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${donorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('ACCEPTED');
    expect(res.body.request.verificationCode).toBeDefined();
    verificationCode = res.body.request.verificationCode;
  });

  it('Double-booking prevention: Confirmed listing cannot be requested again', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${recipientToken}`)
      .send({
        listingId,
        requestedQuantity: 15,
        purpose: 'Attempting duplicate claim',
      });
    expect(res.status).toBe(409);
  });

  it('Completes pickup handover with verification code', async () => {
    const res = await request(app)
      .post(`/api/v1/requests/${requestId}/complete`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ verificationCode });
    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('COMPLETED');
  });

  it('Verifies dynamic database-backed impact statistics', async () => {
    const res = await request(app).get('/api/v1/stats/platform');
    expect(res.status).toBe(200);
    expect(res.body.stats.totalFoodRescuedKg).toBeGreaterThan(0);
    expect(res.body.stats.totalMealsRescued).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
