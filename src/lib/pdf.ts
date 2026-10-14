import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import { site } from "@/config/site";
import { capitalize, formatLongDate } from "./dates";
import type { Card, Order } from "./orders";

const INK = rgb(0.039, 0.122, 0.114);
const FOREST = rgb(0.071, 0.235, 0.212);
const WATER = rgb(0.098, 0.647, 0.541);
const TIMBER = rgb(0.788, 0.541, 0.294);
const MUTED = rgb(0.38, 0.45, 0.43);
const PAPER = rgb(0.969, 0.957, 0.925);

/** Standardfontene støtter bare WinAnsi. Bytt ut tegn de ikke kan tegne, i stedet for å krasje. */
function makeSafe(font: PDFFont) {
  const set = new Set(font.getCharacterSet());
  return (text: string) =>
    Array.from(text)
      .map((ch) => {
        if (set.has(ch.codePointAt(0)!)) return ch;
        const base = ch.normalize("NFD")[0];
        return set.has(base.codePointAt(0)!) ? base : "?";
      })
      .join("");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const RULES = [
  "Kortet gjelder kun på datoen som er oppgitt, og kun for den som er oppført.",
  "Fisk fra nordsiden av elva, motfiske mot Hiim.",
  "Nedre grense er hølen ved gapahuken. Øvre grense er skiltet «Brommeland Øvre». Fiske ovenfor skiltet er ikke tillatt.",
  "Husk å rapportere all fangst.",
  "Ha med dette kortet (utskrift eller på mobil) og vis det ved kontroll.",
];

async function drawCard(
  pdf: PDFDocument,
  fonts: { regular: PDFFont; bold: PDFFont },
  card: Card,
  order: Order,
) {
  const page: PDFPage = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const safe = makeSafe(fonts.regular);
  const margin = 48;

  page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });

  // Topp
  page.drawRectangle({ x: 0, y: height - 190, width, height: 190, color: FOREST });
  page.drawRectangle({ x: 0, y: height - 196, width, height: 6, color: WATER });
  page.drawText("BROMMELAND", {
    x: margin,
    y: height - 92,
    size: 40,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Fiskekort  |  Suldalslågen", {
    x: margin,
    y: height - 122,
    size: 14,
    font: fonts.regular,
    color: rgb(0.78, 0.93, 0.88),
  });
  page.drawText(safe(site.url.replace(/^https?:\/\//, "")), {
    x: margin,
    y: height - 160,
    size: 11,
    font: fonts.regular,
    color: rgb(0.6, 0.8, 0.75),
  });

  // Tittel og dato
  let y = height - 250;
  page.drawText("DØGNKORT", { x: margin, y, size: 13, font: fonts.bold, color: TIMBER });
  y -= 44;
  const dateText = safe(capitalize(formatLongDate(card.date)));
  page.drawText(dateText, { x: margin, y, size: 28, font: fonts.bold, color: INK });
  y -= 24;
  page.drawText("Gyldig fra kl. 00:00 til kl. 24:00 denne dagen", {
    x: margin,
    y,
    size: 11,
    font: fonts.regular,
    color: MUTED,
  });

  // Felter
  y -= 56;
  const field = (label: string, value: string, fy: number) => {
    page.drawText(label.toUpperCase(), { x: margin, y: fy, size: 9, font: fonts.bold, color: MUTED });
    page.drawText(safe(value), { x: margin, y: fy - 20, size: 16, font: fonts.regular, color: INK });
  };
  field("Fisker", card.holder, y);
  field("Kortkode", card.code, y - 62);
  field("Utstedt", capitalize(formatLongDate(card.issuedAt.slice(0, 10))), y - 124);
  field("Bestilling", order.id.slice(-10).toUpperCase(), y - 186);

  // QR
  const qrUrl = `${site.url}/kontroll/${card.code}`;
  const png = await QRCode.toBuffer(qrUrl, {
    margin: 1,
    width: 360,
    color: { dark: "#0a1f1d", light: "#ffffff" },
  });
  const qr = await pdf.embedPng(png);
  const qrSize = 170;
  const qrX = width - margin - qrSize;
  const qrY = y - 186;
  page.drawRectangle({
    x: qrX - 10,
    y: qrY - 10,
    width: qrSize + 20,
    height: qrSize + 20,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.89, 0.87),
    borderWidth: 1,
  });
  page.drawImage(qr, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText("Skann for å kontrollere kortet", {
    x: qrX - 10,
    y: qrY - 28,
    size: 9,
    font: fonts.regular,
    color: MUTED,
  });

  // Regler
  let ry = 250;
  page.drawLine({
    start: { x: margin, y: ry + 24 },
    end: { x: width - margin, y: ry + 24 },
    thickness: 1,
    color: rgb(0.85, 0.89, 0.87),
  });
  page.drawText("REGLER OG GRENSER", { x: margin, y: ry, size: 10, font: fonts.bold, color: TIMBER });
  ry -= 20;
  for (const rule of RULES) {
    const lines = wrap(safe(rule), fonts.regular, 11, width - margin * 2 - 16);
    page.drawCircle({ x: margin + 3, y: ry + 4, size: 2, color: WATER });
    for (const line of lines) {
      page.drawText(line, { x: margin + 16, y: ry, size: 11, font: fonts.regular, color: INK });
      ry -= 15;
    }
    ry -= 5;
  }

  page.drawText(safe(`Spørsmål? ${site.contact.email}`), {
    x: margin,
    y: 40,
    size: 10,
    font: fonts.regular,
    color: MUTED,
  });
}

export async function buildCardsPdf(order: Order): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Fiskekort Brommeland`);
  pdf.setAuthor("Brommeland");
  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };
  for (const card of order.cards) {
    await drawCard(pdf, fonts, card, order);
  }
  return pdf.save();
}
