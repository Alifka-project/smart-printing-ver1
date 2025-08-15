"use client";

import * as React from "react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { QuoteFormData } from "@/types";
import type { OtherQty } from "@/lib/quote-pdf";

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n
  );

interface Step5Props {
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
  otherQuantities: OtherQty[];
  setOtherQuantities: React.Dispatch<React.SetStateAction<OtherQty[]>>;
  onOpenSave: () => void; 
}

const Step5Quotation: FC<Step5Props> = ({
  formData,
  otherQuantities,
  setOtherQuantities,
}) => {
  const mainProduct = formData.products[0];

  const unitBase = 0.195;
  const base = (mainProduct?.quantity ?? 0) * unitBase;
  const vat = base * 0.05;
  const total = base + vat;

  const addOtherQty = (): void =>
    setOtherQuantities((prev) => [
      ...prev,
      {
        productName: mainProduct?.productName ?? "Business Card",
        quantity: 250,
        price: 60,
      },
    ]);

  const removeOtherQty = (idx: number): void =>
    setOtherQuantities((prev) => prev.filter((_, i) => i !== idx));

  const updateOtherQty = (idx: number, patch: Partial<OtherQty>): void =>
    setOtherQuantities((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });

  return (
    <div className="space-y-8">
      <h3 className="font-bold text-2xl">Quotation</h3>

      {/* Price summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-md text-gray-700">Price Summary</h4>
        </div>

        <div className="border-b overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">VAT (5%)</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  {mainProduct?.productName ?? "—"}
                </TableCell>
                <TableCell>{mainProduct?.quantity ?? 0}</TableCell>
                <TableCell className="text-right">{currency(base)}</TableCell>
                <TableCell className="text-right">{currency(vat)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {currency(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-lg">Grand Total</span>
            <span className="font-bold text-2xl text-blue-600">
              {currency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Other quantities */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-md text-gray-700">
            Supplementary Information: Other Quantities
          </h4>
        </div>
        <Button variant="outline" className="mb-4 border-[#2563EB]" size="sm" onClick={addOtherQty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Other Quantities
        </Button>

        <div className="border rounded-lg p-4 space-y-4">
          {otherQuantities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No other quantities yet.
            </p>
          )}

          {otherQuantities.map((row, idx) => {
            const b = typeof row.price === "number" ? row.price : 0;
            const v = b * 0.05;
            const t = b + v;

            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
              >
                <div className="md:col-span-4">
                  <Label className="text-xs">Product Name</Label>
                  <Input
                    value={row.productName}
                    onChange={(e) =>
                      updateOtherQty(idx, { productName: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) =>
                      updateOtherQty(idx, {
                        quantity:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={row.price}
                    onChange={(e) =>
                      updateOtherQty(idx, {
                        price:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">VAT (5%)</Label>
                    <Input
                      readOnly
                      className="bg-gray-100"
                      value={currency(v)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Total</Label>
                    <Input
                      readOnly
                      className="bg-gray-100"
                      value={currency(t)}
                    />
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeOtherQty(idx)}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step5Quotation;
