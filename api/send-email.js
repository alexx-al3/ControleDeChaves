// ══════════════════════════════════════════════════════
// ACRC Imóveis — Email API (Nodemailer via Vercel Functions)
// Variáveis de ambiente no Vercel:
//   GMAIL_USER  →  chavesacrc@gmail.com
//   GMAIL_PASS  →  senha-de-app-sem-espaços
//   EMAIL_DEST  →  cadastro@acrcimoveis.com.br
// ══════════════════════════════════════════════════════

const nodemailer = require("nodemailer");

export default async function handler(req, res) {
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

  // Remove espaços da senha de app (Google exibe com espaços mas usa sem)
  const gmailUser = (process.env.GMAIL_USER || "").trim();
  const gmailPass = (process.env.GMAIL_PASS || "").replace(/\s/g, "");
  const emailDest = (process.env.EMAIL_DEST || gmailUser).trim();

  console.log("[EMAIL] De:", gmailUser, "Para:", emailDest, "Assunto:", subject);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
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
    console.log("[EMAIL OK] MessageId:", info.messageId);
    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("[EMAIL ERROR]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
