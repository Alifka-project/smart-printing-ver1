"use client";

import type { FC, Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { QuoteFormData } from "@/types";

interface Step2Props {
  formData: QuoteFormData;
  setFormData: Dispatch<SetStateAction<QuoteFormData>>;
}

const Step2CustomerDetail: FC<Step2Props> = ({ formData, setFormData }) => {
  const client = formData.client;

  const setClient = (patch: Partial<typeof client>) =>
    setFormData((prev) => ({ ...prev, client: { ...prev.client, ...patch } }));

  return (
    <div className="space-y-8">
      <h3 className="font-bold text-2xl">Customer Detail</h3>

      {/* Client Type */}
      <RadioGroup
        value={client.clientType}
        onValueChange={(value) =>
          setClient(
            value === "Individual"
              ? { clientType: value as "Individual", companyName: "", role: "" }
              : { clientType: value as "Company" }
          )
        }
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Individual" id="r-individual" />
          <Label htmlFor="r-individual">Individual</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Company" id="r-company" />
          <Label htmlFor="r-company">Company</Label>
        </div>
      </RadioGroup>

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        {client.clientType === "Company" && (
          <div>
            <Label htmlFor="companyName" className="mb-2 block">
              Company Name:
            </Label>
            <Input
              id="companyName"
              value={client.companyName}
              onChange={(e) => setClient({ companyName: e.target.value })}
              placeholder="Enter company name"
              className="inputForm"
            />
          </div>
        )}

        <div>
          <Label htmlFor="email" className="mb-2 block">
            Email ID:
          </Label>
          <Input
            id="email"
            type="email"
            value={client.email}
            onChange={(e) => setClient({ email: e.target.value })}
            placeholder="Enter email address"
            className="inputForm"
          />
        </div>

        <div
          className={client.clientType === "Individual" ? "md:col-span-2" : ""}
        >
          <Label htmlFor="contactPerson" className="mb-2 block">
            Person Name:
          </Label>
          <Input
            id="contactPerson"
            value={client.contactPerson}
            onChange={(e) => setClient({ contactPerson: e.target.value })}
            placeholder="Enter person name"
            className="inputForm"
          />
        </div>

        <div
          className={client.clientType === "Individual" ? "md:col-span-2" : ""}
        >
          <Label htmlFor="role" className="mb-2 block">
            Company role
          </Label>
          <Input
            id="role"
            value={client.role}
            onChange={(e) => setClient({ role: e.target.value })}
            placeholder="Enter Company Role"
            className="inputForm"
          />
        </div>

        <div className="w-full">
          <Label htmlFor="countryCode" className="mb-2 block">
            Country Code:
          </Label>
          <Select
            value={client.countryCode}
            onValueChange={(value) => setClient({ countryCode: value })}
          >
            <SelectTrigger id="countryCode" className="w-full py-5  border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <SelectValue placeholder="Select code" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+971">971 (UAE)</SelectItem>
              <SelectItem value="+62">62 (Indonesia)</SelectItem>
              <SelectItem value="+1">1 (USA)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2 block">
            Phone Number:
          </Label>
          <Input
            id="phone"
            inputMode="tel"
            value={client.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d+]/g, "");
              setClient({ phone: v });
            }}
            placeholder="Enter phone number"
            className="inputForm"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2CustomerDetail;
