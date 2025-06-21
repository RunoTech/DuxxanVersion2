import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface InternalMail {
  id: number;
  user_session: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: Date;
}

export class InternalMailService {
  
  // Send internal mail to user session
  static async sendMail(userSession: string, subject: string, body: string): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO internal_mails (user_session, subject, body, is_read, created_at) 
        VALUES (${userSession}, ${subject}, ${body}, false, NOW())
      `);
      console.log(`📧 Internal mail sent to ${userSession}: ${subject}`);
    } catch (error) {
      console.error('Error sending internal mail:', error);
    }
  }

  // Send bulk mail to multiple user sessions
  static async sendBulkMail(userSessions: string[], subject: string, body: string): Promise<void> {
    try {
      for (const session of userSessions) {
        await this.sendMail(session, subject, body);
      }
      console.log(`📧 Bulk mail sent to ${userSessions.length} users: ${subject}`);
    } catch (error) {
      console.error('Error sending bulk mail:', error);
    }
  }

  // Get user's inbox
  static async getUserInbox(userSession: string): Promise<InternalMail[]> {
    try {
      const result = await db.execute(sql`
        SELECT id, user_session, subject, body, is_read, created_at 
        FROM internal_mails 
        WHERE user_session = ${userSession} 
        ORDER BY created_at DESC
      `);
      return result.rows || [];
    } catch (error) {
      console.error('Error getting user inbox:', error);
      return [];
    }
  }

  // Get unread count
  static async getUnreadCount(userSession: string): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM internal_mails 
        WHERE user_session = ${userSession} AND is_read = false
      `);
      return result.rows ? Number(result.rows[0]?.count || 0) : 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Mark mail as read
  static async markAsRead(mailId: number): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE internal_mails SET is_read = true WHERE id = ${mailId}
      `);
    } catch (error) {
      console.error('Error marking mail as read:', error);
    }
  }
}