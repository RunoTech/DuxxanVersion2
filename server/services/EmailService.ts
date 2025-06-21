import { MailService } from '@sendgrid/mail';

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private mailService: MailService;
  private fromEmail = 'noreply@duxxan.com';
  
  constructor() {
    this.mailService = new MailService();
    
    // Check if SendGrid API key is available
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    } else {
      console.warn('SENDGRID_API_KEY not found - email functionality will be disabled');
    }
  }

  async sendRaffleStartNotification(userEmail: string, raffleTitle: string, raffleId: number): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`Email simulation: Would send raffle start notification to ${userEmail} for ${raffleTitle}`);
      return true;
    }

    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFC929; text-align: center;">🎉 Çekiliş Başladı!</h2>
          <p>Merhaba,</p>
          <p>İlgilendiğiniz <strong>"${raffleTitle}"</strong> çekilişi artık aktif!</p>
          <p>Şimdi bilet satın alabilir ve kazanma şansınızı yakalayabilirsiniz.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://duxxan.com/raffles/${raffleId}" 
               style="background-color: #FFC929; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Çekilişe Katıl
            </a>
          </div>
          <p>İyi şanslar!</p>
          <p><strong>DUXXAN Ekibi</strong></p>
        </div>
      `;

      await this.mailService.send({
        to: userEmail,
        from: this.fromEmail,
        subject: `🎉 ${raffleTitle} Çekilişi Başladı!`,
        html: htmlContent,
        text: `Merhaba,\n\nİlgilendiğiniz "${raffleTitle}" çekilişi artık aktif! Şimdi bilet satın alabilir ve kazanma şansınızı yakalayabilirsiniz.\n\nDUXXAN Ekibi`
      });

      console.log(`Raffle start notification sent to ${userEmail} for ${raffleTitle}`);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendBulkRaffleStartNotifications(emails: string[], raffleTitle: string, raffleId: number): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`Email simulation: Would send raffle start notifications to ${emails.length} users for ${raffleTitle}`);
      return true;
    }

    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFC929; text-align: center;">🎉 Çekiliş Başladı!</h2>
          <p>Merhaba,</p>
          <p>İlgilendiğiniz <strong>"${raffleTitle}"</strong> çekilişi artık aktif!</p>
          <p>Şimdi bilet satın alabilir ve kazanma şansınızı yakalayabilirsiniz.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://duxxan.com/raffles/${raffleId}" 
               style="background-color: #FFC929; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Çekilişe Katıl
            </a>
          </div>
          <p>İyi şanslar!</p>
          <p><strong>DUXXAN Ekibi</strong></p>
        </div>
      `;

      const emailPromises = emails.map(email => 
        this.mailService.send({
          to: email,
          from: this.fromEmail,
          subject: `🎉 ${raffleTitle} Çekilişi Başladı!`,
          html: htmlContent,
          text: `Merhaba,\n\nİlgilendiğiniz "${raffleTitle}" çekilişi artık aktif! Şimdi bilet satın alabilir ve kazanma şansınızı yakalayabilirsiniz.\n\nDUXXAN Ekibi`
        })
      );

      await Promise.all(emailPromises);
      console.log(`Bulk raffle start notifications sent to ${emails.length} users for ${raffleTitle}`);
      return true;
    } catch (error) {
      console.error('Bulk SendGrid email error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();