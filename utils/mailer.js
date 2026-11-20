const nodemailer = require('nodemailer');

let transporter = null;

// Returns a nodemailer transporter, or null when SMTP isn't configured in .env
function getTransporter() {
    if (transporter) return transporter;
    if (!process.env.SMTP_HOST) return null;

    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
    });
    return transporter;
}

async function sendPasswordResetEmail(to, resetLink) {
    const transport = getTransporter();

    if (!transport) {
        // No email server configured. In development, print the link so the
        // flow can still be tested. Never print it in production.
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SMTP is not configured; cannot send password reset email.');
        }
        console.log('\n[mailer] SMTP not configured, so no email was sent.');
        console.log(`[mailer] Password reset link for ${to}:\n${resetLink}\n`);
        return;
    }

    await transport.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject: 'Reset your ShowCase Gallery password',
        text:
            `We received a request to reset your ShowCase Gallery password.\n\n` +
            `Open this link to choose a new one (valid for 1 hour):\n${resetLink}\n\n` +
            `If you didn't ask for this, you can ignore this email. Your password won't change.`,
        html:
            `<p>We received a request to reset your ShowCase Gallery password.</p>` +
            `<p><a href="${resetLink}">Choose a new password</a> (valid for 1 hour)</p>` +
            `<p style="color:#6b6b8d">If you didn't ask for this, you can ignore this email. ` +
            `Your password won't change.</p>`,
    });
}

module.exports = { sendPasswordResetEmail };
