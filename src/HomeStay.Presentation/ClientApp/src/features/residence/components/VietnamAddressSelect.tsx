import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import {
  getVietnamWards,
  vietnamProvinces,
  type VietnamProvince,
  type VietnamWard,
} from "@/features/residence/services/vietnam-address-service";

type Option = VietnamProvince | VietnamWard;

type Props = {
  provinceCode: string;
  wardCode: string;
  onProvinceChange: (code: string) => void;
  onWardChange: (code: string) => void;
  className?: string;
  triggerClassName?: string;
};

function AddressCombobox({
  options,
  value,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  onChange,
  triggerClassName,
}: {
  options: Option[];
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  onChange: (code: string) => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between border-gray-200 px-3 text-left text-sm font-normal shadow-none",
            !selected && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <span className="truncate">{selected?.name ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.code}
                value={`${option.name} ${option.code}`}
                onSelect={() => {
                  onChange(option.code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 size-4", value === option.code ? "opacity-100" : "opacity-0")}
                />
                <span className="truncate">{option.name}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-xs font-medium text-gray-600">
      {children}<span className="ml-0.5 text-red-500"> *</span>
    </Label>
  );
}

export function VietnamAddressSelect({
  provinceCode,
  wardCode,
  onProvinceChange,
  onWardChange,
  className,
  triggerClassName,
}: Props) {
  const wards = getVietnamWards(provinceCode);

  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-3", className)}>
      <div className="space-y-1.5">
        <FieldLabel>Tỉnh / Thành phố</FieldLabel>
        <AddressCombobox
          options={vietnamProvinces}
          value={provinceCode}
          placeholder="Chọn Tỉnh/Thành phố"
          searchPlaceholder="Tìm tỉnh, thành phố..."
          emptyText="Không tìm thấy tỉnh, thành phố."
          triggerClassName={triggerClassName}
          onChange={(code) => {
            onProvinceChange(code);
            onWardChange("");
          }}
        />
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Xã / Phường / Đặc khu</FieldLabel>
        <AddressCombobox
          options={wards}
          value={wardCode}
          placeholder={provinceCode ? "Chọn Xã/Phường/Đặc khu" : "Chọn tỉnh trước"}
          searchPlaceholder="Tìm xã, phường, đặc khu..."
          emptyText="Không tìm thấy đơn vị cấp xã."
          disabled={!provinceCode}
          triggerClassName={triggerClassName}
          onChange={onWardChange}
        />
      </div>
    </div>
  );
}
