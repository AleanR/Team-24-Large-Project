import { createTransport } from "nodemailer";
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

const getEmailAuth = () => ({
  user: process.env.USER_EMAIL || process.env.EMAIL_USER,
  pass: process.env.USER_PASS || process.env.EMAIL_PASS,
});

export const sendPassResetToken = async (userEmail: string, url: string) => {
const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: getEmailAuth(),
} as any);
try {
  await transporter.sendMail({
    from: process.env.USER_EMAIL,
    to: userEmail,
    subject: "Password Reset Token",
    html: `<p>Please click on this <a href="${url}">here</a> to reset your password. This link is valid for 15 minutes.</p>`,
  });
  } catch (err) {
  console.error("Email send failed:", err);
}
}

export const sendSupportEmail = async (
    fromName: string,
    fromEmail: string,
    subject: string,
    message: string,
) => {
    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: getEmailAuth(),
    });

    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: 'cadmus.fl@gmail.com',
        replyTo: fromEmail,
        subject: `[NitroPicks Support] ${subject}`,
        html: `
            <h2>Support Request</h2>
            <p><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr/>
            <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
    });
};

export const sendEmailVerifOTP = async (userEmail: string, url: string) => {
const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: getEmailAuth(),
} as any);

try {
  await transporter.sendMail({
    from: process.env.USER_EMAIL,
    to: userEmail,
    subject: "Email Verification OTP",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your account:</p>
      <a href="${url}">Verify</a>
    `,
  });
} catch (err) {
  console.error("Verification email failed:", err);
}
}