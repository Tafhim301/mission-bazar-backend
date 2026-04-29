import PDFDocument from "pdfkit";
import AppError from "../errorHandlers/appError";
import { StatusCodes } from "http-status-codes";

export interface IInvoiceData {
  transactionId: string;
  orderDate: Date;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: { name: string; quantity: number; price: number }[];
  itemsTotal: number;
  shippingCharge: number;
  totalAmount: number;
}

export const generateInvoicePdf = async (data: IInvoiceData): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const W = 595 - 100; // usable width

      // === Header ==============================================================
      doc
        .fontSize(22)
        .fillColor("#1a1a2e")
        .text("MISSION BAZAR", { align: "center" })
        .fontSize(10)
        .fillColor("#555")
        .text("Your Trusted Online Marketplace", { align: "center" })
        .moveDown(0.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor("#e0e0e0")
        .lineWidth(1)
        .stroke()
        .moveDown(0.8);

      // === Invoice Meta ========================================================
      doc.fontSize(18).fillColor("#1a1a2e").text("INVOICE", { align: "center" }).moveDown(0.5);

      const metaY = doc.y;
      doc.fontSize(10).fillColor("#333");
      doc.text(`Transaction ID:  ${data.transactionId}`, 50, metaY);
      doc.text(`Order Date:       ${new Date(data.orderDate).toLocaleDateString("en-BD")}`, 50, doc.y + 2);
      doc.moveDown(1);

      // === Customer Info ========================================================
      doc
        .fontSize(11)
        .fillColor("#1a1a2e")
        .text("BILL TO:", 50)
        .fontSize(10)
        .fillColor("#333")
        .text(data.customerName)
        .text(data.customerPhone)
        .text(data.shippingAddress)
        .moveDown(1);

      // === Items Table =========================================================
      doc
        .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#1a1a2e").lineWidth(1).stroke();

      const tableTop = doc.y + 8;
      doc.fontSize(10).fillColor("#fff");

      // Header row background
      doc.rect(50, tableTop - 4, W, 18).fill("#1a1a2e");
      doc
        .fillColor("#fff")
        .text("Item", 55, tableTop, { width: 260 })
        .text("Qty", 315, tableTop, { width: 60, align: "center" })
        .text("Unit Price", 375, tableTop, { width: 80, align: "right" })
        .text("Subtotal", 455, tableTop, { width: 85, align: "right" });

      let rowY = tableTop + 22;
      doc.fillColor("#333");

      data.items.forEach((item, i) => {
        const rowBg = i % 2 === 0 ? "#f9f9f9" : "#fff";
        doc.rect(50, rowY - 4, W, 18).fill(rowBg);
        doc
          .fillColor("#333")
          .fontSize(10)
          .text(item.name, 55, rowY, { width: 260 })
          .text(String(item.quantity), 315, rowY, { width: 60, align: "center" })
          .text(`৳${item.price.toFixed(2)}`, 375, rowY, { width: 80, align: "right" })
          .text(`৳${(item.price * item.quantity).toFixed(2)}`, 455, rowY, { width: 85, align: "right" });
        rowY += 22;
      });

      doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#e0e0e0").lineWidth(1).stroke();
      rowY += 10;

      // === Totals ==============================================================
      const col1 = 375;
      const col2 = 455;
      const totalWidth = 85;

      doc.fontSize(10).fillColor("#333");
      doc.text("Items Total:", col1, rowY, { width: 75, align: "right" })
         .text(`৳${data.itemsTotal.toFixed(2)}`, col2, rowY, { width: totalWidth, align: "right" });
      rowY += 18;
      doc.text("Shipping:", col1, rowY, { width: 75, align: "right" })
         .text(`৳${data.shippingCharge.toFixed(2)}`, col2, rowY, { width: totalWidth, align: "right" });
      rowY += 6;

      doc.moveTo(col2, rowY).lineTo(545, rowY).strokeColor("#333").lineWidth(1).stroke();
      rowY += 8;

      doc.fontSize(12).fillColor("#1a1a2e")
         .text("TOTAL:", col1, rowY, { width: 75, align: "right" })
         .text(`৳${data.totalAmount.toFixed(2)}`, col2, rowY, { width: totalWidth, align: "right" });

      // === Footer ==============================================================
      doc.moveDown(3);
      doc
        .moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e0e0e0").lineWidth(1).stroke()
        .moveDown(0.5)
        .fontSize(9)
        .fillColor("#888")
        .text("Thank you for shopping with Mission Bazar!", { align: "center" })
        .text("For support: support@missionbazar.com", { align: "center" });

      doc.end();
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, `PDF generation failed: ${msg}`);
  }
};
