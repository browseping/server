import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'BrowsePing - Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Email Verification</h2>
        <p>Hello,</p>
        <p>Your verification code for BrowsePing is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #1f2937; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          BrowsePing Team
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'BrowsePing - Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Reset</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">BrowsePing Security</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            We received a request to reset your password for your BrowsePing account. Please use the verification code below to proceed with resetting your password.
          </p>
          
          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px dashed #667eea; padding: 25px; text-align: center; margin: 30px 0; border-radius: 12px;">
            <p style="color: #4a5568; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
            <h1 style="color: #667eea; margin: 0; font-size: 36px; letter-spacing: 6px; font-weight: bold; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>

          <div style="background-color: #fef5e7; border-left: 4px solid #f6ad55; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="color: #744210; margin: 0; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 5 minutes for your security.
            </p>
          </div>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
            Enter this code in the BrowsePing extension to continue with your password reset. If you didn't request this reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>

        <div style="background-color: #1a202c; padding: 25px 30px; text-align: center;">
          <p style="color: #a0aec0; margin: 0 0 15px 0; font-size: 14px;">
            Best regards,<br>
            <strong style="color: #667eea;">BrowsePing Team</strong>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    throw new Error('Failed to send password reset email');
  }
};