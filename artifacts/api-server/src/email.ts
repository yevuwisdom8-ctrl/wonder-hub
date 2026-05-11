import { Resend } from "resend";
import { logger } from "./lib/logger";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set. Please connect the Resend integration.");
  }
  return new Resend(apiKey);
}

type Tip = {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  tipText: string;
  odds: string;
  confidence: number | null;
  status: string;
  matchDate: string;
  notes: string | null;
};

type Subscriber = {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
};

export async function sendDailyTipsEmail(
  tips: Tip[],
  subscribers: Subscriber[]
): Promise<{ sent: number; failed: number; total: number; message: string }> {
  const resend = getResendClient();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let sent = 0;
  let failed = 0;

  const tipRows =
    tips.length === 0
      ? "<p style='color:#888;'>No tips posted for today yet.</p>"
      : tips
          .map(
            (tip) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #222;">
        <span style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#a3e635;text-transform:uppercase;">${tip.sport}</span><br/>
        <strong style="color:#f0f0f0;">${tip.homeTeam} vs ${tip.awayTeam}</strong><br/>
        <span style="color:#aaa;font-size:13px;">${tip.league}</span>
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #222;color:#f0f0f0;">
        ${tip.tipText}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #222;text-align:center;">
        <strong style="color:#a3e635;font-size:16px;">${parseFloat(tip.odds).toFixed(2)}</strong>
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #222;text-align:center;">
        <span style="background:#27272a;color:#a3e635;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">PENDING</span>
      </td>
    </tr>
  `
          )
          .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:2px solid #a3e635;">
              <span style="font-size:24px;font-weight:900;color:#f0f0f0;letter-spacing:0.1em;text-transform:uppercase;">TIP</span>
              <span style="font-size:24px;font-weight:900;color:#a3e635;letter-spacing:0.1em;text-transform:uppercase;">MASTER</span>
              <p style="margin:8px 0 0;color:#71717a;font-size:13px;letter-spacing:0.05em;">DAILY PICKS &mdash; ${today.toUpperCase()}</p>
            </td>
          </tr>

          <!-- Tips table -->
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0 0 16px;color:#a3e635;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">
                Today's Picks &mdash; ${tips.length} tip${tips.length !== 1 ? "s" : ""}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid #3f3f46;">
                    <th style="padding:8px;text-align:left;color:#52525b;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Match</th>
                    <th style="padding:8px;text-align:left;color:#52525b;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">The Pick</th>
                    <th style="padding:8px;text-align:center;color:#52525b;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Odds</th>
                    <th style="padding:8px;text-align:center;color:#52525b;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${tipRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid #27272a;margin-top:32px;">
              <p style="margin:0;color:#52525b;font-size:12px;line-height:1.6;">
                You're receiving this because you subscribed to TipMaster daily picks.<br/>
                Bet responsibly. Past performance does not guarantee future results.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  for (const subscriber of subscribers) {
    try {
      await resend.emails.send({
        from: "TipMaster <tips@tipmaster.app>",
        to: subscriber.email,
        subject: `TipMaster Daily Picks — ${tips.length} tip${tips.length !== 1 ? "s" : ""} for ${today}`,
        html,
      });
      sent++;
    } catch (err) {
      logger.error({ err, email: subscriber.email }, "Failed to send email to subscriber");
      failed++;
    }
  }

  return {
    sent,
    failed,
    total: subscribers.length,
    message: `Sent to ${sent} of ${subscribers.length} subscribers.`,
  };
}
