import html2canvas from "html2canvas-pro"; // ← swapped from "html2canvas"
import jsPDF from "jspdf";
import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";

import PaymentReceipt, {
  PaymentReceiptProps,
  ReceiptItem,
} from "./PaymentReceipt";

import type { Invoice } from "@/types";

function mapInvoiceToReceiptProps(invoice: Invoice): PaymentReceiptProps {
  const amount = Number(invoice.amount || 0);

  const formattedAmount = `Rs. ${amount.toLocaleString()}`;

  const item: ReceiptItem = {
    description:
      invoice.description || invoice.property_type || "Marketing Services",

    quantity: invoice.quantity || 1,

    unitPrice: formattedAmount,

    total: formattedAmount,
  };

  return {
    date: invoice.date
      ? new Date(invoice.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",

    receivedFrom: invoice.customerName,

    paymentForTitle:
      invoice.description || invoice.property_type || "Marketing Services",

    invoiceNumber: invoice.invoice_number || "N/A",

    paymentMethod: "N/A",

    amountPaid: formattedAmount,

    items: [item],

    totalAmountPaid: formattedAmount,

    issuedByName: invoice.created_by?.name || "Fatima Marketing",

    issuedByAddress: invoice.location || "Fatima Marketing",

    issuedByPhone: "",

    issuedByEmail: "",

    qrValue: invoice.invoice_number
      ? `https://crm.fatimamarketingofficial.com/invoice/${invoice.invoice_number}`
      : "https://fatimamarketing.com",

    logoSrc: "/FatimaMarketingLogo.png",

    issuedAt: new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    signatureSrc: "/RiazKhokharSignature.png", // Use the signature image path
  };
}

/**
 * Wait for all images.
 */
function waitForImages(container: HTMLElement): Promise<void[]> {
  const images = Array.from(container.querySelectorAll("img"));

  return Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );
}

/**
 * Wait until React has painted.
 */
function waitForRender(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Optional defensive fallback: force any lingering modern color functions
 * to plain hex before capture. With html2canvas-pro this is no longer
 * strictly required (it parses lab()/oklch()/color() natively), but it's
 * harmless to keep as a safety net for edge cases (e.g. third-party
 * components you don't control that inject inline oklch styles).
 */
function sanitizeColors(element: HTMLElement) {
  const elements = [
    element,
    ...Array.from(element.querySelectorAll<HTMLElement>("*")),
  ];

  const isUnsupported = (value: string) =>
    value.includes("lab(") ||
    value.includes("oklab(") ||
    value.includes("lch(") ||
    value.includes("oklch(") ||
    value.includes("color(");

  elements.forEach((el) => {
    const computed = window.getComputedStyle(el);

    if (isUnsupported(computed.backgroundColor)) {
      el.style.backgroundColor = "#ffffff";
    }
    if (isUnsupported(computed.color)) {
      el.style.color = "#1e293b";
    }

    // Check each border side individually — computed.borderColor can be
    // an empty string when the four sides differ.
    (["borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"] as const).forEach(
      (prop) => {
        if (isUnsupported(computed[prop])) {
          el.style[prop] = "#e2e8f0";
        }
      },
    );

    if (isUnsupported(computed.outlineColor)) {
      el.style.outlineColor = "#e2e8f0";
    }
    if (isUnsupported(computed.boxShadow)) {
      el.style.boxShadow = "none";
    }
    if (isUnsupported(computed.fill)) {
      el.style.fill = "#029ec9";
    }
    if (isUnsupported(computed.stroke)) {
      el.style.stroke = "#029ec9";
    }
  });
}

export function useInvoicePrinter() {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(async (invoice: Invoice) => {
    let container: HTMLDivElement | null = null;

    let root: ReturnType<typeof createRoot> | null = null;

    try {
      setIsPrinting(true);

      const props = mapInvoiceToReceiptProps(invoice);

      /**
       * Create isolated temporary container.
       */
      container = document.createElement("div");

      Object.assign(container.style, {
        position: "fixed",
        top: "0",
        left: "-10000px",
        width: "800px",
        minHeight: "1000px",
        background: "#ffffff",
        backgroundColor: "#ffffff",
        color: "#1e293b",
        zIndex: "-9999",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      });

      document.body.appendChild(container);

      /**
       * Render receipt.
       */
      root = createRoot(container);

      root.render(<PaymentReceipt {...props} />);

      /**
       * Wait for React.
       */
      await waitForRender();

      if (!container.innerHTML.trim()) {
        throw new Error("Payment receipt was not rendered.");
      }

      /**
       * Wait for images.
       */
      await waitForImages(container);

      /**
       * Allow browser layout to settle.
       */
      await new Promise<void>((resolve) => setTimeout(resolve, 300));

      /**
       * Defensive fallback — see comment above sanitizeColors().
       */
      sanitizeColors(container);

      /**
       * Generate canvas.
       */
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 800,
        windowWidth: 800,
        windowHeight: container.scrollHeight,
        removeContainer: true,
      });

      /**
       * Convert canvas to PNG.
       */
      const imageData = canvas.toDataURL("image/png");

      /**
       * Create A4 PDF.
       */
      const pdf = new jsPDF({
        unit: "pt",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      /**
       * Scale image to A4 width.
       */
      const imageHeight = (canvas.height * pageWidth) / canvas.width;

      /**
       * Add image across pages.
       */
      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, pageWidth, imageHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;

        pdf.addPage();

        pdf.addImage(imageData, "PNG", 0, position, pageWidth, imageHeight);

        heightLeft -= pageHeight;
      }

      /**
       * Filename.
       */
      const invoiceNumber = invoice.invoice_number || invoice._id;

      const fileName = `Invoice-${invoiceNumber}.pdf`;

      /**
       * Download.
       */
      pdf.save(fileName);
    } catch (error) {
      console.error("Invoice PDF generation failed:", error);

      throw error;
    } finally {
      /**
       * Cleanup.
       */
      if (root) {
        root.unmount();
      }

      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }

      setIsPrinting(false);
    }
  }, []);

  return {
    handlePrint,
    isPrinting,
  };
}