import { Resend } from "resend";
import { site } from "@/config/site";
import { capitalize, formatLongDate, formatNok } from "./dates";
import { buildCardsPdf } from "./pdf";
import type { Order } from "./orders";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(order: Order): string {
  const rows = order.cards
    .map(
      (c) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e3ebe6;font-size:16px;color:#0a1f1d;">${esc(capitalize(formatLongDate(c.date)))}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e3ebe6;font-size:16px;color:#0a1f1d;text-align:right;font-family:monospace;letter-spacing:1px;">${c.code}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="nb"><body style="margin:0;background:#f7f4ec;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ec;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#123c36;padding:28px 32px;">
          <div style="font-size:26px;font-weight:800;letter-spacing:2px;color:#ffffff;">BROMMELAND</div>
          <div style="font-size:14px;color:#a8e6d6;margin-top:4px;">Fiskekort &middot; Suldalslågen</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#0a1f1d;">Takk for bestillingen, ${esc(order.holder)}!</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#2f4a45;">
            Fiskekortet ditt ligger som PDF vedlagt denne e-posten. Skriv det ut eller ha det klart på mobilen, og vis det ved kontroll.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
            <tr><td style="font-size:11px;letter-spacing:1px;color:#6a7a77;padding-bottom:4px;">DATO</td>
                <td style="font-size:11px;letter-spacing:1px;color:#6a7a77;text-align:right;padding-bottom:4px;">KORTKODE</td></tr>
            ${rows}
          </table>
          <p style="margin:16px 0 0;font-size:15px;color:#0a1f1d;"><strong>Totalt betalt: ${formatNok(order.amountNok)}</strong></p>

          <h2 style="margin:28px 0 8px;font-size:16px;color:#0a1f1d;">Slik kommer du deg dit</h2>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#2f4a45;">
            Kjør mot Grov og sving inn mot Juvåsen Ressurssenter. Sving til høyre og kjør utover kanten langs jordet til du er på parkeringsplassen. Følg nettinggjerdet til du kommer til stien.
            <a href="${site.url}/veibeskrivelse" style="color:#0f7f69;">Se full veibeskrivelse</a>.
          </p>

          <h2 style="margin:24px 0 8px;font-size:16px;color:#0a1f1d;">Husk</h2>
          <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;color:#2f4a45;">
            <li>Fisk fra nordsiden av elva, motfiske mot Hiim.</li>
            <li>Nedre grense er hølen ved gapahuken. Øvre grense er skiltet «Brommeland Øvre».</li>
            <li>Rapporter all fangst.</li>
          </ul>
          <p style="margin:24px 0 0;font-size:13px;color:#6a7a77;">
            Spørsmål? Svar på denne e-posten eller skriv til <a href="mailto:${site.contact.email}" style="color:#0f7f69;">${site.contact.email}</a>.
          </p>
        </td></tr>
      </table>
      <p style="font-size:12px;color:#8a9894;margin:16px 0 0;">${site.name} &middot; ${site.url.replace(/^https?:\/\//, "")}</p>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendOrderEmail(order: Order): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY er ikke satt");
    console.warn("[mail] RESEND_API_KEY mangler. E-post for", order.id, "ble ikke sendt (kun utvikling).");
    return;
  }
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("MAIL_FROM er ikke satt");

  const pdf = await buildCardsPdf(order);
  const resend = new Resend(key);
  const bcc = process.env.ORDER_NOTIFY_EMAIL?.trim();

  const { error } = await resend.emails.send({
    from,
    to: order.email,
    ...(bcc ? { bcc } : {}),
    replyTo: site.contact.email,
    subject: `Fiskekort Brommeland – ${order.cards.length === 1 ? capitalize(formatLongDate(order.cards[0].date)) : `${order.cards.length} kort`}`,
    html: html(order),
    attachments: [{ filename: "fiskekort-brommeland.pdf", content: Buffer.from(pdf) }],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
