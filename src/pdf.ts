import { jsPDF } from "jspdf";

/** Export plain text (AI answers, filled documents) as a tidy A4 PDF. */
export function exportTextToPdf(title: string, body: string, filename = "lawsuite.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text(doc.splitTextToSize(title, width), margin, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`LawSuite · generated ${new Date().toLocaleDateString()}`, margin, y);
  y += 20;
  doc.setDrawColor(190);
  doc.line(margin, y, margin + width, y);
  y += 22;

  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  const clean = body.replace(/[#*_`]/g, "");
  for (const line of doc.splitTextToSize(clean, width) as string[]) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 16;
  }

  if (y > pageHeight - margin - 40) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.text(
    doc.splitTextToSize(
      "General legal information only, not legal advice. Consult a qualified lawyer about your situation.",
      width,
    ),
    margin,
    y + 24,
  );

  doc.save(filename);
}

export function slugifyFilename(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "document"
  );
}
