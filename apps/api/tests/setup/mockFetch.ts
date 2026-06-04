// W5 step 3: mock the external SDK clients so tests stop making real HTTP.
//
// Every SDK client (billing, email, notifications, search, webhooks, audit)
// routes through HttpClient, which calls the global `fetch`. Rather than
// hand-maintain six separate manual mocks, we stub `fetch` once with an
// in-process responder that mirrors scripts/mock-server.js exactly — same
// routes, same response shapes — but with zero latency and zero sockets.
//
// Because the shapes match the mock server byte-for-byte, every assertion
// that passed against the real round-trip still passes. The only thing that
// changes is the ~12-minute `test:api` wall-clock: it collapses to seconds.
//
// This is the seam Workshop 3 set up (constructor-injectable clients) being
// cashed in. Live in the workshop you may instead inject per-client mocks
// into individual tests; this file is the deterministic reference end-state.

let seq = 0;
function id(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq.toString().padStart(12, '0')}`;
}

interface FakeResponse {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
  text(): Promise<string>;
}

function reply(status: number, data: unknown): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

type JsonBody = Record<string, unknown>;

function route(
  method: string,
  path: string,
  query: URLSearchParams,
  body: JsonBody,
): FakeResponse {
  // ---------- Billing (Stripe-style) ----------
  if (method === 'POST' && path === '/billing/customers') {
    return reply(201, { id: id('cus'), email: body.email, created: 0 });
  }
  if (method === 'GET' && /^\/billing\/customers\/[^/]+$/.test(path)) {
    const cid = path.split('/').pop()!;
    return reply(200, {
      id: cid,
      email: 'test@example.com',
      created: 0,
      subscriptionStatus: 'active',
    });
  }
  if (method === 'POST' && path === '/billing/charges') {
    return reply(201, { id: id('ch'), amount: 999, currency: 'usd', status: 'succeeded' });
  }

  // ---------- Email (SendGrid-style) ----------
  if (method === 'POST' && path === '/email/send') {
    return reply(202, { messageId: id('msg'), to: body.to, accepted: true });
  }

  // ---------- Notifications (Slack-style) ----------
  if (method === 'POST' && path === '/notify') {
    return reply(200, { ok: true, channel: body.channel || '#general', ts: '0' });
  }

  // ---------- Search (Algolia-style) ----------
  if (method === 'POST' && /^\/search\/index\/[^/]+$/.test(path)) {
    const objects = (body.objects as Array<{ id?: unknown }>) || [];
    return reply(200, {
      taskID: 1,
      objectIDs: objects.map((o) => String(o.id ?? '')),
    });
  }
  if (method === 'GET' && path === '/search/query') {
    const q = String(query.get('q') || '');
    return reply(200, {
      hits: q
        ? [
            { objectID: '1', title: `Result matching "${q}"`, _highlightResult: {} },
            { objectID: '2', title: `Another match for "${q}"`, _highlightResult: {} },
          ]
        : [],
      nbHits: q ? 2 : 0,
      processingTimeMS: 12,
    });
  }

  // ---------- Webhooks ----------
  if (method === 'POST' && path === '/webhooks/deliver') {
    return reply(200, { delivered: true, url: body.url, attempts: 1 });
  }

  // ---------- Audit log sink ----------
  if (method === 'POST' && path === '/audit/log') {
    const events = (body.events as unknown[]) || [];
    return reply(202, { accepted: true, count: events.length });
  }

  // ---------- Health ----------
  if (method === 'GET' && path === '/health') {
    return reply(200, { status: 'ok' });
  }

  return reply(404, { error: 'not found' });
}

(globalThis as unknown as { fetch: unknown }).fetch = async (
  input: unknown,
  init?: { method?: string; body?: unknown },
): Promise<FakeResponse> => {
  const url = new URL(String(input));
  const method = (init?.method ?? 'GET').toUpperCase();
  let body: JsonBody = {};
  if (init?.body !== undefined && init?.body !== null) {
    try {
      body = JSON.parse(String(init.body));
    } catch {
      body = {};
    }
  }
  return route(method, url.pathname, url.searchParams, body);
};
