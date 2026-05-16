const express = require("express");
const bodyParser = require("body-parser");
const { QRBill } = require("swiss-qrbill");

const app = express();
app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  try {
    const d = req.body;

    const bill = new QRBill({
      currency: "CHF",
      amount: d.amount,

      creditor: {
        account: d.iban,
        name: d.creditorName,
        address: d.street,
        zip: d.zip,
        city: d.city,
        country: "CH",
      },

      debtor: {
        name: d.debtorName,
      },

      reference: d.reference || "NON",
      message: d.message || "",
    });

    const pdf = await bill.toPDF();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=qrbill.pdf",
    });

    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Swiss QR API running");
});
