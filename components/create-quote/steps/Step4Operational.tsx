"use client";

import type { FC, Dispatch, SetStateAction } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { QuoteFormData } from "@/types";

interface Step4Props {
  formData: QuoteFormData;
  setFormData: Dispatch<SetStateAction<QuoteFormData>>;
}

/** Hitung layout sederhana untuk nesting product di atas sheet */
function computeLayout(
  sheetW: number | null,
  sheetH: number | null,
  prodW: number | null,
  prodH: number | null
) {
  if (!sheetW || !sheetH || !prodW || !prodH) {
    return {
      usableW: 0,
      usableH: 0,
      prodWb: 0,
      prodHb: 0,
      nx: 0,
      ny: 0,
      itemsPerSheet: 0,
      efficiency: 0,
    };
  }

  const margin = 0.5; // cm
  const bleed = 0.5; // cm

  const usableW = Math.max(0, sheetW - margin * 2);
  const usableH = Math.max(0, sheetH - margin * 2);

  const prodWb = prodW + bleed * 2;
  const prodHb = prodH + bleed * 2;

  const nx = Math.max(0, Math.floor(usableW / prodWb));
  const ny = Math.max(0, Math.floor(usableH / prodHb));
  const itemsPerSheet = nx * ny;

  const effectiveArea = usableW * usableH;
  const itemArea = prodWb * prodHb;
  const efficiency =
    effectiveArea > 0 && itemsPerSheet > 0
      ? Math.min(100, (itemsPerSheet * itemArea * 100) / effectiveArea)
      : 0;

  return {
    usableW,
    usableH,
    prodWb,
    prodHb,
    nx,
    ny,
    itemsPerSheet,
    efficiency,
  };
}

const Step4Operational: FC<Step4Props> = ({ formData, setFormData }) => {
  const product = formData.products[0];

  // ===== kalkulasi per-paper (memoized) =====
  const perPaperCalc = React.useMemo(() => {
    const closeW =
      product?.closeSize?.width ?? product?.flatSize?.width ?? null;
    const closeH =
      product?.closeSize?.height ?? product?.flatSize?.height ?? null;
    const qty = product?.quantity ?? 0;

    return formData.operational.papers.map((opPaper) => {
      const layout = computeLayout(
        opPaper?.inputWidth ?? null,
        opPaper?.inputHeight ?? null,
        closeW,
        closeH
      );

      const recommendedSheets =
        layout.itemsPerSheet > 0 ? Math.ceil(qty / layout.itemsPerSheet) : 0;

      const pricePerSheet =
        opPaper?.pricePerPacket != null &&
        opPaper?.sheetsPerPacket != null &&
        opPaper.sheetsPerPacket > 0
          ? opPaper.pricePerPacket / opPaper.sheetsPerPacket
          : null;

      return { layout, recommendedSheets, pricePerSheet };
    });
  }, [
    formData.operational.papers,
    product?.closeSize?.width,
    product?.closeSize?.height,
    product?.flatSize?.width,
    product?.flatSize?.height,
    product?.quantity,
  ]);

  // ===== Plates & Units =====
  const { plates, units } = React.useMemo(() => {
    const sides = product?.sides ?? "1";
    const printing = product?.printingSelection ?? "Digital";

    const p = printing === "Digital" ? 0 : (sides === "2" ? 2 : 1) * 4;

    const totalSheets = formData.operational.papers.reduce(
      (acc, opPaper, i) => {
        const entered = opPaper.enteredSheets ?? null;
        const rec = perPaperCalc[i]?.recommendedSheets ?? 0;
        return acc + (entered != null ? entered : rec);
      },
      0
    );

    const u = totalSheets * (sides === "2" ? 2 : 1);
    return { plates: p, units: u };
  }, [
    formData.operational.papers,
    perPaperCalc,
    product?.printingSelection,
    product?.sides,
  ]);

  // ===== sinkron ke state (recommendedSheets, plates, units) =====
  React.useEffect(() => {
    setFormData((prev) => {
      const nextPapers = prev.operational.papers.map((p, i) => {
        const rec = perPaperCalc[i]?.recommendedSheets ?? p.recommendedSheets;
        return p.recommendedSheets === rec
          ? p
          : { ...p, recommendedSheets: rec };
      });

      const samePapers =
        nextPapers.length === prev.operational.papers.length &&
        nextPapers.every(
          (p, i) =>
            p.recommendedSheets === prev.operational.papers[i].recommendedSheets
        );

      const samePlates = prev.operational.plates === plates;
      const sameUnits = prev.operational.units === units;

      if (samePapers && samePlates && sameUnits) return prev;

      return {
        ...prev,
        operational: {
          ...prev.operational,
          papers: nextPapers,
          plates,
          units,
        },
      };
    });
  }, [perPaperCalc, plates, units, setFormData]);

  // ===== handlers =====
  const handlePaperOpChange = (
    index: number,
    field: keyof QuoteFormData["operational"]["papers"][0],
    value: string
  ) => {
    const v: number | null = value === "" ? null : parseFloat(value);
    const newPapers = [...formData.operational.papers];
    newPapers[index] = { ...newPapers[index], [field]: v };
    setFormData((prev) => ({
      ...prev,
      operational: { ...prev.operational, papers: newPapers },
    }));
  };

  const handleFinishingCostChange = (name: string, value: string) => {
    const v: number | null = value === "" ? null : parseFloat(value);
    const newFin = formData.operational.finishing.map((f) =>
      f.name === name ? { ...f, cost: v } : f
    );
    setFormData((prev) => ({
      ...prev,
      operational: { ...prev.operational, finishing: newFin },
    }));
  };

  // ===== state modal =====
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  const openData =
    openIdx != null
      ? {
          paper: formData.products[0].papers[openIdx],
          op: formData.operational.papers[openIdx],
          calc: perPaperCalc[openIdx],
        }
      : null;

  // ===== helper currency =====
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  // ===== render =====
  return (
    <div className="space-y-8">
      <h3 className="font-bold text-2xl">Operational Details</h3>
      <div className="py-1 border-t-1 border-gray-300" />

      {formData.products[0].papers.map((paper, index) => {
        const opPaper = formData.operational.papers[index];
        const { layout, recommendedSheets, pricePerSheet } = perPaperCalc[
          index
        ] ?? {
          layout: {
            usableW: 0,
            usableH: 0,
            prodWb: 0,
            prodHb: 0,
            nx: 0,
            ny: 0,
            itemsPerSheet: 0,
            efficiency: 0,
          },
          recommendedSheets: 0,
          pricePerSheet: null as number | null,
        };

        const sheetW = opPaper?.inputWidth ?? null;
        const sheetH = opPaper?.inputHeight ?? null;
        const qty = formData.products[0]?.quantity ?? 0;

        return (
          <div key={index} className="space-y-6">
            {/* Header + Button modal */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg text-gray-800">
                <span className="text-blue-600">
                  {paper.name || "—"} {paper.gsm ? `${paper.gsm}gsm` : ""}
                </span>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenIdx(index)}
              >
                View Cost Details
              </Button>
            </div>

            {/* Form per paper */}
            <div className="grid md:grid-cols-2 gap-6 border border-gray-200 p-6 rounded-xl">
              <div>
                <Label className="mb-2 block">Paper Size Width (cm):</Label>
                <Input
                  type="number"
                  placeholder="Width"
                  min={0}
                  value={opPaper?.inputWidth ?? ""}
                  className="inputForm"
                  onChange={(e) =>
                    handlePaperOpChange(index, "inputWidth", e.target.value)
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Paper Size Height (cm):</Label>
                <Input
                  type="number"
                  placeholder="Height"
                  value={opPaper?.inputHeight ?? ""}
                  className="inputForm"
                  min={0}
                  onChange={(e) =>
                    handlePaperOpChange(index, "inputHeight", e.target.value)
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Recommended No. of Sheets</Label>
                <Input
                  value={recommendedSheets || ""}
                  readOnly
                  className="bg-gray-100 inputFormDissable"
                />
              </div>

              <div>
                <Label className="mb-2 block">Enter No. of Sheets</Label>
                <Input
                  type="number"
                  min={recommendedSheets || 0}
                  placeholder={
                    recommendedSheets ? String(recommendedSheets) : "e.g. 125"
                  }
                  className="inputForm"
                  value={opPaper?.enteredSheets ?? ""}
                  onChange={(e) =>
                    handlePaperOpChange(index, "enteredSheets", e.target.value)
                  }
                />
              </div>

              <div>
                <Label className="mb-2 block">Price per Sheet:</Label>
                <Input
                  readOnly
                  className="inputFormDissable"
                  value={pricePerSheet != null ? pricePerSheet.toFixed(4) : "—"}
                />
              </div>
              <div>
                <Label className="mb-2 block">No. of sheets per packet:</Label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  className="inputForm"
                  min={0}
                  value={opPaper?.sheetsPerPacket ?? ""}
                  onChange={(e) =>
                    handlePaperOpChange(
                      index,
                      "sheetsPerPacket",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block">Price per Packet:</Label>
                <Input
                  type="number"
                  className="inputForm"
                  placeholder="$ 0.00"
                  value={opPaper?.pricePerPacket ?? ""}
                  onChange={(e) =>
                    handlePaperOpChange(index, "pricePerPacket", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Additional Costs (auto) */}
            <div>
              <div className="py-1 border-t-1 border-gray-300" />
              <h4 className="font-semibold text-md text-gray-700 mb-3">
                Additional Costs
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">No. of plates:</Label>
                  <Input readOnly className="inputFormDissable" value={plates} />
                </div>
                <div>
                  <Label className="mb-2 block">No. of units:</Label>
                  <Input readOnly className="inputFormDissable" value={units} />
                </div>
              </div>
            </div>

            {/* Finishing Costs (hanya yang dipilih) */}
            {product.finishing.length > 0 && (
              <div>
                <div className="py-1 border-t-1 border-gray-300" />
                <h4 className="font-semibold text-md text-gray-700 mb-3">
                  Finishing Costs
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {formData.operational.finishing
                    .filter((f) => product.finishing.includes(f.name))
                    .map((item) => (
                      <div key={item.name}>
                        <Label className="mb-2 block">{item.name} Cost:</Label>
                        <Input
                          type="number"
                          placeholder="$ 0.00"
                          className="inputForm"
                          min={0}
                          value={item.cost ?? ""}
                          onChange={(e) =>
                            handleFinishingCostChange(item.name, e.target.value)
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Sheet Optimization Preview */}
            <div>
              <div className="py-1 border-t-1 border-gray-300" />
              <h5 className="font-semibold text-md text-gray-700 mb-3">
                Sheet Optimization Preview
              </h5>

              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                {/* Visual */}
                <div className="w-full md:w-2/3 h-56 bg-white border rounded-md p-3">
                  <div
                    className="w-full h-full bg-slate-50 rounded-md overflow-hidden grid"
                    style={{
                      gridTemplateColumns: `repeat(${Math.max(
                        layout.nx,
                        1
                      )}, 1fr)`,
                      gridTemplateRows: `repeat(${Math.max(
                        layout.ny,
                        1
                      )}, 1fr)`,
                      gap: "4px",
                    }}
                  >
                    {Array.from({ length: layout.itemsPerSheet || 0 }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="bg-blue-200 border border-blue-400 rounded-sm"
                        />
                      )
                    )}
                    {layout.itemsPerSheet === 0 && (
                      <div className="w-full h-full grid place-items-center text-sm text-slate-500">
                        Set paper & product size to preview layout
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail */}
                <div className="w-full md:w-1/3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sheet Size:</span>
                    <span className="font-semibold">
                      {sheetW ?? "–"} × {sheetH ?? "–"} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Usable (−0.5cm margin):
                    </span>
                    <span className="font-semibold">
                      {layout.usableW ? layout.usableW.toFixed(1) : "–"} ×{" "}
                      {layout.usableH ? layout.usableH.toFixed(1) : "–"} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Product + bleed (±0.5cm):
                    </span>
                    <span className="font-semibold">
                      {layout.prodWb ? layout.prodWb.toFixed(1) : "–"} ×{" "}
                      {layout.prodHb ? layout.prodHb.toFixed(1) : "–"} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fit (cols × rows):</span>
                    <span className="font-semibold">
                      {layout.nx} × {layout.ny}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items per Sheet:</span>
                    <span className="font-semibold">
                      {layout.itemsPerSheet}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{qty || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recommended Sheets:</span>
                    <span className="font-semibold">{recommendedSheets}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Efficiency:</span>
                    <span>{layout.efficiency.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ===== MODAL DETAIL BIAYA ===== */}
      <Dialog
        open={openIdx != null}
        onOpenChange={(o) => setOpenIdx(o ? openIdx : null)}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>
              {openData
                ? `Cost Details — ${openData.paper?.name || "Paper"} ${
                    openData.paper?.gsm || ""
                  }gsm`
                : "Cost Details"}
            </DialogTitle>
          </DialogHeader>

          {openData ? (
            <div className="space-y-4 text-sm">
              {/* spesifikasi ringkas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sheet WxH (cm)</span>
                  <span className="font-semibold">
                    {openData.op?.inputWidth ?? "—"} ×{" "}
                    {openData.op?.inputHeight ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Fit (cols × rows)
                  </span>
                  <span className="font-semibold">
                    {openData.calc?.layout.nx} × {openData.calc?.layout.ny}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items / Sheet</span>
                  <span className="font-semibold">
                    {openData.calc?.layout.itemsPerSheet}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Recommended Sheets
                  </span>
                  <span className="font-semibold">
                    {openData.calc?.recommendedSheets}
                  </span>
                </div>
              </div>

              {/* biaya kertas */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price / Packet</span>
                  <span className="font-semibold">
                    {openData.op?.pricePerPacket != null
                      ? fmt(openData.op.pricePerPacket)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sheets / Packet</span>
                  <span className="font-semibold">
                    {openData.op?.sheetsPerPacket ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price / Sheet</span>
                  <span className="font-semibold">
                    {openData.calc?.pricePerSheet != null
                      ? fmt(openData.calc.pricePerSheet)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entered Sheets</span>
                  <span className="font-semibold">
                    {openData.op?.enteredSheets ??
                      openData.calc?.recommendedSheets ??
                      0}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Paper Cost</span>
                  <span className="font-bold">
                    {fmt(
                      (openData.op?.enteredSheets ??
                        openData.calc?.recommendedSheets ??
                        0) * (openData.calc?.pricePerSheet ?? 0)
                    )}
                  </span>
                </div>
              </div>

              {/* finishing terpilih */}
              <div className="rounded-lg border p-3 space-y-2">
                <div className="font-medium mb-1">Selected Finishing</div>
                {formData.operational.finishing
                  .filter((f) => product.finishing.includes(f.name))
                  .map((f) => (
                    <div key={f.name} className="flex justify-between">
                      <span className="text-muted-foreground">{f.name}</span>
                      <span className="font-semibold">
                        {f.cost != null ? fmt(f.cost) : "—"}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Finishing Cost</span>
                  <span className="font-bold">
                    {fmt(
                      formData.operational.finishing
                        .filter((f) => product.finishing.includes(f.name))
                        .reduce((acc, f) => acc + (f.cost ?? 0), 0)
                    )}
                  </span>
                </div>
              </div>

              {/* plates & units */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plates</span>
                  <span className="font-semibold">{plates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Units</span>
                  <span className="font-semibold">{units}</span>
                </div>
              </div>

              {/* total base */}
              <div className="flex justify-between border-t pt-3 text-base">
                <span className="font-semibold">Estimated Base Cost</span>
                <span className="font-extrabold">
                  {fmt(
                    (openData.op?.enteredSheets ??
                      openData.calc?.recommendedSheets ??
                      0) *
                      (openData.calc?.pricePerSheet ?? 0) +
                      formData.operational.finishing
                        .filter((f) => product.finishing.includes(f.name))
                        .reduce((acc, f) => acc + (f.cost ?? 0), 0)
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data.</div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenIdx(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Step4Operational;
