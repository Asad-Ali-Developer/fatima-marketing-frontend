import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Invoice, StatusOptions } from "@/types";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FC } from "react";
import { FiFileText } from "react-icons/fi";
import { IoClose, IoCloudDownloadOutline } from "react-icons/io5";

interface AdminViewInvoiceProps {
  selectedInvoice: Invoice;
  setIsViewModalOpen: (isOpen: boolean) => void;
  statusOptions: StatusOptions[];
  approvalStatusOptions: StatusOptions[];
}

// Logo path — ensure you have /public/logo.png
const LOGO_PATH = "/FatimaMarketingLogo.png";

const AdminViewInvoice: FC<AdminViewInvoiceProps> = ({
  selectedInvoice,
  setIsViewModalOpen,
  statusOptions,
  approvalStatusOptions,
}) => {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 25;
    let currentY = 20;

    // ===== 1. LOGO (Centered Top) =====
    try {
      const imgProps = doc.getImageProperties(LOGO_PATH);
      const ratio = imgProps.height / imgProps.width;
      const imgWidth = 40;
      const imgHeight = imgWidth * ratio;
      const imgX = (pageWidth - imgWidth) / 2;
      doc.addImage(LOGO_PATH, imgX, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 12;
    } catch (e) {
      // Fallback if logo missing
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 30, 30);
      doc.text("YOUR COMPANY", pageWidth / 2, currentY + 8, {
        align: "center",
      });
      currentY += 20;
    }

    // ===== 2. INVOICE TITLE =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("INVOICE", pageWidth / 2, currentY, { align: "center" });
    currentY += 8;

    // ===== 3. Divider =====
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;

    // ===== 4. Customer & Invoice Info (Two Columns) =====
    const formattedDate = format(new Date(selectedInvoice.date), "dd MMM yyyy");

    // Left: Bill To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("Bill To:", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(selectedInvoice.customerName, margin, currentY + 6);
    doc.text(selectedInvoice.phoneNumber, margin, currentY + 12);
    doc.text(selectedInvoice.location || "—", margin, currentY + 18);

    // Right: Invoice Details
    const rightX = pageWidth - 70;
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", rightX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formattedDate}`, rightX, currentY + 6);
    doc.text(
      `Status: ${
        statusOptions.find((opt) => opt.value === selectedInvoice.status)
          ?.label || selectedInvoice.status
      }`,
      rightX,
      currentY + 12,
    );

    currentY += 30; // Add space before TOTAL

    // ===== 5. TOTAL AMOUNT (Bottom-Right, Clean & Professional) =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14); // 👈 Reduced from 16 → 14 for better proportion
    doc.setTextColor(0, 0, 0);
    // const totalLabel = "TOTAL";
    const totalText = `Rs. ${Math.round(selectedInvoice.amount).toLocaleString()}`; // 👈 Remove .00, show whole number

    // const totalLabelWidth = doc.getTextWidth(totalLabel);
    const totalValueWidth = doc.getTextWidth(totalText);
    const totalX = pageWidth - margin - Math.max(totalValueWidth);

    // Write "TOTAL" label
    // doc.text(totalLabel, totalX, currentY);

    // Move down slightly for value
    currentY += 8;

    // Write amount in blue
    doc.setFontSize(16); // 👈 Slightly larger than label, but not huge
    doc.setTextColor(0, 100, 200); // Blue accent
    doc.text(totalText, totalX, currentY);

    // Optional: Add decorative line above total
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - 90, currentY - 12, pageWidth - margin, currentY - 12);

    // ===== 6. Footer Note =====
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Thank you for your business!",
      pageWidth / 2,
      doc.internal.pageSize.height - 20,
      { align: "center" },
    );

    // ===== 7. Save PDF =====
    const cleanName = selectedInvoice.customerName
      .replace(/\s+/g, "_")
      .toLowerCase();
    const fileName = `invoice_${cleanName}_${format(new Date(selectedInvoice.date), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-primary" />
            Invoice Details
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              className="text-xs font-medium bg-[#00B7E8] hover:bg-[#029ec9] text-white hover:text-white transition-colors duration-150 flex items-center shadow-none rounded cursor-pointer"
            >
              <IoCloudDownloadOutline className="mr-1 font-semibold" />
              Download PDF
            </Button>
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>
        <div className="p-6 pb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer
              </label>
              <p className="font-semibold">{selectedInvoice.customerName}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone
              </label>
              <p>{selectedInvoice.phoneNumber}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Location
            </label>
            <p>{selectedInvoice.location || "Not provided"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Amount
              </label>
              <p className="font-bold text-lg">
                Rs. {selectedInvoice.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Date
              </label>
              <p>{format(new Date(selectedInvoice.date), "dd MMM yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SO Invoice Status
            </label>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded text-xs font-semibold",
                statusOptions.find(
                  (opt) => opt.value === selectedInvoice.status,
                )?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {
                statusOptions.find(
                  (opt) => opt.value === selectedInvoice.status,
                )?.label
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Admin Approval Status
            </label>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded text-xs font-semibold",
                approvalStatusOptions.find(
                  (opt) =>
                    opt.value ===
                    (selectedInvoice.reported_to?.admin_approval_status ||
                      "pending"),
                )?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {
                approvalStatusOptions.find(
                  (opt) =>
                    opt.value ===
                    (selectedInvoice.reported_to?.admin_approval_status ||
                      "pending"),
                )?.label
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewInvoice;
