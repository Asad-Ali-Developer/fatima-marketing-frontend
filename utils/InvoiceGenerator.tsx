// import { Invoice } from "@/types";
// import { format } from "date-fns";
// import { useRef } from "react";

// interface GenerateInvoicePDFProps {
//   invoice: Invoice;
//   logoUrl?: string;
// }

// export const generateInvoicePDF = ({
//   invoice,
//   logoUrl,
// }: GenerateInvoicePDFProps): void => {
//   const printWindow = window.open("", "_blank");
//   if (!printWindow) return;

//   const formattedDate = format(new Date(invoice.date), "dd MMM yyyy");
//   const createdBy = invoice.created_by?.name || "System";
//   const createdAtFormatted = format(
//     new Date(invoice.createdAt),
//     "dd MMM yyyy HH:mm",
//   );

//   // Generate QR code URL (using quickchart.io - no API key needed)
//   const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(invoice.invoice_number || "NO_INVOICE")}&size=120`;

//   const styles = `
//   <style>
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

//   * {
//     margin: 0;
//     padding: 0;
//     box-sizing: border-box;
//   }

//   body {
//     font-family: 'Inter', sans-serif;
//     background: #fff;
//     color: #1e293b;
//     padding: 40px 20px;
//     font-size: 14px;
//   }

//   .invoice-container {
//     max-width: 820px;
//     margin: auto;
//     background: #fff;
//   }

//   /* ================= HEADER ================= */
//   .header {
//     display: flex;
//     justify-content: space-between;
//     align-items: flex-start;
//     padding-bottom: 25px;
//     border-bottom: 2px solid #f1f5f9;
//   }

//   .logo-section {
//     display: flex;
//     gap: 20px;
//     align-items: center;
//   }

//   .logo-placeholder {
//     width: 90px;
//     height: 90px;
//     background: #00B7E8;
//     color: #fff;
//     border-radius: 10px;
//     font-size: 32px;
//     font-weight: 700;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }

//   .company-info h1 {
//     font-family: 'Playfair Display', serif;
//     font-size: 28px;
//     color: #1a1a2e;
//   }

//   .company-info span {
//     font-size: 12px;
//     letter-spacing: 1px;
//     color: #64748b;
//     text-transform: uppercase;
//   }

//   .invoice-meta {
//     text-align: right;
//   }

//   .invoice-meta h2 {
//     font-size: 34px;
//     color: #00B7E8;
//     letter-spacing: 2px;
//     margin-bottom: 6px;
//   }

//   .meta-row {
//     font-size: 13px;
//     color: #475569;
//     margin-top: 2px;
//   }

//   .meta-row strong {
//     color: #1e293b;
//   }

//   /* ================= BILL TO ================= */
//   .billto-section {
//     padding: 25px 0 15px;
//   }

//   .billto-title {
//     font-size: 12px;
//     letter-spacing: 1px;
//     color: #64748b;
//     font-weight: 600;
//     text-transform: uppercase;
//     margin-bottom: 5px;
//   }

//   .billto-name {
//     font-size: 17px;
//     font-weight: 600;
//     color: #1e293b;
//   }

//   .billto-meta {
//     margin-top: 3px;
//     font-size: 13px;
//     color: #475569;
//   }

//   .billto-remarks {
//     margin-top: 8px;
//     font-size: 13px;
//     font-style: italic;
//     color: #64748b;
//   }

//   /* ================= ITEMS ================= */
//   .items-section {
//     margin-top: 20px;
//   }

//   .items-table {
//     width: 100%;
//     border-collapse: collapse;
//   }

//   .items-table th {
//     background: #f8fafc;
//     padding: 14px;
//     font-size: 12px;
//     text-transform: uppercase;
//     letter-spacing: .5px;
//     color: #475569;
//     border-bottom: 2px solid #e5e7eb;
//     text-align: left;
//   }

//   .items-table td {
//     padding: 15px 14px;
//     border-bottom: 1px solid #f1f5f9;
//     font-size: 14px;
//   }

//   .customer-name {
//     font-weight: 600;
//     margin-bottom: 3px;
//   }

//   .customer-phone {
//     font-size: 13px;
//     color: #64748b;
//   }

//   .type-badge {
//     background: #f0f9ff;
//     border: 1px solid #bae6fd;
//     color: #0284c7;
//     padding: 4px 12px;
//     border-radius: 20px;
//     font-size: 11px;
//     font-weight: 600;
//   }

//   .qty {
//     text-align: center;
//     font-weight: 600;
//   }

//   .amount {
//     text-align: right;
//     font-weight: 700;
//     font-size: 15px;
//   }

//   /* ================= TOTALS ================= */
//   .totals-section {
//     margin-top: 20px;
//     display: flex;
//     justify-content: flex-end;
//   }

//   .totals-table {
//     width: 320px;
//   }

//   .totals-table td {
//     padding: 7px 0;
//     font-size: 14px;
//   }

//   .totals-table .label {
//     color: #64748b;
//     text-align: right;
//   }

//   .totals-table .value {
//     text-align: right;
//     font-weight: 600;
//     color: #1e293b;
//   }

//   .total-row .label {
//     font-weight: 700;
//     color: #1e293b;
//   }

//   .total-row .value {
//     font-size: 18px;
//     color: #00B7E8;
//     font-weight: 700;
//   }

//   /* ================= FROM ================= */
//   .from-section {
//     margin-top: 30px;
//     padding-top: 20px;
//     border-top: 1px solid #e5e7eb;
//     display: flex;
//     justify-content: space-between;
//   }

//   .from-left {
//     font-size: 13px;
//     line-height: 1.6;
//     color: #475569;
//   }

//   .from-left strong {
//     font-size: 14px;
//     color: #1e293b;
//   }

//   .from-right {
//     text-align: right;
//     font-size: 12px;
//     color: #64748b;
//   }

//   /* ================= FOOTER ================= */
//   .footer {
//     margin-top: 25px;
//     padding-top: 15px;
//     border-top: 1px dashed #e5e7eb;
//     display: flex;
//     justify-content: end;
//     align-items: flex-start;
//   }

//   .terms {
//     font-size: 12px;
//     color: #64748b;
//     max-width: 60%;
//   }

//   .terms ul {
//     list-style: none;
//     padding-left: 0;
//   }

//   .terms li {
//     margin-bottom: 4px;
//   }

//   .qr-section {
//     text-align: right;
//     max-width: 35%;
//   }

//   .qr-code {
//     width: 100px;
//     height: 100px;
//     margin: 0 auto;
//   }

//   .qr-label {
//     font-size: 11px;
//     color: #64748b;
//     margin-top: 8px;
//     text-align: center;
//   }

//   .signature-line {
//     margin-top: 20px;
//     width: 170px;
//     border-top: 1px solid #00B7E8;
//     padding-top: 6px;
//     font-size: 12px;
//     color: #00B7E8;
//     text-align: center;
//   }

//   @media print {
//     body {
//       padding: 0;
//     }
//     .qr-code {
//       width: 100px !important;
//       height: 100px !important;
//     }
//   }
//   </style>
//   `;

//   const content = `
//   <html>
//   <head>
//     <title>Invoice #${invoice.invoice_number}</title>
//     ${styles}
//   </head>

//   <body>
//     <div class="invoice-container">
//       <!-- HEADER -->
//       <div class="header">
//         <div class="logo-section">
//           ${
//             logoUrl
//               ? `<img src="${logoUrl}" style="height:90px;border-radius:10px" />
//                  <div class="logo-placeholder" style="display:none">FM</div>`
//               : `<div class="logo-placeholder">FM</div>`
//           }
//           <div class="company-info">
//             <h1>FATIMA MARKETING</h1>
//             <span>Real Estate Solutions</span>
//           </div>
//         </div>

//         <div class="invoice-meta">
//           <h2>INVOICE</h2>
//           <div class="meta-row"><strong>No:</strong> ${invoice.invoice_number || "-"}</div>
//           <div class="meta-row"><strong>Date:</strong> ${formattedDate}</div>
//           <div class="meta-row"><strong>Status:</strong> ${invoice.status.replace("_", " ").toUpperCase()}</div>
//         </div>
//       </div>

//       <!-- BILL TO -->
//       <div class="billto-section">
//         <div class="billto-title">Bill To</div>
//         <div class="billto-name">${invoice.customerName}</div>
//         <div class="billto-meta">${invoice.phoneNumber}<br/>${invoice.location || "Lahore, Punjab"}</div>
//       </div>

//       <!-- ITEMS -->
//       <div class="items-section">
//         <table class="items-table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Customer</th>
//               <th>Property</th>
//               <th>Qty</th>
//               <th>Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>1</td>
//               <td>
//                 <div class="customer-name">${invoice.customerName}</div>
//                 <div class="customer-phone">${invoice.phoneNumber}</div>
//               </td>
//               <td><span class="type-badge">${invoice.property_type || "N/A"}</span></td>
//               <td class="qty">${invoice.quantity || 1}</td>
//               <td class="amount">PKR ${Math.round(invoice.amount).toLocaleString()}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <!-- TOTALS -->
//       <div class="totals-section">
//         <table class="totals-table">
//           <tr><td class="label">Subtotal</td><td class="value">PKR ${Math.round(invoice.amount).toLocaleString()}</td></tr>
//           <tr><td class="label">Tax (0%)</td><td class="value">PKR 0</td></tr>
//           <tr class="total-row"><td class="label">Total</td><td class="value">PKR ${Math.round(invoice.amount).toLocaleString()}</td></tr>
//         </table>
//       </div>

//       <!-- FROM -->
//       <div class="from-section">
//         <div class="from-left">
//           <strong>Fatima Marketing</strong><br/>
//           Office #111, First Floor<br/>
//           Capital Business Center<br/>
//           F-10 Markaz, Islamabad<br/>
//           UAN: 0331-1111057<br/>
//           www.fatimamarketing.com
//         </div>
//         <div class="from-right">
//           Generated by<br/>
//           ${createdBy}<br/>
//           ${createdAtFormatted}
//         </div>
//       </div>

//       <!-- FOOTER -->
//       <div class="footer">
//         <div class="qr-section">
//           <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
//         </div>
//       </div>
//     </div>
//   </body>
//   </html>
//   `;

//   printWindow.document.write(content);
//   printWindow.document.close();
//   printWindow.focus();

//   setTimeout(() => {
//     printWindow.print();
//   }, 300);
// };

// /* ================= HOOK ================= */
// export const useInvoicePrinter = () => {
//   const printRef = useRef<Window | null>(null);

//   const handlePrint = (invoice: Invoice, logoUrl?: string) => {
//     generateInvoicePDF({ invoice, logoUrl });
//   };

//   return { handlePrint, printRef };
// };
