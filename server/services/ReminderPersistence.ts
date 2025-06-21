import { db } from '../db';
import { sql } from 'drizzle-orm';

export class ReminderPersistence {
  
  // Save user reminder to database
  static async saveReminder(userSession: string, raffleId: number): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO user_raffle_reminders (user_session, raffle_id) 
        VALUES (${userSession}, ${raffleId}) 
        ON CONFLICT (user_session, raffle_id) DO NOTHING
      `);
      console.log(`💾 Saved reminder for session ${userSession}, raffle ${raffleId}`);
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  }

  // Remove user reminder from database
  static async removeReminder(userSession: string, raffleId: number): Promise<void> {
    try {
      await db.execute(sql`
        DELETE FROM user_raffle_reminders 
        WHERE user_session = ${userSession} AND raffle_id = ${raffleId}
      `);
      console.log(`🗑️ Removed reminder for session ${userSession}, raffle ${raffleId}`);
    } catch (error) {
      console.error('Error removing reminder:', error);
    }
  }

  // Get all reminders for a user session
  static async getUserReminders(userSession: string): Promise<number[]> {
    try {
      const result = await db.execute(sql`
        SELECT raffle_id FROM user_raffle_reminders 
        WHERE user_session = ${userSession}
      `);
      return result.map((row: any) => row.raffle_id);
    } catch (error) {
      console.error('Error getting user reminders:', error);
      return [];
    }
  }

  // Get all users interested in a specific raffle
  static async getRaffleInterestedUsers(raffleId: number): Promise<string[]> {
    try {
      const result = await db.execute(sql`
        SELECT DISTINCT user_session FROM user_raffle_reminders 
        WHERE raffle_id = ${raffleId}
      `);
      return result.map((row: any) => row.user_session);
    } catch (error) {
      console.error('Error getting raffle interested users:', error);
      return [];
    }
  }

  // Cleanup reminders for deactivated raffles
  static async cleanupRaffleReminders(raffleId: number): Promise<void> {
    try {
      await db.execute(sql`
        DELETE FROM user_raffle_reminders 
        WHERE raffle_id = ${raffleId}
      `);
      console.log(`🧹 Cleaned up reminders for raffle ${raffleId}`);
    } catch (error) {
      console.error('Error cleaning up reminders:', error);
    }
  }
}