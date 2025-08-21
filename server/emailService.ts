import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set - emails will be logged instead of sent");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  servicePrice: string;
  barberName: string;
  appointmentDate: Date;
  notes?: string;
}

export async function sendBookingConfirmationEmail(bookingData: BookingEmailData): Promise<boolean> {
  try {
    // If no SendGrid API key, just log the email (for development)
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 [EMAIL SIMULATION] Booking confirmation email would be sent to:', bookingData.customerEmail);
      console.log('📧 Subject: Потвърждение за резервация');
      console.log('📧 Customer:', bookingData.customerName);
      console.log('📧 Service:', bookingData.serviceName);
      console.log('📧 Date:', bookingData.appointmentDate);
      return true;
    }
    const { customerName, customerEmail, serviceName, servicePrice, barberName, appointmentDate, notes } = bookingData;
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('bg-BG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('bg-BG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="bg">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Потвърждение за резервация - BLACKSEA BARBER</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #C3A873 0%, #B27A4F 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2F483F;
          }
          .booking-details {
            background-color: #E9E1D3;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            border-left: 5px solid #C3A873;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #C3A873;
          }
          .detail-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #2F483F;
            font-size: 16px;
          }
          .detail-value {
            color: #555;
            font-size: 16px;
            text-align: right;
          }
          .important-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #B27A4F;
          }
          .contact-info {
            background-color: #2F483F;
            color: white;
            padding: 25px;
            text-align: center;
            margin-top: 30px;
          }
          .contact-info h3 {
            margin: 0 0 15px 0;
            color: #C3A873;
          }
          .contact-item {
            margin: 8px 0;
            font-size: 14px;
          }
          .footer {
            background-color: #111111;
            color: #C3A873;
            padding: 20px;
            text-align: center;
            font-size: 14px;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 10px;
            }
            .header, .content {
              padding: 20px;
            }
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
            }
            .detail-value {
              text-align: left;
              margin-top: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BLACKSEA BARBER</h1>
            <p>Професионален фризьорски салон във Варна</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Здравейте, ${customerName}!
            </div>
            
            <p>Благодарим Ви за избора на BLACKSEA BARBER! Вашата резервация е потвърдена успешно.</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">📅 Дата:</span>
                <span class="detail-value">${formatDate(appointmentDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Час:</span>
                <span class="detail-value">${formatTime(appointmentDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Услуга:</span>
                <span class="detail-value">${serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">💰 Цена:</span>
                <span class="detail-value">${servicePrice} лв</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👨‍💼 Майстор:</span>
                <span class="detail-value">${barberName}</span>
              </div>
              ${notes ? `
              <div class="detail-row">
                <span class="detail-label">📝 Бележки:</span>
                <span class="detail-value">${notes}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="important-info">
              <h4 style="margin: 0 0 10px 0; color: #B27A4F;">❗ Важна информация:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Моля, пристигнете 5 минути преди часа</li>
                <li>При невъзможност за явяване, моля уведомете ни поне 2 часа предварително</li>
                <li>Ще получите SMS напомняне 24 часа преди срещата</li>
                <li>Плащането се извършва на място в брой или с карта</li>
              </ul>
            </div>
            
            <p>Очакваме Ви с нетърпение и се надяваме да останете доволни от нашите услуги!</p>
          </div>
          
          <div class="contact-info">
            <h3>Контакти за връзка</h3>
            <div class="contact-item">📍 ул. Поп Харитон 35, 9000 Варна</div>
            <div class="contact-item">📞 +359 888 123 456</div>
            <div class="contact-item">✉️ info@blackseabarber.bg</div>
            <div class="contact-item">🕐 Пн-Сб: 09:00-19:00, Нд: почивен ден</div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 BLACKSEA BARBER. Всички права запазени.</p>
            <p>Професионални фризьорски услуги във Варна</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
BLACKSEA BARBER - Потвърждение за резервация

Здравейте, ${customerName}!

Благодарим Ви за избора на BLACKSEA BARBER! Вашата резервация е потвърдена успешно.

ДЕТАЙЛИ ЗА РЕЗЕРВАЦИЯТА:
• Дата: ${formatDate(appointmentDate)}
• Час: ${formatTime(appointmentDate)}
• Услуга: ${serviceName}
• Цена: ${servicePrice} лв
• Майстор: ${barberName}
${notes ? `• Бележки: ${notes}` : ''}

ВАЖНА ИНФОРМАЦИЯ:
• Моля, пристигнете 5 минути преди часа
• При невъзможност за явяване, моля уведомете ни поне 2 часа предварително
• Ще получите SMS напомняне 24 часа преди срещата
• Плащането се извършва на място в брой или с карта

КОНТАКТИ:
📍 ул. Поп Харитон 35, 9000 Варна
📞 +359 888 123 456
✉️ info@blackseabarber.bg
🕐 Пн-Сб: 09:00-19:00, Нд: почивен ден

Очакваме Ви с нетърпение!

BLACKSEA BARBER
Професионални фризьорски услуги във Варна
    `;

    await mailService.send({
      to: customerEmail,
      from: {
        email: 'test@example.com', // Default SendGrid test sender - will work in sandbox mode
        name: 'BLACKSEA BARBER'
      },
      subject: `Потвърждение за резервация - ${formatDate(appointmentDate)} в ${formatTime(appointmentDate)}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`Booking confirmation email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendOwnerNotificationEmail(bookingData: BookingEmailData): Promise<boolean> {
  try {
    // If no SendGrid API key, just log the email (for development)
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 [EMAIL SIMULATION] Owner notification email would be sent');
      console.log('📧 New booking from:', bookingData.customerName);
      console.log('📧 Service:', bookingData.serviceName);
      console.log('📧 Date:', bookingData.appointmentDate);
      return true;
    }
    const { customerName, customerEmail, serviceName, servicePrice, barberName, appointmentDate, notes } = bookingData;
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('bg-BG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('bg-BG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const ownerEmailHtml = `
      <!DOCTYPE html>
      <html lang="bg">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Нова резервация - BLACKSEA BARBER</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #B27A4F 0%, #C3A873 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 30px;
          }
          .booking-details {
            background-color: #E9E1D3;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
            border-left: 5px solid #B27A4F;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #C3A873;
          }
          .detail-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #2F483F;
          }
          .detail-value {
            color: #555;
          }
          .alert {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Нова резервация</h1>
            <p>BLACKSEA BARBER Admin Panel</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>📅 Нова резервация получена!</strong><br>
              Моля проверете детайлите по-долу и потвърдете в админ панела.
            </div>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">👤 Клиент:</span>
                <span class="detail-value">${customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📞 Телефон:</span>
                <span class="detail-value">${bookingData.customerEmail.split('@')[0]}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✉️ Имейл:</span>
                <span class="detail-value">${customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Дата:</span>
                <span class="detail-value">${formatDate(appointmentDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Час:</span>
                <span class="detail-value">${formatTime(appointmentDate)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">✂️ Услуга:</span>
                <span class="detail-value">${serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">💰 Цена:</span>
                <span class="detail-value">${servicePrice} лв</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👨‍💼 Майстор:</span>
                <span class="detail-value">${barberName}</span>
              </div>
              ${notes ? `
              <div class="detail-row">
                <span class="detail-label">📝 Бележки:</span>
                <span class="detail-value">${notes}</span>
              </div>
              ` : ''}
            </div>
            
            <p><strong>Действия:</strong></p>
            <ul>
              <li>Влезте в админ панела за управление на резервацията</li>
              <li>Потвърдете резервацията или я отменете при нужда</li>
              <li>Клиентът вече е получил автоматично потвърждение по имейл</li>
              <li>SMS напомняне ще бъде изпратено автоматично 24ч преди срещата</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;

    await mailService.send({
      to: 'owner@blackseabarber.bg', // Replace with actual owner email
      from: {
        email: 'test@example.com', // Default SendGrid test sender - will work in sandbox mode
        name: 'BLACKSEA BARBER System'
      },
      subject: `🔔 Нова резервация: ${customerName} - ${formatDate(appointmentDate)} ${formatTime(appointmentDate)}`,
      html: ownerEmailHtml,
    });

    console.log('Owner notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Owner notification email error:', error);
    return false;
  }
}