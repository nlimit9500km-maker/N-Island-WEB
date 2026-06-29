const nodemailer = require('nodemailer');
const process = require('process');
async function test() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: '1760537268@qq.com', // sending to themselves
      subject: 'Test email from AI Studio script',
      text: 'If this arrives, sending works.'
    });
    console.log('Success:', info.messageId);
  } catch (err) {
    console.error('Failed to send:', err);
  }
}
test();
