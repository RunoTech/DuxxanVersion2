import { db } from '../db';
import { upcomingRaffles, upcomingRaffleInterests, users, raffles } from '../../shared/schema';
import { eq, and, lte } from 'drizzle-orm';
import { emailService } from './EmailService';
import { ReminderPersistence } from './ReminderPersistence';
import { InternalMailService } from './InternalMailService';

class RaffleScheduler {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🕐 Raffle scheduler started - checking every minute');
    
    // Check immediately on start
    this.checkUpcomingRaffles();
    
    // Then check every 10 seconds for testing
    this.checkInterval = setInterval(() => {
      this.checkUpcomingRaffles();
    }, 10000); // 10 seconds
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Raffle scheduler stopped');
  }

  private async checkUpcomingRaffles() {
    try {
      const now = new Date();
      
      // Find upcoming raffles that should now be active
      const rafflesToActivate = await db
        .select({
          id: upcomingRaffles.id,
          title: upcomingRaffles.title,
          description: upcomingRaffles.description,
          prizeValue: upcomingRaffles.prizeValue,
          ticketPrice: upcomingRaffles.ticketPrice,
          maxTickets: upcomingRaffles.maxTickets,
          startDate: upcomingRaffles.startDate,
          categoryId: upcomingRaffles.categoryId,
          creatorId: upcomingRaffles.creatorId,
          interestedCount: upcomingRaffles.interestedCount
        })
        .from(upcomingRaffles)
        .where(
          and(
            eq(upcomingRaffles.isActive, true),
            lte(upcomingRaffles.startDate, now)
          )
        );

      if (rafflesToActivate.length === 0) {
        return; // No raffles to activate
      }

      console.log(`📢 Found ${rafflesToActivate.length} raffles to activate`);

      for (const upcomingRaffle of rafflesToActivate) {
        await this.activateRaffle(upcomingRaffle);
      }
    } catch (error) {
      console.error('Error checking upcoming raffles:', error);
    }
  }

  private async activateRaffle(upcomingRaffle: any) {
    try {
      // Calculate end date (24 hours from start)
      const endDate = new Date(upcomingRaffle.startDate);
      endDate.setHours(endDate.getHours() + 24);

      // Create the actual raffle
      const [newRaffle] = await db
        .insert(raffles)
        .values({
          title: upcomingRaffle.title,
          description: upcomingRaffle.description,
          prizeValue: upcomingRaffle.prizeValue,
          ticketPrice: upcomingRaffle.ticketPrice,
          maxTickets: upcomingRaffle.maxTickets,
          endDate: endDate,
          categoryId: upcomingRaffle.categoryId,
          creatorId: upcomingRaffle.creatorId,
          isActive: true,
          ticketsSold: 0
        })
        .returning({ id: raffles.id });

      // Get all interested users for this upcoming raffle
      const interestedUsers = await ReminderPersistence.getRaffleInterestedUsers(upcomingRaffle.id);
      console.log(`Found ${interestedUsers.length} interested users for raffle ${upcomingRaffle.id}`);

      // Send internal mail notifications to interested users
      if (interestedUsers.length > 0) {
        const subject = `🎉 ${upcomingRaffle.title} Çekilişi Başladı!`;
        const body = `
Merhaba,

İlgilendiğiniz "${upcomingRaffle.title}" çekilişi artık aktif!

📋 Çekiliş Detayları:
💰 Ödül: ${upcomingRaffle.prizeValue} USDT
🎫 Bilet Fiyatı: ${upcomingRaffle.ticketPrice} USDT
🎯 Maksimum Bilet: ${upcomingRaffle.maxTickets}

Şimdi bilet satın alabilir ve kazanma şansınızı yakalayabilirsiniz!

İyi şanslar!
DUXXAN Ekibi
        `;

        await InternalMailService.sendBulkMail(interestedUsers, subject, body);
        console.log(`✉️ Sent ${interestedUsers.length} internal mail notifications for raffle: ${upcomingRaffle.title}`);
      }

      // Deactivate the upcoming raffle
      await db
        .update(upcomingRaffles)
        .set({ isActive: false })
        .where(eq(upcomingRaffles.id, upcomingRaffle.id));

      console.log(`🎉 Activated raffle: "${upcomingRaffle.title}" (ID: ${newRaffle.id})`);
      console.log(`📊 Notified ${interestedUsers.length} interested users`);

    } catch (error) {
      console.error(`Error activating raffle "${upcomingRaffle.title}":`, error);
    }
  }
}

export const raffleScheduler = new RaffleScheduler();