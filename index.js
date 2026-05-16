const express = require("express");
const bodyParser = require("body-parser");
const { QRBill } = require("swissqr");

const app = express();
app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  try {
    const d = req.body;

    // 🔥 Swiss QR BILL (SIX compliant)
    const bill = new QRBill({
      currency: "CHF",
      amount: Number(d.amount),

      creditor: {
        account: d.iban.replace(/\s/g, ""),
        name: d.creditorName,
        address: d.street,
        zip: d.zip,
        city: d.city,
        country: "CH",
      },

      debtor: {
        name: d.debtorName || "",
      },

      reference: d.reference || "NON",
      message: d.message || "Juniorencamp 2026",
    });

    // QR + PDF generieren
    const pdfBuffer = await bill.toPDF();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=swissqr.pdf",
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("QR ERROR:", err);
    res.status(500).send(err.message);
  }
});

app.get("/", (req, res) => {
  res.send("FCE Swiss QR API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Swiss QR API running on port", PORT);
});
