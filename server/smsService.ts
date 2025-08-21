import twilio from 'twilio';
import { db } from './db';
import { bookings, smsNotifications, services, barbers } from '@shared/schema';
import { eq, and, isNull, lt, gte } from 'drizzle-orm';
import type { InsertSmsNotification } from '@shared/schema';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER!;

export class SmsService {
  /**
   * Send SMS reminder for upcoming appointment
   */
  static async sendAppointmentReminder(bookingId: number): Promise<boolean> {
    try {
      // Get booking details with service and barber info
      const [booking] = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          appointmentDate: bookings.appointmentDate,
          serviceName: services.nameBg,
          servicePrice: services.price,
          barberName: barbers.name,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .where(eq(bookings.id, bookingId));

      if (!booking) {
        console.error(`Booking not found: ${bookingId}`);
        return false;
      }

      const appointmentTime = new Date(booking.appointmentDate);
      const formattedDate = appointmentTime.toLocaleDateString('bg-BG');
      const formattedTime = appointmentTime.toLocaleTimeString('bg-BG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Create Bulgarian reminder message
      const message = `Здравейте ${booking.customerName}! 

Напомняме ви за вашия час в BLACKSEA BARBER утре в ${formattedTime}.

📅 Дата: ${formattedDate}
✂️ Услуга: ${booking.serviceName}
👨‍💼 Майстор: ${booking.barberName}
💰 Цена: ${booking.servicePrice} лв

📍 Адрес: ул. Поп Харитон 35, 9000 Варна

За промени се обадете на 052 123 456.

BLACKSEA BARBER - Вашият стил, нашата страст!`;

      // Send SMS via Twilio
      const smsResponse = await client.messages.create({
        body: message,
        from: FROM_PHONE,
        to: booking.customerPhone,
      });

      // Log SMS notification in database
      await db.insert(smsNotifications).values({
        bookingId: booking.id,
        phoneNumber: booking.customerPhone,
        message,
        status: 'sent',
        twilioSid: smsResponse.sid,
        sentAt: new Date(),
        notificationType: 'reminder',
        scheduledFor: null,
      });

      // Update booking reminder status
      await db
        .update(bookings)
        .set({
          reminderSent: true,
          reminderSentAt: new Date(),
        })
        .where(eq(bookings.id, bookingId));

      console.log(`SMS reminder sent successfully for booking ${bookingId}`);
      return true;

    } catch (error) {
      console.error(`Failed to send SMS reminder for booking ${bookingId}:`, error);
      
      // Log failed notification
      try {
        await db.insert(smsNotifications).values({
          bookingId,
          phoneNumber: '',
          message: '',
          status: 'failed',
          twilioSid: null,
          sentAt: null,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          notificationType: 'reminder',
          scheduledFor: null,
        });
      } catch (logError) {
        console.error('Failed to log SMS error:', logError);
      }

      return false;
    }
  }

  /**
   * Send booking notification SMS to owner
   */
  static async sendOwnerNotification(bookingId: number): Promise<boolean> {
    try {
      // Owner's phone number - this should be in environment variable
      const OWNER_PHONE = process.env.OWNER_PHONE || '+359888000000';
      
      const [booking] = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          customerEmail: bookings.customerEmail,
          appointmentDate: bookings.appointmentDate,
          serviceName: services.nameBg,
          servicePrice: services.price,
          barberName: barbers.name,
          notes: bookings.notes,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .where(eq(bookings.id, bookingId));

      if (!booking) return false;

      const appointmentTime = new Date(booking.appointmentDate);
      const formattedDate = appointmentTime.toLocaleDateString('bg-BG');
      const formattedTime = appointmentTime.toLocaleTimeString('bg-BG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const message = `🆕 НОВА РЕЗЕРВАЦИЯ - BLACKSEA BARBER

👤 Клиент: ${booking.customerName}
📞 Телефон: ${booking.customerPhone}
📧 Email: ${booking.customerEmail}

📅 Дата: ${formattedDate}
🕐 Час: ${formattedTime}
✂️ Услуга: ${booking.serviceName}
👨‍💼 Майстор: ${booking.barberName}
💰 Цена: ${booking.servicePrice} лв

${booking.notes ? `📝 Бележки: ${booking.notes}` : ''}

Резервация #${booking.id}`;

      const smsResponse = await client.messages.create({
        body: message,
        from: FROM_PHONE,
        to: OWNER_PHONE,
      });

      await db.insert(smsNotifications).values({
        bookingId: booking.id,
        phoneNumber: OWNER_PHONE,
        message,
        status: 'sent',
        twilioSid: smsResponse.sid,
        sentAt: new Date(),
        notificationType: 'owner_notification',
        scheduledFor: null,
      });

      return true;
    } catch (error) {
      console.error(`Failed to send owner notification for booking ${bookingId}:`, error);
      
      // Log failed attempt
      try {
        await db.insert(smsNotifications).values({
          bookingId,
          phoneNumber: process.env.OWNER_PHONE || '+359888000000',
          message: '',
          status: 'failed',
          twilioSid: null,
          sentAt: null,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          notificationType: 'owner_notification',
          scheduledFor: null,
        });
      } catch (logError) {
        console.error('Failed to log owner notification error:', logError);
      }
      
      return false;
    }
  }

  /**
   * Send booking confirmation SMS
   */
  static async sendBookingConfirmation(bookingId: number): Promise<boolean> {
    try {
      const [booking] = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          appointmentDate: bookings.appointmentDate,
          serviceName: services.nameBg,
          servicePrice: services.price,
          barberName: barbers.name,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .where(eq(bookings.id, bookingId));

      if (!booking) return false;

      const appointmentTime = new Date(booking.appointmentDate);
      const formattedDate = appointmentTime.toLocaleDateString('bg-BG');
      const formattedTime = appointmentTime.toLocaleTimeString('bg-BG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const message = `Благодарим ви, ${booking.customerName}! 

Вашата резервация в BLACKSEA BARBER е потвърдена! ✅

📅 Дата: ${formattedDate}
🕐 Час: ${formattedTime}
✂️ Услуга: ${booking.serviceName}
👨‍💼 Майстор: ${booking.barberName}
💰 Цена: ${booking.servicePrice} лв

📍 Адрес: ул. Поп Харитон 35, 9000 Варна

За промени се обадете на 052 123 456.

BLACKSEA BARBER - Вашият стил, нашата страст!`;

      const smsResponse = await client.messages.create({
        body: message,
        from: FROM_PHONE,
        to: booking.customerPhone,
      });

      await db.insert(smsNotifications).values({
        bookingId: booking.id,
        phoneNumber: booking.customerPhone,
        message,
        status: 'sent',
        twilioSid: smsResponse.sid,
        sentAt: new Date(),
        notificationType: 'confirmation',
        scheduledFor: null,
      });

      return true;
    } catch (error) {
      console.error(`Failed to send booking confirmation for ${bookingId}:`, error);
      return false;
    }
  }

  /**
   * Get bookings that need reminder SMS (24 hours before appointment)
   */
  static async getBookingsNeedingReminders(): Promise<number[]> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const bookingsNeedingReminders = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.status, 'confirmed'),
            eq(bookings.reminderSent, false),
            // Appointment is tomorrow
            gte(bookings.appointmentDate, tomorrow),
            lt(bookings.appointmentDate, dayAfterTomorrow)
          )
        );

      return bookingsNeedingReminders.map(b => b.id);
    } catch (error) {
      console.error('Failed to get bookings needing reminders:', error);
      return [];
    }
  }

  /**
   * Process all pending reminder notifications
   */
  static async processReminderNotifications(): Promise<void> {
    const bookingIds = await this.getBookingsNeedingReminders();
    
    if (bookingIds.length === 0) {
      console.log('No bookings need reminders at this time');
      return;
    }

    console.log(`Processing ${bookingIds.length} reminder notifications...`);

    for (const bookingId of bookingIds) {
      await this.sendAppointmentReminder(bookingId);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Finished processing reminder notifications');
  }
}