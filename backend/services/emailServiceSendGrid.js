const sgMail = require('@sendgrid/mail');

// Configure SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Verify configuration on startup
if (process.env.SENDGRID_API_KEY) {
  console.log('✅ SendGrid email service configured');
} else {
  console.warn('⚠️  SendGrid API key not found in environment variables');
}

const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject: 'Verify your Bharakt account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Welcome to Bharakt!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send verification email to:', email);
    console.error('Error details:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};

const sendSignupTokenEmail = async (email, token, type) => {
  try {
    const signupUrl = `${process.env.FRONTEND_URL}/register/${type}/${token}`;
    const typeLabel = type === 'ngo' ? 'NGO' : 'Blood Bank';

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject: `Bharakt - ${typeLabel} Registration Invitation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Bharakt ${typeLabel} Registration</h2>
          <p>You have been invited to register your ${typeLabel} on Bharakt.</p>
          <p>Click the button below to complete your registration:</p>
          <a href="${signupUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Register Now</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666;">${signupUrl}</p>
          <p><strong>Important:</strong> This link can only be used once and will expire in 7 days.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">This invitation was sent by a Bharakt administrator.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Signup token email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send signup token email to:', email);
    console.error('Error details:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};

const sendBloodRequestAlert = async (email, request) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject: `Urgent: Blood Request for ${request.blood_group}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🩸 Urgent Blood Request</h2>
          <p>Someone nearby needs blood urgently!</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Blood Group:</strong> ${request.blood_group}</p>
            <p><strong>Units Needed:</strong> ${request.units_needed}</p>
            <p><strong>Location:</strong> ${request.address}</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Request</a>
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">You received this alert because you are within 35km of the request location.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Blood request alert sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send blood request alert to:', email);
    console.error('Error details:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Request - Bharakt',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🩸 Bharakt</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>We received a request to reset your password for your Bharakt account. Click the button below to create a new password:</p>
              <center>
                <a href="${resetURL}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetURL}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The Bharakt Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Bharakt. Saving lives, one donation at a time.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log('✅ Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email to:', email);
    console.error('Error details:', error.response?.body || error.message);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send appointment booking notification to blood bank
 */
const sendAppointmentBookingEmail = async (email, appointmentDetails) => {
  const { bankName, userName, userEmail, userPhone, bloodGroup, appointmentDate, appointmentTime, notes } = appointmentDetails;
  
  const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    subject: `New Appointment Booking - ${userName}`,
    text: `New appointment booking at ${bankName}.\n\nDonor: ${userName}\nEmail: ${userEmail}\nPhone: ${userPhone || 'Not provided'}\nBlood Group: ${bloodGroup}\nDate: ${formattedDate}\nTime: ${appointmentTime}\nNotes: ${notes || 'None'}\n\nPlease log in to your dashboard to confirm this appointment.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #dc2626; margin: 0; font-size: 24px;">🩸 New Appointment Booking</h1>
        </div>
        
        <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #475569; margin: 0 0 16px;">You have received a new blood donation appointment request at <strong>${bankName}</strong>.</p>
          
          <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="color: #dc2626; margin: 0 0 12px; font-size: 14px; text-transform: uppercase;">Donor Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #64748b;">Name:</td><td style="padding: 4px 0; color: #1e293b; font-weight: 500;">${userName}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Email:</td><td style="padding: 4px 0; color: #1e293b;">${userEmail}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Phone:</td><td style="padding: 4px 0; color: #1e293b;">${userPhone || 'Not provided'}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Blood Group:</td><td style="padding: 4px 0; color: #dc2626; font-weight: bold; font-size: 18px;">${bloodGroup}</td></tr>
            </table>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <h3 style="color: #1e293b; margin: 0 0 12px; font-size: 14px; text-transform: uppercase;">Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #64748b;">Date:</td><td style="padding: 4px 0; color: #1e293b; font-weight: 500;">${formattedDate}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Time:</td><td style="padding: 4px 0; color: #1e293b; font-weight: 500;">${appointmentTime}</td></tr>
              ${notes ? `<tr><td style="padding: 4px 0; color: #64748b;">Notes:</td><td style="padding: 4px 0; color: #1e293b;">${notes}</td></tr>` : ''}
            </table>
          </div>
          
          <p style="color: #64748b; margin: 16px 0 0; font-size: 14px;">
            Please log in to your Blood Bank dashboard to confirm or manage this appointment.
          </p>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated message from BloodLink.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Appointment booking email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send appointment booking email to:', email);
    console.error('Error details:', error.response?.body || error.message);
    throw new Error('Failed to send appointment booking email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendSignupTokenEmail,
  sendBloodRequestAlert,
  sendPasswordResetEmail,
  sendAppointmentBookingEmail,
};

