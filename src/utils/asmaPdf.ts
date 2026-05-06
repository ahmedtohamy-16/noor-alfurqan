import { jsPDF } from "jspdf";
import type { AsmaName } from "@/data/asmaUlHusna";

const toAr = (n: number) => n.toString().split("").map((d) => "٠١٢٣٤٥٦٧٨٩"[+d] ?? d).join("");

export async function exportAsmaListPdf(list: AsmaName[]) {
  // Build an offscreen HTML element and rasterize via html2canvas, then embed in PDF
  const html2canvas = (await import("html2canvas")).default;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; left: -10000px; top: 0; width: 794px;
    background: #fff; color: #1f2937; padding: 32px;
    font-family: 'Amiri', 'Noto Naskh Arabic', serif; direction: rtl;
  `;
  container.innerHTML = `
    <div style="text-align:center; margin-bottom:24px; border-bottom:2px solid #047857; padding-bottom:16px;">
      <h1 style="font-size:32px; color:#047857; margin:0 0 6px;">أسماء الله الحسنى</h1>
      <p style="font-size:14px; color:#6b7280; margin:0;">
        ولله الأسماء الحسنى فادعوه بها · ${toAr(list.length)} اسم
      </p>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
      ${list
        .map(
          (n) => `
        <div style="border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#f9fafb;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; color:#6b7280;">${n.transliteration}</span>
            <span style="background:#047857; color:#fff; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; font-size:11px;">
              ${toAr(n.number)}
            </span>
          </div>
          <div style="font-size:24px; color:#047857; font-weight:700; margin-bottom:6px;">${n.name}</div>
          <div style="font-size:12px; line-height:1.6; color:#374151;">${n.meaning}</div>
        </div>`
        )
        .join("")}
    </div>
    <div style="text-align:center; margin-top:32px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:11px; color:#9ca3af;">
      نور الفرقان · Noor Al-Furqan
    </div>
  `;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * pageW) / canvas.width;

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    let position = 0;
    let heightLeft = imgH;

    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
    pdf.save("asma-ul-husna-noor-alfurqan.pdf");
  } finally {
    document.body.removeChild(container);
  }
}
