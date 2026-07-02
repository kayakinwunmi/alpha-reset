// Branded HTML email template — matches the site's paper/ink/rust aesthetic.
// Every outgoing email (welcome, drips, broadcasts) is wrapped by renderEmail
// so the whole experience feels like one product.

import { SITE_URL } from "./event";

const PAPER = "#F5F0E8";
const CARD = "#FFFDF8";
const INK = "#2C2418";
const INK_LIGHT = "#5C5040";
const INK_FAINT = "#8A7E6E";
const ACCENT = "#8B4513";
const RULE = "#D4C8B0";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(escaped: string): string {
  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" style="color:${ACCENT};text-decoration:underline;">$1</a>`
  );
}

/**
 * Convert a plain-text email body (the format the drip sequence and admin
 * broadcasts are written in) into simple, well-spaced HTML. Blank lines
 * separate paragraphs; lines within a paragraph become <br> breaks, which
 * keeps hand-written lists ("- item", "1. item") intact.
 */
export function textToHtml(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) => {
      const html = linkify(escapeHtml(para)).replace(/\n/g, "<br>");
      return `<p style="margin:0 0 18px;font-size:17px;line-height:1.65;color:${INK_LIGHT};">${html}</p>`;
    })
    .join("\n");
}

export interface RenderEmailOptions {
  /** Hidden preview text shown next to the subject in inboxes. */
  preheader?: string;
  /** Already-safe HTML for the body (use textToHtml for plain text). */
  contentHtml: string;
  /** Optional call-to-action button. */
  cta?: { label: string; url: string };
}

export function renderEmail({ preheader, contentHtml, cta }: RenderEmailOptions): string {
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : "";

  const ctaHtml = cta
    ? `<div style="text-align:center;margin:30px 0 8px;">
        <a href="${cta.url}" style="display:inline-block;background-color:${ACCENT};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:14px 34px;text-decoration:none;">${escapeHtml(cta.label)}</a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alpha Reset</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};">
  ${preheaderHtml}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <a href="${SITE_URL}" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:5px;color:${INK};text-decoration:none;">ALPHA&nbsp;RESET</a>
              <div style="width:48px;height:1px;background-color:${ACCENT};margin:14px auto 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="background-color:${CARD};border:1px solid ${RULE};padding:36px 32px;font-family:Georgia,'Times New Roman',serif;">
              ${contentHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 24px 0;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 10px;font-size:15px;font-style:italic;color:${INK_FAINT};">&ldquo;Discipline is doing what you hate like you love it.&rdquo;</p>
              <p style="margin:0 0 16px;font-size:13px;color:${INK_FAINT};">— Mike Tyson</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${INK_FAINT};">
                You're receiving this because you signed up at <a href="${SITE_URL}" style="color:${INK_FAINT};">alphareset.co</a>.<br>
                The Field Guide is always here: <a href="${SITE_URL}/guide" style="color:${ACCENT};">alphareset.co/guide</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
