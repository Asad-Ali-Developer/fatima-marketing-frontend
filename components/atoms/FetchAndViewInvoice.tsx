"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InvoiceService } from "@/services";
import { adminInvoiceApprovalStatusOptions, Invoice } from "@/types";
import { leadsStatusOptions } from "@/types/Leads";
import { useInvoicePrinter } from "@/utils";
import { format } from "date-fns";
import { FC, useEffect, useState } from "react";
import { FiFileText } from "react-icons/fi";
import { IoClose, IoCloudDownloadOutline } from "react-icons/io5";
import { toast } from "react-toastify";

/*
 * Reusable shimmer block.
 */
const Shimmer = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />
  );
};

/*
 * Loading skeleton matching the invoice modal.
 */
const InvoiceModalSkeleton = () => {
  return (
    <div className="space-y-5">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-2 lg:gap-4">
        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-5 w-32" />
        </div>

        <div className="space-y-2">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-5 w-28" />
        </div>
      </div>

      {/* Location & Invoice Number */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-5 w-28" />
        </div>

        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-5 w-32" />
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-12 w-full rounded-lg" />
      </div>

      {/* Quantity & Property Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-5 w-24" />
        </div>

        <div className="space-y-2">
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-5 w-28" />
        </div>
      </div>

      {/* Amount & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-7 w-28" />
        </div>

        <div className="space-y-2">
          <Shimmer className="h-3 w-12" />
          <Shimmer className="h-5 w-24" />
        </div>
      </div>

      {/* SO Invoice Status */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-6 w-20 rounded" />
      </div>

      {/* Admin Approval Status */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-3 w-36" />
        <Shimmer className="h-6 w-20 rounded" />
      </div>

      {/* Created By */}
      <div className="space-y-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-5 w-28" />
        <Shimmer className="h-3 w-36" />
      </div>

      {/* Reported To */}
      <div className="space-y-2">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-5 w-28" />
        <Shimmer className="h-3 w-36" />
      </div>

      {/* Generated From Lead */}
      <div className="border-t border-slate-200 pt-3">
        <Shimmer className="mb-3 h-4 w-40" />

        <div className="space-y-3">
          <div className="flex gap-2">
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-28" />
          </div>

          <div className="flex gap-2">
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-28" />
          </div>

          <div className="flex gap-2">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-32" />
          </div>

          <div className="flex gap-2">
            <Shimmer className="h-4 w-12" />
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FetchAndViewInvoiceProps {
  invoiceId: string;
  setIsViewModalOpen: (isOpen: boolean) => void;
}

const FetchAndViewInvoice: FC<FetchAndViewInvoiceProps> = ({
  invoiceId,
  setIsViewModalOpen,
}) => {
  const { handlePrint } = useInvoicePrinter();
  const invoiceService = new InvoiceService();

  const [fetchingInvoice, setFetchingInvoice] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);

  const renderField = (value?: string | null) => {
    return value || "Not provided";
  };

  /*
   * Lock background scrolling while modal is open.
   */
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  /*
   * Fetch invoice.
   */
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setFetchingInvoice(true);

        const invoice = await invoiceService.getInvoiceById(invoiceId);

        // console.log("Invoice: ", invoice.data)

        setInvoiceData(invoice.data);
      } catch (error) {
        console.log("Error:", error);

        toast.error("Failed to fetch invoice details. Please try again.");
      } finally {
        setFetchingInvoice(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  /*
   * Find SO invoice status.
   */
  const invoiceStatus = leadsStatusOptions.find(
    (option) => option.value === invoiceData?.status,
  );

  /*
   * Find admin approval status.
   */
  const approvalStatus =
    adminInvoiceApprovalStatusOptions.find(
      (option) =>
        option.value ===
        (invoiceData?.reported_to?.admin_approval_status || "pending"),
    ) || adminInvoiceApprovalStatusOptions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 lg:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-3">
          <h3 className="flex items-center gap-2 text-base font-bold lg:text-xl">
            <FiFileText className="text-[#00a8d6]" />
            Invoice Details
          </h3>

          <div className="flex items-center gap-2">
            {/* Download button */}
            <Button
              size="sm"
              disabled={fetchingInvoice || !invoiceData}
              onClick={() => {
                if (invoiceData) {
                  handlePrint(invoiceData);
                }
              }}
              className="flex cursor-pointer items-center rounded bg-[#00B7E8] px-2 text-xs font-medium text-white shadow-none transition-colors duration-150 hover:bg-[#029ec9] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 lg:px-3"
            >
              <IoCloudDownloadOutline className="mr-1" />
              Download PDF
            </Button>

            {/* Close */}
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-100"
              aria-label="Close"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-8 text-sm lg:p-6 lg:text-base">
          {fetchingInvoice ? (
            <InvoiceModalSkeleton />
          ) : invoiceData ? (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-2 lg:gap-4">
                {/* Customer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </label>

                  <p className="font-semibold">
                    {renderField(invoiceData.customerName)}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </label>

                  <p>{renderField(invoiceData.phoneNumber)}</p>
                </div>
              </div>

              {/* Location & Invoice Number */}
              <div className="grid grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </label>

                  <p>{renderField(invoiceData.location)}</p>
                </div>

                {/* Invoice Number */}
                {invoiceData.invoice_number && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Invoice #
                    </label>

                    <span className="block py-1 font-semibold text-slate-700">
                      {invoiceData.invoice_number}
                    </span>
                  </div>
                )}
              </div>

              {/* Remarks */}
              {invoiceData.remarks && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Remarks
                  </label>

                  <p className="rounded-lg bg-slate-100 p-2 italic">
                    {invoiceData.remarks}
                  </p>
                </div>
              )}

              {/* Quantity & Property Type */}
              {(invoiceData.quantity || invoiceData.property_type) && (
                <div className="grid grid-cols-2 gap-4">
                  {invoiceData.quantity && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Quantity
                      </label>

                      <p>{invoiceData.quantity}</p>
                    </div>
                  )}

                  {invoiceData.property_type && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Property Type
                      </label>

                      <p>{invoiceData.property_type}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Financial & Date */}
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </label>

                  <p className="text-lg font-bold text-slate-600">
                    Rs. {Number(invoiceData.amount || 0).toLocaleString()}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </label>

                  <p>
                    {invoiceData.date
                      ? format(new Date(invoiceData.date), "dd MMM yyyy")
                      : "Not provided"}
                  </p>
                </div>
              </div>

              {/* SO Invoice Status */}
              {/* <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  SO Invoice Status
                </label>

                <span
                  className={cn(
                    "inline-block rounded px-3 py-1 text-xs font-semibold",
                    invoiceStatus?.color || "bg-slate-100 text-slate-700",
                  )}
                >
                  {invoiceStatus?.label || "Unknown"}
                </span>
              </div> */}

              {/* Admin Approval Status */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Admin Approval Status
                </label>

                <span
                  className={cn(
                    "inline-block rounded px-3 py-1 text-xs font-semibold",
                    approvalStatus?.color || "bg-slate-100 text-slate-700",
                  )}
                >
                  {approvalStatus?.label || "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Created By */}
                {invoiceData.created_by?.name && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Created By
                    </label>

                    <p>{invoiceData.created_by.name}</p>

                    {invoiceData.created_by.name && (
                      <p className="text-xs text-slate-500">
                        {invoiceData.created_by.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Reported To */}
                {invoiceData.reported_to?.name && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Reported To
                    </label>

                    <p>{invoiceData.reported_to.name}</p>

                    {invoiceData.reported_to.name && (
                      <p className="text-xs text-slate-500">
                        {invoiceData.reported_to.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Generated By Lead */}
              {invoiceData.generatedByLead && (
                <div className="border-t border-slate-200 pt-2">
                  <h4 className="mb-2 text-sm font-bold text-slate-700">
                    Generated From Lead
                  </h4>

                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {renderField(invoiceData.generatedByLead.userName)}
                    </p>

                    <p>
                      <strong>Phone:</strong>{" "}
                      {renderField(invoiceData.generatedByLead.phoneNumber)}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {renderField(invoiceData.generatedByLead.location)}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {invoiceData.generatedByLead.status || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-slate-500">
                Unable to load invoice details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FetchAndViewInvoice;
