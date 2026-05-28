// Stub notification service. In production this would hit an email/Slack
// integration. For the sample repo we just collect them in memory.

export interface Notification {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
}

const sent: Notification[] = [];

export function sendNotification(n: Omit<Notification, 'sentAt'>): Notification {
  const record = { ...n, sentAt: new Date() };
  sent.push(record);
  return record;
}

export function recentNotifications(): Notification[] {
  return sent.slice(-50);
}

export function _resetForTests(): void {
  sent.length = 0;
}
