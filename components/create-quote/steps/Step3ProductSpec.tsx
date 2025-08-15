"use client";

import type { FC, Dispatch, SetStateAction } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { QuoteFormData, Paper, Product } from "@/types";

// helper product kosong (sesuai tipe Product)
const createEmptyProduct = (): Product => ({
  productName: "",
  paperName: "",
  quantity: 100,
  sides: "1",
  printingSelection: "Digital",
  flatSize: { width: 9, height: 5.5, spine: 0 },
  closeSize: { width: 9, height: 5.5, spine: 0 },
  useSameAsFlat: true,
  papers: [{ name: "", gsm: "" }],
  finishing: [],
});

interface Step3Props {
  formData: QuoteFormData;
  setFormData: Dispatch<SetStateAction<QuoteFormData>>;
}

const Step3ProductSpec: FC<Step3Props> = ({ formData, setFormData }) => {
  const updateProduct = (idx: number, patch: Partial<Product>) => {
    const next = [...formData.products];
    next[idx] = { ...next[idx], ...patch };
    setFormData((prev): QuoteFormData => ({ ...prev, products: next }));
  };

  const handleSizeChange = (
    idx: number,
    sizeType: "flatSize" | "closeSize",
    dimension: "width" | "height" | "spine",
    value: string
  ) => {
    const p = formData.products[idx];
    const newSize = {
      ...p[sizeType],
      [dimension]: value !== "" ? parseFloat(value) : null,
    };
    updateProduct(idx, { [sizeType]: newSize } as Partial<Product>);
    if (sizeType === "flatSize" && p.useSameAsFlat) {
      updateProduct(idx, { closeSize: newSize } as Partial<Product>);
    }
  };

  // paper
  const handlePaperChange = (
    pIdx: number,
    paperIdx: number,
    field: keyof Paper,
    value: string
  ) => {
    const product = formData.products[pIdx];
    const newPapers = [...product.papers];
    newPapers[paperIdx] = { ...newPapers[paperIdx], [field]: value };
    updateProduct(pIdx, { papers: newPapers });
  };

  const addPaper = (pIdx: number) => {
    const product = formData.products[pIdx];
    updateProduct(pIdx, { papers: [...product.papers, { name: "", gsm: "" }] });
  };

  const removePaper = (pIdx: number, paperIdx: number) => {
    const product = formData.products[pIdx];
    if (product.papers.length <= 1) return;
    updateProduct(pIdx, {
      papers: product.papers.filter((_, i) => i !== paperIdx),
    });
  };

  // finishing
  const toggleFinishing = (pIdx: number, option: string) => {
    const product = formData.products[pIdx];
    const finishing = product.finishing.includes(option)
      ? product.finishing.filter((x) => x !== option)
      : [...product.finishing, option];
    updateProduct(pIdx, { finishing });
  };

  // add/remove product
  const addProduct = () => {
    setFormData(
      (prev): QuoteFormData => ({
        ...prev,
        products: [...prev.products, createEmptyProduct()],
      })
    );
  };

  const removeProduct = (idx: number) => {
    if (formData.products.length <= 1) return;
    setFormData(
      (prev): QuoteFormData => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== idx),
      })
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-2xl">Product Specification</h3>
      <div className="py-1 border-t-1 border-gray-300" />
      {formData.products.map((product, idx) => (
        <div key={idx} className=" space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg text-gray-800">
              {product.productName ? product.productName : `Product ${idx + 1}`}
            </h4>
            {formData.products.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(idx)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </Button>
            )}
          </div>

          {/* Product Name, Quantity, Sides, Printing */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Product Name:</Label>
              <Select
                value={product.productName}
                onValueChange={(v) => updateProduct(idx, { productName: v })}
              >
                <SelectTrigger className="w-full px-4 py-5 bg-white shadow-none border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business Card">Business Card</SelectItem>
                  <SelectItem value="Flyer A5">Flyer A5</SelectItem>{" "}
                  <SelectItem value="Brochure">Brochure</SelectItem>{" "}
                  <SelectItem value="Book">Book</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Quantity:</Label>
              <Input
                type="number"
                min={1}
                placeholder="100"
                className="inputForm"
                value={product.quantity ?? ""}
                onChange={(e) =>
                  updateProduct(idx, {
                    quantity: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block">Sides:</Label>
              <Select
                value={product.sides}
                onValueChange={(v) =>
                  updateProduct(idx, { sides: v as "1" | "2" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Side</SelectItem>
                  <SelectItem value="2">2 Sides</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Printing Selection:</Label>
              <Select
                value={product.printingSelection}
                onValueChange={(v) =>
                  updateProduct(idx, {
                    printingSelection: v as Product["printingSelection"],
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Printing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Offset">Offset</SelectItem>
                  <SelectItem value="Either">Either</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size Details */}
          <div>
            <div className="py-1 border-t-1 border-gray-300" />
            <h5 className="font-semibold text-md text-gray-700 mb-3">
              Size Details (cm)
            </h5>
            <div className="grid md:grid-cols-1 gap-6">
              <div>
                <Label className="mb-2 block">Flat Size</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="mt-2 space-y-2">
                    <Label>Width</Label>
                    <Input
                      type="number"
                      placeholder="Width"
                      className="inputForm"
                      min={0}
                      value={product.flatSize.width ?? ""}
                      onChange={(e) =>
                        handleSizeChange(
                          idx,
                          "flatSize",
                          "width",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="mt-2 space-y-2">
                    <Label>Height</Label>
                    <Input
                      type="number"
                      placeholder="Height"
                      className="inputForm"
                      min={0}
                      value={product.flatSize.height ?? ""}
                      onChange={(e) =>
                        handleSizeChange(
                          idx,
                          "flatSize",
                          "height",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="mt-2 space-y-2">
                    <Label>Spine</Label>
                    <Input
                      type="number"
                      placeholder="Spine"
                      className="inputForm"
                      value={product.flatSize.spine ?? ""}
                      min={0}
                      onChange={(e) =>
                        handleSizeChange(
                          idx,
                          "flatSize",
                          "spine",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-auto mt-3">
              <Checkbox
                id={`same-${idx}`}
                checked={product.useSameAsFlat}
                onCheckedChange={(checked) =>
                  updateProduct(idx, {
                    useSameAsFlat: Boolean(checked),
                    closeSize: Boolean(checked)
                      ? product.flatSize
                      : product.closeSize,
                  })
                }
              />
              <Label htmlFor={`same-${idx}`} className="font-normal">
                Use same as Flat size
              </Label>
            </div>
          </div>

          {/* Paper Details */}
          <div>
            <div className="py-1 border-t-1 border-gray-300" />
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-semibold text-md text-gray-700">
                Paper Details
              </h5>
            </div>
            <Button
              variant="outline"
              className="border-1 border-[#2563EB] mb-4"
              size="sm"
              onClick={() => addPaper(idx)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Paper
            </Button>
            <div className="space-y-4">
              {product.papers.map((paper, pIndex) => (
                <div
                  key={pIndex}
                  className="grid md:grid-cols-2 gap-4 items-end border p-4 rounded-md"
                >
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Paper Name:</Label>
                      <Input
                        placeholder="e.g. Art Paper"
                        className="inputForm"
                        value={paper.name}
                        onChange={(e) =>
                          handlePaperChange(idx, pIndex, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">GSM:</Label>
                      <Input
                        placeholder="e.g. 150"
                        className="inputForm"
                        value={paper.gsm}
                        onChange={(e) =>
                          handlePaperChange(idx, pIndex, "gsm", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {product.papers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePaper(idx, pIndex)}
                      className="text-red-500 hover:text-red-600"
                      title="Remove paper"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Finishing Options */}
          <div>
            <div className="py-1 border-t-1 border-gray-300" />
            <h5 className="font-semibold text-md text-gray-700 mb-3">
              Finishing Options
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "UV Spot",
                "Foil Stamping",
                "Embossing",
                "Lamination",
                "Die Cutting",
              ].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fin-${idx}-${option}`}
                    checked={product.finishing.includes(option)}
                    onCheckedChange={() => toggleFinishing(idx, option)}
                  />
                  <Label
                    htmlFor={`fin-${idx}-${option}`}
                    className="font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="py-1 border-t-1 border-gray-300" />
      {/* Add Product */}
      <Button
        variant="outline"
        className="py-5 border-[#2563EB] border-dashed"
        onClick={addProduct}
      >
        <Plus className="h-4 w-4 mr-2" /> Add Product
      </Button>
    </div>
  );
};

export default Step3ProductSpec;
