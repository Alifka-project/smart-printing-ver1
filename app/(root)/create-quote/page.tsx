"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/create-quote/StepIndicator";
import Step1JobSelection from "@/components/create-quote/steps/Step1JobSelection";
import Step2CustomerDetail from "@/components/create-quote/steps/Step2CustomerDetail";
import Step3ProductSpec from "@/components/create-quote/steps/Step3ProductSpec";
import Step4Operational from "@/components/create-quote/steps/Step4Operational";
import Step5Quotation from "@/components/create-quote/steps/Step5Quotation";
import type { QuoteFormData, PreviousQuote } from "@/types";
import { detailToForm } from "@/lib/detail-to-form";
import { QUOTE_DETAILS } from "@/lib/dummy-data";

import {
  downloadCustomerPdf,
  downloadOpsPdf,
  type OtherQty,
} from "@/lib/quote-pdf";
import Link from "next/link";

const EMPTY_CLIENT: QuoteFormData["client"] = {
  clientType: "Company",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  countryCode: "+971",
  role: "",
};

export default function CreateQuotePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteMode, setQuoteMode] = useState<"new" | "existing">("new");
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const [formData, setFormData] = useState<QuoteFormData>({
    client: { ...EMPTY_CLIENT },
    products: [
      {
        productName: "Business Card",
        quantity: 1000,
        sides: "1",
        printingSelection: "Digital",
        flatSize: { width: 9, height: 5.5, spine: null },
        closeSize: { width: 9, height: 5.5, spine: null },
        useSameAsFlat: false,
        papers: [{ name: "Art Paper", gsm: "300" }],
        finishing: ["UV Spot", "Lamination"],
        paperName: "Book",
      },
    ],
    operational: {
      papers: [
        {
          inputWidth: 65,
          inputHeight: 90,
          pricePerPacket: 240,
          sheetsPerPacket: 500,
          recommendedSheets: 125,
          enteredSheets: 130,
        },
      ],
      finishing: [
        { name: "UV Spot", cost: 20 },
        { name: "Lamination", cost: 15 },
      ],
      plates: 4,
      units: 5000,
    },
    calculation: {
      basePrice: 0,
      marginAmount: 0,
      subtotal: 0,
      vatAmount: 0,
      totalPrice: 0,
    },
  });

  // ===== NEW: state untuk Other Quantities di parent
  const mainProduct = formData.products[0];
  const [otherQuantities, setOtherQuantities] = useState<OtherQty[]>([
    {
      productName: mainProduct?.productName ?? "Business Card",
      quantity: 500,
      price: 115,
    },
  ]);

  useEffect(() => {
    setOtherQuantities((prev) =>
      prev.length === 0
        ? prev
        : [
            {
              ...prev[0],
              productName: mainProduct?.productName ?? prev[0].productName,
            },
            ...prev.slice(1),
          ]
    );
  }, [mainProduct?.productName]);

  useEffect(() => {
    const MARGIN_PERCENTAGE = 0.3;
    const VAT_PERCENTAGE = 0.05;

    const paperCost = formData.operational.papers.reduce((total, p) => {
      const pricePerSheet = (p.pricePerPacket || 0) / (p.sheetsPerPacket || 1);
      return total + pricePerSheet * (p.enteredSheets || 0);
    }, 0);

    const finishingCost = formData.operational.finishing.reduce(
      (total, f) => total + (f.cost || 0),
      0
    );

    const basePrice = paperCost + finishingCost;
    const marginAmount = basePrice * MARGIN_PERCENTAGE;
    const subtotal = basePrice + marginAmount;
    const vatAmount = subtotal * VAT_PERCENTAGE;
    const totalPrice = subtotal + vatAmount;

    setFormData((prev) => ({
      ...prev,
      calculation: { basePrice, marginAmount, subtotal, vatAmount, totalPrice },
    }));
  }, [formData.operational]);

  const nextStep = () => setCurrentStep((s) => Math.min(5, s + 1));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleStartNew = () => {
    setFormData((prev) => ({ ...prev, client: { ...EMPTY_CLIENT } }));
    setQuoteMode("new");
    setCurrentStep(2);
  };

  const handleSelectQuote = (q: PreviousQuote) => {
    const detail = QUOTE_DETAILS[q.id];
    if (!detail) return;
    setFormData((prev) => detailToForm(detail, prev));
    setQuoteMode("existing");
    setCurrentStep(2);
  };

  const handleSaveQuote = () => {
    setSaveModalOpen(true);
  };

  const handleDownloadCustomerFromModal = async () => {
    await downloadCustomerPdf(formData, otherQuantities);
  };
  const handleDownloadOpsFromModal = async () => {
    await downloadOpsPdf(formData, otherQuantities);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1JobSelection
            quoteMode={quoteMode}
            setQuoteMode={setQuoteMode}
            onStartNew={handleStartNew}
            onSelectQuote={handleSelectQuote}
          />
        );
      case 2:
        return (
          <Step2CustomerDetail formData={formData} setFormData={setFormData} />
        );
      case 3:
        return (
          <Step3ProductSpec formData={formData} setFormData={setFormData} />
        );
      case 4:
        return (
          <Step4Operational formData={formData} setFormData={setFormData} />
        );
      case 5:
        return (
          <Step5Quotation
            formData={formData}
            setFormData={setFormData}
            otherQuantities={otherQuantities}
            setOtherQuantities={setOtherQuantities}
            onOpenSave={() => setSaveModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="wrapper">
        <main className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-8">
          <StepIndicator
            activeStep={currentStep}
            setActiveStep={setCurrentStep}
          />
          <div className="mt-8 ">{renderStepContent()}</div>

          <div className="mt-10 pt-6 border-t flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-[#2563EB] px-8"
            >
              Previous
            </Button>
            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                className="bg-[#2563EB] hover:bg-blue-600 px-8"
                disabled={quoteMode === "existing" && currentStep === 1}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSaveQuote}
                className="bg-green-600 px-8 hover:bg-green-700"
              >
                Save Quote
              </Button>
            )}
          </div>
        </main>
      </div>

      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">Quote Saved!</h3>
            <p className="text-gray-600 mb-6">What do you want to do next?</p>
            <div className="space-y-3">
              <Button className="w-full bg-[#2563EB] hover:bg-blue-600">
                <Link href={`mailto:${formData.client.email}`}>
                  Send to Customer
                </Link>
              </Button>
              <Button
                className="w-full bg-[#2563EB] hover:bg-blue-600"
                onClick={handleDownloadCustomerFromModal}
              >
                Download for Customer
              </Button>
              <Button className="w-full bg-[#2563EB] hover:bg-blue-600" onClick={handleDownloadOpsFromModal}>
                Download Operations Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => setSaveModalOpen(false)}
                className="w-full mt-2"
              >
                Do Nothing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
