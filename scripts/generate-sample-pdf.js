const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const outputPath = path.join(__dirname, "..", "sample-travel-booking-5day.pdf");
const basePdfPath = path.join(__dirname, "..", "sample-travel-booking.pdf");

const contentLines = [
  "ORBITRA TRAVEL CONFIRMATION",
  "",
  "Trip: Singapore Discovery | 5 Days / 4 Nights",
  "Passenger: Sahaj Paun",
  "Booking Ref: SG-58921",
  "",
  "FLIGHT DETAILS",
  "- Outbound: BOM -> SIN | 10 Jun 2026 | 08:40 | SG 515",
  "- Return: SIN -> BOM | 15 Jun 2026 | 21:10 | SG 516",
  "",
  "HOTEL",
  "- Marina Bay Suites, Singapore",
  "- Check-in: 10 Jun 2026 | Check-out: 15 Jun 2026",
  "- Confirmation: MBS-4321",
  "",
  "DAY-BY-DAY PLAN",
  "Day 1: Arrival, check-in, Marina Bay promenade",
  "Day 2: Gardens by the Bay, Cloud Forest, Clarke Quay",
  "Day 3: Sentosa Island, S.E.A. Aquarium, Siloso beach",
  "Day 4: Chinatown, heritage walk, rooftop dining",
  "Day 5: Orchard Road, final shopping, airport transfer",
  "",
  "NOTES",
  "- Preferred: vegetarian meals",
  "- Pace: relaxed mornings, no late nights before return flight",
  "- Transfers: airport pickup included"
];

function wrapLines(text, maxChars) {
  return text.split("\n").flatMap((line) => {
    if (line.length <= maxChars) {
      return [line];
    }
    const words = line.split(" ");
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) {
      lines.push(current);
    }
    return lines;
  });
}

async function generatePdf() {
  const baseBytes = fs.readFileSync(basePdfPath);
  const pdfDoc = await PDFDocument.load(baseBytes);
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 60;
  let y = 780;

  page.drawText("Orbitra AI Sample Booking", {
    x: margin,
    y,
    size: 20,
    font: titleFont,
    color: rgb(0.05, 0.3, 0.32)
  });

  y -= 32;
  const lines = wrapLines(contentLines.join("\n"), 85);
  lines.forEach((line) => {
    page.drawText(line, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.13, 0.17, 0.2)
    });
    y -= 16;
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Created ${outputPath}`);
}

generatePdf().catch((error) => {
  console.error(error);
  process.exit(1);
});
