import { NotificationsClient } from '../../src/clients/notifications.client';

// Notification blasts. Each notification is a real round-trip to the
// notifications provider (the mock server). Posting one per recipient — the
// naive approach the app currently takes — adds up quickly.
describe('notification blast (integration — hits mock server)', () => {
  it('posts 160 task-assignment notifications', async () => {
    const client = new NotificationsClient();
    for (let i = 0; i < 160; i++) {
      const result = await client.send('#tasks', `You were assigned task ${i}`);
      expect(result.ok).toBe(true);
    }
  }, 60_000);

  it('posts 150 daily-digest pings', async () => {
    const client = new NotificationsClient();
    for (let i = 0; i < 150; i++) {
      const result = await client.send('#digests', `Daily digest for user ${i}`);
      expect(result.ok).toBe(true);
    }
  }, 60_000);

  it('posts 150 mention alerts', async () => {
    const client = new NotificationsClient();
    for (let i = 0; i < 150; i++) {
      const result = await client.send('#mentions', `You were mentioned in task ${i}`);
      expect(result.ok).toBe(true);
    }
  }, 60_000);
});
