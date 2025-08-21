import cron from 'node-cron';
import { SmsService } from './smsService';

export function initializeCronJobs() {
  console.log('Initializing SMS reminder cron jobs...');

  // Run every day at 10:00 AM to send appointment reminders for tomorrow
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily SMS reminder check...');
    try {
      await SmsService.processReminderNotifications();
    } catch (error) {
      console.error('Error in SMS reminder cron job:', error);
    }
  });

  // Also run every 30 minutes during business hours (9 AM - 6 PM) as backup
  cron.schedule('*/30 9-18 * * *', async () => {
    try {
      await SmsService.processReminderNotifications();
    } catch (error) {
      console.error('Error in backup SMS reminder cron job:', error);
    }
  });

  console.log('SMS reminder cron jobs initialized successfully');
}