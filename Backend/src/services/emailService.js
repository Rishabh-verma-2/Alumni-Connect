import nodemailer from 'nodemailer';

const createTransporter = () => {
  console.log('Creating email transporter with:', {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'
  });
  
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendBroadcastEmail = async (recipients, subject, message) => {
  try {
    console.log('Attempting to send emails to:', recipients.length, 'recipients');
    console.log('Recipients:', recipients.map(r => ({ name: r.name, email: r.email })));
    
    const transporter = createTransporter();
    
    const emailPromises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Alumni Connect - Broadcast Message</h2>
            <p>Dear ${recipient.name},</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from Alumni Connect Admin.
            </p>
          </div>
        `
      };
      
      console.log(`Sending email to ${recipient.email}...`);
      try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipient.email}:`, result.messageId);
        return { success: true, recipient: recipient.email };
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error.message);
        return { success: false, recipient: recipient.email, error: error.message };
      }
    });
    
    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    const failed = results.filter(result => 
      result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
    ).length;
    
    console.log(`Email sending completed: ${successful} successful, ${failed} failed`);
    
    return {
      success: true,
      sent: successful,
      failed: failed,
      total: recipients.length
    };
    
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};