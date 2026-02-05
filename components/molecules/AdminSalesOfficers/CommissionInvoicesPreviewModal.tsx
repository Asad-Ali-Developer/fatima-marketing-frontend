import { Input } from "@/components/ui/input";
import { Invoice, User } from "@/types";
import { useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface CommissionInvoicesPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  salesOfficer: User;
  commissionRateOfSO: number;
}

const CommissionInvoicesPreviewModal = ({
  isOpen,
  onClose,
  invoices,
  salesOfficer,
  commissionRateOfSO,
}: CommissionInvoicesPreviewModalProps) => {
  // 🔧 Normalize rate to decimal (0.65)
  const normalizedRate =
    commissionRateOfSO > 1 ? commissionRateOfSO / 100 : commissionRateOfSO;

  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.phoneNumber.includes(searchTerm),
  );

  const totalAmount = filteredInvoices.reduce(
    (sum, inv) => sum + inv.amount,
    0,
  );
  const totalCommission = totalAmount * normalizedRate; // ✅ use normalized

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header, .footer { text-align: center; margin: 10px 0; color: #333; line-height: 1.4; }
        .company-info { font-size: 14px; font-weight: bold; margin: 8px 0; }
        .summary-box { background: #f9fafb; padding: 12px; border-radius: 8px; margin: 16px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
        .highlight { font-weight: bold; color: #00B7E8; }
      </style>
    `;

    const tableRows = filteredInvoices
      .map((inv) => {
        const commission = inv.amount * normalizedRate;
        return `
            <tr>
              <td>${inv.customerName}</td>
              <td>${inv.phoneNumber}</td>
              <td class="text-right">Rs. ${inv.amount.toFixed()}</td>
              <td class="text-right">${(normalizedRate * 100).toFixed()}%</td>
              <td class="text-right highlight">Rs. ${commission.toFixed()}</td>
            </tr>
          `;
      })
      .join("");

    const content = `
      <html>
        <head>
          <title>Commission Statement - ${salesOfficer.full_name}</title>
          ${styles}
        </head>
        <body>
          <!-- Top Company Info -->
          <div class="header">
            <div class="company-info">Office number 111, first floor Capital Business Center F-10 Markaz Islamabad</div>
            <div class="company-info">Www.fatimamarketing.com</div>
            <div class="company-info">UAN # 0331-1111057</div>
          </div>

          <!-- Summary -->
          <div class="summary-box">
            <h2 style="text-align:center; margin-bottom:8px;">Commission Statement</h2>
            <p><strong>Sales Officer:</strong> ${salesOfficer.full_name}</p>
            <p><strong>Commission Rate:</strong> ${(normalizedRate * 100).toFixed()}%</p>
            <p><strong>Salary:</strong> ${salesOfficer.rokra}%</p>
            <p><strong>Total Invoices:</strong> ${filteredInvoices.length}</p>
            <p><strong>Total Amount:</strong> Rs. ${totalAmount.toFixed()}</p>
            <p class="highlight"><strong>Total Commission:</strong> Rs. ${totalCommission.toFixed()}</p>
          </div>

          <!-- Table -->
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              Commission for {salesOfficer.full_name}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Commission Rate:{" "}
              <span className="font-semibold text-[#00B7E8]">
                {(normalizedRate * 100).toFixed()}%
              </span>
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Salary:
              <span className="font-semibold text-[#00B7E8] ml-1">
                {salesOfficer.rokra}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search customer or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#00B7E8] text-white rounded hover:bg-[#029ec9]"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded"
            >
              <FiX />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6" ref={printRef}>
          {filteredInvoices.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No invoices found.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const commission = inv.amount * normalizedRate; // ✅
                  return (
                    <tr
                      key={inv._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2">{inv.customerName}</td>
                      <td className="px-4 py-2">{inv.phoneNumber}</td>
                      <td className="px-4 py-2 text-right">
                        Rs. {inv.amount.toFixed()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {(normalizedRate * 100).toFixed()}%
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-[#00B7E8]">
                        Rs. {commission.toFixed()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Summary + Company Info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm flex justify-between items-center">
          <div>
            <span className="mr-4">
              <strong>Total Amount:</strong> Rs. {totalAmount.toFixed()}
            </span>
            <span>
              <strong>Rate:</strong> {(normalizedRate * 100).toFixed()}%
            </span>
          </div>
          <div className="font-bold text-[#00B7E8]">
            Total Commission: Rs. {totalCommission.toFixed()}
          </div>
        </div>
        <div className="px-6 py-2 text-center text-xs text-slate-600 bg-slate-50">
          Office number 111, first floor Capital Business Center F-10 Markaz
          Islamabad • Www.fatimamarketing.com • UAN # 0331-1111057
        </div>
      </div>
    </div>
  );
};

export default CommissionInvoicesPreviewModal;
