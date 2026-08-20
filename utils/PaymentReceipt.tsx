import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

// ── Brand assets ────────────────────────────────────────────────
const LOGO_PATH = "/assets/PNGs/FatimaMarketingLogo.png";
const SIGNATURE_PATH = "/RiazKhokharSignature.png";

// ── Brand color ─────────────────────────────────────────────────
const BRAND = "#029EC9";

export interface ReceiptItem {
  description: string;
  quantity: string | number;
  unitPrice: string;
  total: string;
}

export interface PaymentReceiptProps {
  date?: string;
  receivedFrom?: string;
  paymentForTitle?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  amountPaid?: string;
  items?: ReceiptItem[];
  totalAmountPaid?: string;
  issuedByName?: string;
  issuedByAddress?: string;
  issuedByPhone?: string;
  issuedByEmail?: string;
  qrValue?: string;
  issuedAt?: string; // small footer timestamp, e.g. "Issued at: Aug 17, 2026, 3:45 PM"
  logoSrc?: string; // overrides LOGO_PATH (used by the print/download hook)
  signatureSrc?: string; // overrides SIGNATURE_PATH
}

const emptyRows = (count: number) => Array.from({ length: count });

export default function PaymentReceipt({
  date = "",
  receivedFrom = "Richard Sanchez",
  paymentForTitle = "Hair & Makeup Services for Special Event",
  invoiceNumber = "INV-2031-210",
  paymentMethod = "Credit Card",
  amountPaid = "$375.00",
  items = [],
  totalAmountPaid = "$375.00",
  issuedByName = "Fatima Marketing",
  issuedByAddress = "123 Anywhere St., Any City, ST 12345",
  issuedByPhone = "+123-456-7890",
  issuedByEmail = "hello@fatimamarketing.com",
  qrValue = "https://fatimamarketing.com/receipt/INV-2031-210",
  issuedAt = new Date().toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }),
  logoSrc = LOGO_PATH,
  signatureSrc = SIGNATURE_PATH,
}: PaymentReceiptProps) {
  const rows = items.length > 0 ? items : emptyRows(8).map(() => null);

  const [logoDataUrl, setLogoDataUrl] = useState<string>("");

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/logo.png");

        if (!response.ok) {
          throw new Error("Failed to load logo");
        }

        const blob = await response.blob();

        const reader = new FileReader();

        reader.onloadend = () => {
          setLogoDataUrl(reader.result as string);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Failed to load QR logo:", error);
      }
    };

    loadLogo();
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-[800px] bg-white text-slate-800 p-10 sm:p-12"
      style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img
            src={"/logo.png"}
            alt="Fatima Marketing"
            className="h-28 w-28 object-contain"
          />
          <h1
            className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight"
            style={{ color: BRAND }}
          >
            PAYMENT
            <br />
            RECEIPT
          </h1>
        </div>

        <div className="mt-2 text-sm text-right">
          <div className="flex items-center justify-end gap-2 border-b border-slate-300 pb-1 min-w-[180px]">
            <span className="font-semibold" style={{ color: BRAND }}>
              Date:
            </span>
            <span className="text-slate-600">
              {new Date().toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="mt-6 h-[3px] w-full" style={{ backgroundColor: BRAND }} />

      {/* ── Received From / Payment For ─────────────────────── */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: BRAND }}>
            Received From:
          </h2>
          <p className="mt-2 text-sm">
            <span className="font-semibold" style={{ color: BRAND }}>
              Name:{" "}
            </span>
            <span className="font-semibold text-slate-800">{receivedFrom}</span>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold" style={{ color: BRAND }}>
            Payment For:
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {paymentForTitle}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold" style={{ color: BRAND }}>
              Invoice Number:{" "}
            </span>
            <span className="text-slate-700">{invoiceNumber}</span>
          </p>
          {/* <p className="text-sm">
            <span className="font-semibold" style={{ color: BRAND }}>
              Payment Method:{" "}
            </span>
            <span className="text-slate-700">{paymentMethod}</span>
          </p> */}
          <p className="text-sm">
            <span className="font-semibold" style={{ color: BRAND }}>
              Amount Paid:{" "}
            </span>
            <span className="font-bold text-slate-800">{amountPaid}</span>
          </p>
        </div>
      </div>

      {/* divider */}
      <div className="mt-8 h-[3px] w-full" style={{ backgroundColor: BRAND }} />

      {/* ── Items table ──────────────────────────────────────── */}
      <div
        className="mt-8 overflow-hidden border"
        style={{ borderColor: BRAND }}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {["Description", "Quantity", "Unit Price", "Total"].map((h) => (
                <th
                  key={h}
                  className="border px-4 py-3 text-left font-bold"
                  style={{ borderColor: BRAND, color: BRAND }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td
                  className="border px-4 py-3 h-10 w-[55%]"
                  style={{ borderColor: BRAND }}
                >
                  {row ? (row as ReceiptItem).description : ""}
                </td>

                <td
                  className="border px-4 py-3 w-[15%] text-center"
                  style={{ borderColor: BRAND }}
                >
                  {row ? (row as ReceiptItem).quantity : ""}
                </td>

                <td
                  className="border px-4 py-3 w-[15%] text-center"
                  style={{ borderColor: BRAND }}
                >
                  {row ? (row as ReceiptItem).unitPrice : ""}
                </td>

                <td
                  className="border px-4 py-3 w-[15%] text-right"
                  style={{ borderColor: BRAND }}
                >
                  {row ? (row as ReceiptItem).total : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* total bar */}
        <div
          className="flex items-center justify-between px-4 py-3 text-white font-semibold"
          style={{ backgroundColor: BRAND }}
        >
          <span>Total Amount Paid:</span>
          <span>{totalAmountPaid}</span>
        </div>
      </div>

      {/* ── Footer: Issued By / Signature / QR ──────────────── */}
      <div className="mt-10 flex items-end justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold" style={{ color: BRAND }}>
            Issued By:
          </h3>
          <p className="mt-1 text-sm font-bold text-slate-800">
            Fatima Marketing
          </p>
          <p className="text-sm text-slate-600">F10 Markaz, Islamabad</p>
          <p className="text-sm text-slate-600">Phone: +92 3332182228</p>
          {/* <p className="text-sm text-slate-600">Email: {issuedByEmail}</p> */}
        </div>

        <div className="flex flex-col items-center gap-2">
          <img
            src={signatureSrc}
            alt="Thank you for your business"
            className="h-14 object-contain"
          />
          <p className="text-center text-xs text-slate-500 max-w-[160px]">
            We hope you shine bright at your special event!
          </p>
        </div>

        {/* QR code with brand logo dropped in the center */}
        <div className="flex flex-col items-center gap-1">
          <QRCodeSVG
            value={qrValue}
            size={96}
            bgColor="#ffffff"
            fgColor={"#029EC9"}
            level="H"
            imageSettings={
              logoDataUrl
                ? {
                    src: logoDataUrl,
                    height: 22,
                    width: 22,
                    excavate: true,
                  }
                : undefined
            }
          />
          <span className="text-[10px] text-slate-400">Scan to verify</span>
        </div>
      </div>

      {/* ── Issued at (small footer timestamp) ──────────────── */}
      <div
        className="mt-8 border-t pt-3 text-center"
        style={{ borderColor: "#e2e8f0" }}
      >
        <p className="text-[11px] text-slate-400">Issued at: {issuedAt}</p>
      </div>
    </div>
  );
}
