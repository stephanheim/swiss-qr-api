const express = require("express");
const bodyParser = require("body-parser");
const QRCode = require("qrcode");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const app = express();
app.use(bodyParser.json());

function buildSwissQR(data) {
  return [
    "SPC",
    "0200",
    "1",
    data.iban,
    "S",
    data.creditorName,
    data.street,
    "",
    data.zip,
    data.city,
    "CH",
    "",
    "",
    "",
    Number(data.amount).toFixed(2),
    "CHF",
    "S",
    data.debtorName,
    "",
    "",
    "",
    "CH",
    "NON",
    data.reference || "",
    data.message || "",
    "EPD",
  ].join("\n");
}

app.post("/generate", async (req, res) => {
  try {
    const d = req.body;

    const qrText = buildSwissQR(d);

    // QR Code erzeugen
    const qrImage = await QRCode.toBuffer(qrText);

    // PDF erzeugen
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const qr = await pdfDoc.embedPng(qrImage);

    const qrDims = qr.scale(1);

    page.drawText("Swiss QR Rechnung", {
      x: 50,
      y: 750,
      size: 18,
      font,
    });

    page.drawText(`Betrag: CHF ${d.amount}`, { x: 50, y: 720, size: 12, font });
    page.drawText(`Name: ${d.debtorName}`, { x: 50, y: 700, size: 12, font });

    page.drawImage(qr, {
      x: 50,
      y: 400,
      width: 200,
      height: 200,
    });

    const pdfBytes = await pdfDoc.save();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=qr.pdf",
    });

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Swiss QR API running on", PORT));
