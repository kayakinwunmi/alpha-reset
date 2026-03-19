import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string
) {
  const { error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Alpha Reset <noreply@alphareset.com>",
    to: email,
    subject: "Welcome to Alpha Reset 🦾",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;color:#ededed;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:800;color:#D4AF37;margin:0;letter-spacing:2px;">ALPHA RESET</h1>
    </div>

    <div style="background-color:#141414;border:1px solid #222;border-radius:12px;padding:32px 24px;margin-bottom:24px;">
      <p style="font-size:18px;margin:0 0 16px;color:#fff;">Welcome ${firstName},</p>
      <p style="font-size:16px;line-height:1.6;color:#ccc;margin:0 0 16px;">
        You're in. You've made the decision to join the top 1%.
      </p>
      <p style="font-size:16px;line-height:1.6;color:#ccc;margin:0 0 24px;">
        The next <strong style="color:#D4AF37;">Alpha Reset</strong> begins <strong style="color:#fff;">8 April 2026</strong> — a 72-hour water fast + deep life review that will transform how you think, move, and lead.
      </p>

      <div style="background-color:#1a1a0a;border-left:3px solid #D4AF37;padding:16px;border-radius:4px;margin-bottom:24px;">
        <p style="font-size:14px;color:#D4AF37;margin:0 0 8px;font-weight:600;">WHAT TO EXPECT:</p>
        <ul style="margin:0;padding-left:20px;color:#ccc;font-size:14px;line-height:1.8;">
          <li>72 hours — water &amp; coffee only</li>
          <li>Daily walks or runs</li>
          <li>Deep prayer &amp; meditation</li>
          <li>Written review of your last 90 days</li>
          <li>Set your direction for the next 90 days</li>
        </ul>
      </div>

      <div style="text-align:center;">
        <a href="https://getbestdayapp.app.link/5SerCVKw60b" style="display:inline-block;background-color:#D4AF37;color:#0a0a0a;font-weight:700;font-size:16px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:1px;">
          JOIN ON BESTDAY
        </a>
      </div>
    </div>

    <p style="text-align:center;font-size:13px;color:#666;margin:0;">
      "Discipline is doing what you hate like you love it." — Mike Tyson
    </p>
  </div>
</body>
</html>
    `.trim(),
  });

  if (error) {
    throw error;
  }
}
