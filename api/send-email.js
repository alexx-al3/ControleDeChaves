// ACRC Imóveis — Email API (Vercel Serverless Function)
const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.log("[EMAIL SIMULADO] Credenciais não configuradas");
    return res.status(200).json({ ok: true, simulated: true });
  }

  const { subject, html, pdfBase64, pdfName } = req.body;

  const gmailUser = (process.env.GMAIL_USER || "").trim();
  const gmailPass = (process.env.GMAIL_PASS || "").replace(/\s/g, "");
  const emailDest = (process.env.EMAIL_DEST || gmailUser).trim();

  console.log("[EMAIL] De:", gmailUser, "Para:", emailDest);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: gmailUser, pass: gmailPass },
  });

  const mailOptions = {
    from: `"ACRC Imóveis — Controle de Chaves" <${gmailUser}>`,
    to: emailDest,
    subject: subject || "Relatório de Movimentação — ACRC Imóveis",
    html,
    attachments: pdfBase64
      ? [{ filename: pdfName || "comprovante.pdf", content: pdfBase64, encoding: "base64" }]
      : [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[EMAIL OK]", info.messageId);
    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("[EMAIL ERROR]", err.message);
    return res.status(500).json({ error: err.message });
  }
};
