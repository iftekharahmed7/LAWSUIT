/**
 * Sends email via Resend's API (HTTPS, port 443) rather than SMTP. Render's
 * free tier blocks outbound traffic on SMTP ports 25/465/587 entirely, so a
 * Gmail+Nodemailer setup that works locally just hangs forever once
 * deployed there. A plain HTTPS API call isn't affected.
 *
 * Setup: sign up free at resend.com (email verification only, no phone
 * step), then Settings -> API Keys -> Create API Key. Set RESEND_API_KEY
 * in your environment.
 *
 * IMPORTANT LIMITATION: without verifying your own domain (needs DNS
 * access we don't have for this project), Resend's free tier only allows
 * sending TO the email address you signed up to Resend with - not to
 * arbitrary recipients. Fine for demoing the feature works end-to-end;
 * not yet suitable for real strangers requesting a reset.
 */

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set - skipping send. Would have sent:', { to, subject });
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'LawSuite <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('[email] Resend API error:', response.status, detail);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[email] Failed to send:', error.message);
    return false;
  }
}

module.exports = { sendEmail };
