# SendGrid Email Setup Instructions

## Issue
SendGrid requires verified sender identities to send emails. The error message indicates:
"The from address does not match a verified Sender Identity"

## Solution Steps

### Step 1: Verify Your Sender Email Address
1. Go to https://app.sendgrid.com/settings/sender_auth
2. Click "Create New Sender"
3. Fill in your details:
   - **From Name**: BLACKSEA BARBER
   - **From Email**: Use your actual email (e.g., info@yourdomain.com or your personal Gmail)
   - **Reply To**: Same as above
   - **Company Address**: ул. Поп Харитон 35, 9000 Варна, Bulgaria
   - **City**: Варна
   - **State**: Варна
   - **Zip**: 9000
   - **Country**: Bulgaria

4. Click "Create" and verify the email address by clicking the link sent to your email

### Step 2: Update the Email Service
Once you have a verified sender email, I'll update the email service to use it.

### Alternative: Use Your Personal Email
If you don't have a business email, you can:
1. Use your personal Gmail/Yahoo/Outlook email
2. Verify it in SendGrid
3. The emails will appear to come from your personal email but with "BLACKSEA BARBER" as the name

### Test Email
After verification, we can test the email system by making a booking.