import { Invoice } from "@/types";
import { format } from "date-fns";
import { useRef } from "react";

interface GenerateInvoicePDFProps {
  invoice: Invoice;
  logoUrl?: string;
}

export const generateInvoicePDF = ({
  invoice,
  logoUrl,
}: GenerateInvoicePDFProps): void => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const invoiceNumber = `FM-${invoice._id.slice(-6).toUpperCase()}`;
  const formattedDate = format(new Date(invoice.date), "dd MMM yyyy");
  const createdBy = invoice.created_by?.name || "System";

  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f5f5f5;
        padding: 40px 20px;
        color: #333;
        line-height: 1.6;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border-radius: 0;
        overflow: hidden;
      }
      
      /* Header Section */
      .header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        padding: 40px;
        display: table;
        width: 100%;
      }
      
      .header-cell {
        display: table-cell;
        vertical-align: middle;
      }
      
      .logo-section {
        width: 60%;
      }
      
      .logo-placeholder {
        width: 70px;
        height: 70px;
        background: #c9a227;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
        color: #1a1a2e;
        margin-right: 20px;
        vertical-align: middle;
      }
      
      .company-title {
        display: inline-block;
        vertical-align: middle;
      }
      
      .company-title h1 {
        font-family: 'Playfair Display', serif;
        font-size: 32px;
        font-weight: 600;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      
      .company-title span {
        font-size: 11px;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 3px;
        font-weight: 500;
      }
      
      .invoice-meta {
        text-align: right;
        width: 40%;
      }
      
      .invoice-meta h2 {
        font-family: 'Playfair Display', serif;
        font-size: 42px;
        font-weight: 300;
        color: #c9a227;
        margin-bottom: 12px;
        letter-spacing: 2px;
      }
      
      .meta-row {
        font-size: 13px;
        margin: 6px 0;
        color: #ccc;
      }
      
      .meta-row strong {
        color: white;
        display: inline-block;
        width: 90px;
        font-weight: 500;
      }
      
      /* Info Section */
      .info-section {
        padding: 30px 40px;
        background: #fafafa;
      }
      
      .info-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 15px 0;
        margin: 0 -15px;
      }
      
      .info-table td {
        width: 50%;
        vertical-align: top;
      }
      
      .info-box {
        background: white;
        padding: 25px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        border: 1px solid #eee;
      }
      
      .info-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #999;
        margin-bottom: 12px;
        font-weight: 700;
      }
      
      .info-content {
        font-size: 14px;
        line-height: 1.8;
        color: #666;
      }
      
      .info-content strong {
        color: #1a1a2e;
        font-size: 18px;
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
      }
      
      .phone {
        color: #666;
        font-size: 13px;
      }
      
      .location {
        color: #888;
        font-size: 13px;
        margin-top: 4px;
      }
      
      .uan {
        color: #c9a227;
        font-weight: 700;
        font-size: 13px;
        margin-top: 8px;
      }
      
      .website {
        color: #666;
        font-size: 12px;
        margin-top: 4px;
      }
      
      /* Items Table */
      .items-section {
        padding: 0 40px 30px 40px;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e0e0e0;
        font-size: 13px;
      }
      
      .items-table th {
        background: #1a1a2e;
        color: white;
        padding: 16px 12px;
        text-align: left;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 11px;
      }
      
      .items-table th:last-child {
        text-align: right;
      }
      
      .items-table td {
        padding: 20px 12px;
        border-bottom: 1px solid #eee;
        vertical-align: top;
      }
      
      .items-table tr:nth-child(even) {
        background: #fafafa;
      }
      
      .items-table tr:last-child td {
        border-bottom: 2px solid #1a1a2e;
      }
      
      .customer-name {
        font-weight: 700;
        color: #1a1a2e;
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .customer-phone {
        color: #888;
        font-size: 12px;
      }
      
      .type-badge {
        display: inline-block;
        padding: 4px 14px;
        background: #f0f0f0;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 700;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .qty {
        text-align: center;
        font-weight: 600;
        color: #666;
      }
      
      .amount {
        text-align: right;
        font-family: 'Courier New', monospace;
        font-weight: 700;
        color: #1a1a2e;
        font-size: 14px;
      }
      
      /* Totals Table */
      .totals-section {
        padding: 0 40px 30px 40px;
      }
      
      .totals-table {
        width: 300px;
        margin-left: auto;
        border-collapse: collapse;
      }
      
      .totals-table td {
        padding: 10px 15px;
        font-size: 14px;
      }
      
      .totals-table .label {
        text-align: right;
        color: #666;
      }
      
      .totals-table .value {
        text-align: right;
        font-family: 'Courier New', monospace;
        width: 140px;
        color: #333;
      }
      
      .total-row {
        background: #1a1a2e;
        color: white;
      }
      
      .total-row .label {
        color: white;
        font-weight: 700;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .total-row .value {
        color: #c9a227;
        font-weight: 700;
        font-size: 18px;
      }
      
      /* Footer */
      .footer {
        background: #1a1a2e;
        color: white;
        padding: 30px 40px;
        margin-top: 20px;
      }
      
      .footer-table {
        width: 100%;
      }
      
      .footer-table td {
        vertical-align: top;
      }
      
      .footer-left {
        width: 65%;
      }
      
      .footer-right {
        width: 35%;
        text-align: right;
      }
      
      .footer-title {
        color: #c9a227;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 12px;
        font-weight: 700;
      }
      
      .footer-content {
        font-size: 12px;
        line-height: 2;
        color: #aaa;
      }
      
      .signature-line {
        border-top: 1px solid #c9a227;
        width: 160px;
        margin-top: 30px;
        margin-left: auto;
        padding-top: 8px;
        text-align: center;
        font-size: 11px;
        color: #c9a227;
        font-style: italic;
      }
      
      .created-by {
        font-size: 10px;
        color: #666;
        margin-top: 10px;
      }
      
      @media print {
        body {
          background: white;
          padding: 0;
        }
        .invoice-container {
          box-shadow: none;
        }
      }
    </style>
  `;

  const content = `
    <html>
      <head>
        <title>Invoice #${invoiceNumber} - ${invoice.customerName}</title>
        ${styles}
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="header-cell logo-section">
              ${
                logoUrl
                  ? `<img src="${logoUrl}" style="height: 70px; margin-right: 20px; vertical-align: middle;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" /><div class="logo-placeholder" style="display: none;">FM</div>`
                  : `<div class="logo-placeholder">FM</div>`
              }
              <div class="company-title">
                <h1>FATIMA MARKETING</h1>
                <span>Real Estate Solutions</span>
              </div>
            </div>
            <div class="header-cell invoice-meta">
              <h2>INVOICE</h2>
              <div class="meta-row"><strong>Invoice #</strong> ${invoiceNumber}</div>
              <div class="meta-row"><strong>Date</strong> ${formattedDate}</div>
              <div class="meta-row"><strong>Status</strong> ${invoice.status.toUpperCase()}</div>
            </div>
          </div>

          <!-- Bill To / From -->
          <div class="info-section">
            <table class="info-table">
              <tr>
                <td>
                  <div class="info-box">
                    <div class="info-label">Bill To</div>
                    <div class="info-content">
                      <strong>${invoice.customerName}</strong>
                      <div class="phone">${invoice.phoneNumber}</div>
                      <div class="location">${invoice.location || "Islamabad"}</div>
                      ${invoice.remarks ? `<div style="margin-top: 8px; font-size: 12px; color: #999; font-style: italic;">"${invoice.remarks}"</div>` : ""}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="info-box">
                    <div class="info-label">From</div>
                    <div class="info-content">
                      <strong>Fatima Marketing</strong>
                      <div class="location">Office # 111, First Floor</div>
                      <div class="location">Capital Business Center</div>
                      <div class="location">F-10 Markaz, Islamabad</div>
                      <div class="uan">UAN: 0331-1111057</div>
                      <div class="website">www.fatimamarketing.com</div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 8%; text-align: center;">#</th>
                  <th style="width: 42%;">Customer Details</th>
                  <th style="width: 20%; text-align: center;">Property Type</th>
                  <th style="width: 10%; text-align: center;">Qty</th>
                  <th style="width: 20%; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center; color: #999;">1</td>
                  <td>
                    <div class="customer-name">${invoice.customerName}</div>
                    <div class="customer-phone">${invoice.phoneNumber}</div>
                  </td>
                  <td style="text-align: center;">
                    <span class="type-badge">Property</span>
                  </td>
                  <td class="qty">1</td>
                  <td class="amount">PKR ${Math.round(invoice.amount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="value">PKR ${Math.round(invoice.amount).toLocaleString()}</td>
              </tr>
              <tr>
                <td class="label">Tax (0%):</td>
                <td class="value">PKR 0</td>
              </tr>
              <tr class="total-row">
                <td class="label">Total:</td>
                <td class="value">PKR ${Math.round(invoice.amount).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div class="footer">
            <table class="footer-table">
              <tr>
                <td class="footer-left">
                  <div class="footer-title">Terms & Conditions</div>
                  <div class="footer-content">
                    1. Payment is due within 15 days of invoice date.<br>
                    2. All properties are subject to availability and verification.<br>
                    3. This invoice is computer generated and valid without signature.
                  </div>
                  <div class="created-by">Created by: ${createdBy} | ${format(new Date(invoice.createdAt), "dd MMM yyyy HH:mm")}</div>
                </td>
                <td class="footer-right">
                  <div class="signature-line">Authorized Signature</div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();

  // Delay print to allow styles to load
  setTimeout(() => {
    printWindow.print();
    // Don't close immediately to allow user to save as PDF
    // printWindow.close();
  }, 250);
};

// React Hook for using in components
export const useInvoicePrinter = () => {
  const printRef = useRef<Window | null>(null);

  const handlePrint = (invoice: Invoice, logoUrl?: string) => {
    generateInvoicePDF({ invoice, logoUrl });
  };

  return { handlePrint, printRef };
};
