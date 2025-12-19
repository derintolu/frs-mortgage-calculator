import * as React from "react"
import { FloatingSelect, FloatingSelectItem } from "./floating-select"
import { Calendar } from "lucide-react"

export interface MortgageSelectProps {
  label: string
  value: string
  onChange: (value: number) => void
  options: { value: string; label: string }[]
  brandColor?: string
}

export function MortgageSelect({
  label,
  value,
  onChange,
  options,
  brandColor
}: MortgageSelectProps) {
  const handleChange = (val: string) => {
    onChange(Number(val));
  };

  return (
    <FloatingSelect
      label={label}
      value={value}
      onValueChange={handleChange}
      icon={<Calendar className="h-4 w-4" />}
      placeholder={label}
      brandColor={brandColor}
    >
      {options.map((option) => (
        <FloatingSelectItem key={option.value} value={option.value}>
          {option.label}
        </FloatingSelectItem>
      ))}
    </FloatingSelect>
  );
}
