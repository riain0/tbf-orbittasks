import { EmailClient, SendEmail } from '../clients/email.client';

export class EmailService {
  constructor(private readonly client: EmailClient = new EmailClient()) {}

  async welcome(to: string, name: string): Promise<string> {
    const receipt = await this.client.send({
      to,
      subject: 'Welcome to OrbitTasks',
      body: `Hi ${name}, thanks for signing up. Get started by creating your first project.`,
    });
    return receipt.messageId;
  }

  async passwordReset(to: string, link: string): Promise<string> {
    const receipt = await this.client.send({
      to,
      subject: 'Password reset',
      body: `Click here to reset your password: ${link}`,
    });
    return receipt.messageId;
  }

  async digest(to: string, summary: { taskCount: number; completedCount: number }): Promise<string> {
    const receipt = await this.client.send({
      to,
      subject: 'Your OrbitTasks digest',
      body: `You have ${summary.taskCount} open tasks. ${summary.completedCount} completed this week.`,
    });
    return receipt.messageId;
  }

  async bulkInvite(emails: string[], inviterName: string): Promise<number> {
    const messages: SendEmail[] = emails.map((to) => ({
      to,
      subject: `${inviterName} invited you to OrbitTasks`,
      body: `${inviterName} invited you. Click to accept.`,
    }));
    const results = await this.client.sendBatch(messages);
    return results.filter((r) => r.accepted).length;
  }
}
