import * as React from "react"
import { FloatingInput } from "./floating-input"
import { CircleDollarSign, Percent } from "lucide-react"

export interface MortgageInputProps {
  label: string
  type: "currency" | "percent" | "number"
  value: number | string
  onChange: (value: number) => void
  step?: string
  min?: number
  defaultValue?: number
  rightElement?: React.ReactNode
  brandColor?: string
}

export function MortgageInput({
  label,
  type,
  value,
  onChange,
  step,
  min,
  defaultValue = 0,
  rightElement,
  brandColor
}: MortgageInputProps) {
  const handleFocus = () => {
    if (value === '' || value === 0) {
      onChange(defaultValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const icon = type === "currency"
    ? <CircleDollarSign className="h-4 w-4" />
    : type === "percent"
    ? <Percent className="h-4 w-4" />
    : undefined;

  return (
    <FloatingInput
      label={label}
      type="number"
      icon={icon}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      step={step}
      min={min}
      rightElement={rightElement}
      brandColor={brandColor}
    />
  );
}
