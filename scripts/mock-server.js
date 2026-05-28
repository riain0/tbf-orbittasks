/**
 * Mock HTTP server for OrbitTasks integration tests.
 *
 * This stands in for the various external services OrbitTasks would talk
 * to in production:
 *   - Billing provider (Stripe-style)
 *   - Email service (SendGrid-style)
 *   - Notification service (Slack-style)
 *   - Search index (Algolia-style)
 *   - Webhook delivery
 *
 * Slowness here is INTENTIONAL but REAL. Every endpoint inserts a small
 * deterministic delay so the HTTP round-trip dominates the test runtime.
 * That mirrors how real external APIs behave: they're never instant.
 *
 * Why this matters for the curriculum: students will identify in Session 2
 * that integration tests are slow, and in Session 5 they'll learn to mock
 * these calls properly using Jest's manual mocks. The fix isn't "make this
 * mock server faster" — it's "don't use the mock server at all in unit
 * tests; mock the SDK module instead."
 */

const express = require('express');
const http = require('http');

const PORT = Number(process.env.MOCK_SERVER_PORT || 4567);

// Latency profile (milliseconds). Tuned so that integration tests have
// realistic per-call costs without being absurd.
const LATENCY = {
  fast: 80,     // cheap calls (token validation, etc.)
  medium: 280,  // typical external API
  slow: 650,    // heavy computation on the external side
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function app() {
  const a = express();
  a.use(express.json({ limit: '1mb' }));

  // Health
  a.get('/health', async (_req, res) => {
    await delay(LATENCY.fast);
    res.json({ status: 'ok' });
  });

  // ---------- Billing (Stripe-style) ----------
  a.post('/billing/customers', async (req, res) => {
    await delay(LATENCY.medium);
    res.status(201).json({
      id: `cus_${Math.random().toString(36).slice(2, 14)}`,
      email: req.body.email,
      created: Date.now(),
    });
  });

  a.get('/billing/customers/:id', async (req, res) => {
    await delay(LATENCY.medium);
    res.json({
      id: req.params.id,
      email: 'test@example.com',
      created: Date.now() - 86400000,
      subscriptionStatus: 'active',
    });
  });

  a.post('/billing/charges', async (_req, res) => {
    await delay(LATENCY.slow);
    res.status(201).json({
      id: `ch_${Math.random().toString(36).slice(2, 14)}`,
      amount: 999,
      currency: 'usd',
      status: 'succeeded',
    });
  });

  // ---------- Email (SendGrid-style) ----------
  a.post('/email/send', async (req, res) => {
    await delay(LATENCY.medium);
    res.status(202).json({
      messageId: `msg_${Date.now()}`,
      to: req.body.to,
      accepted: true,
    });
  });

  // ---------- Notifications (Slack-style) ----------
  a.post('/notify', async (req, res) => {
    await delay(LATENCY.medium);
    res.status(200).json({
      ok: true,
      channel: req.body.channel || '#general',
      ts: String(Date.now() / 1000),
    });
  });

  // ---------- Search (Algolia-style) ----------
  a.post('/search/index/:index', async (req, res) => {
    await delay(LATENCY.medium);
    res.json({
      taskID: Math.floor(Math.random() * 1_000_000),
      objectIDs: (req.body.objects || []).map((o) => String(o.id || Math.random())),
    });
  });

  a.get('/search/query', async (req, res) => {
    await delay(LATENCY.medium);
    const q = String(req.query.q || '');
    res.json({
      hits: q
        ? [
            { objectID: '1', title: `Result matching "${q}"`, _highlightResult: {} },
            { objectID: '2', title: `Another match for "${q}"`, _highlightResult: {} },
          ]
        : [],
      nbHits: q ? 2 : 0,
      processingTimeMS: 12,
    });
  });

  // ---------- Webhooks ----------
  a.post('/webhooks/deliver', async (req, res) => {
    await delay(LATENCY.slow);
    res.status(200).json({
      delivered: true,
      url: req.body.url,
      attempts: 1,
    });
  });

  // ---------- Audit log sink ----------
  a.post('/audit/log', async (req, res) => {
    await delay(LATENCY.fast);
    res.status(202).json({ accepted: true, count: (req.body.events || []).length });
  });

  // 404 with delay so misses are noticeable
  a.use(async (_req, res) => {
    await delay(LATENCY.fast);
    res.status(404).json({ error: 'not found' });
  });

  return a;
}

function start() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app());
    server.listen(PORT, (err) => {
      if (err) return reject(err);
      // eslint-disable-next-line no-console
      console.log(`[mock-server] listening on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

module.exports = { app, start, PORT, LATENCY };

// If run directly, start and stay up until killed.
if (require.main === module) {
  start().then((server) => {
    process.on('SIGTERM', () => server.close());
    process.on('SIGINT', () => server.close());
  });
}
