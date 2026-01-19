/**
 * Mortgage calculation utilities
 */

export interface ConventionalInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTax?: number;
  insurance?: number;
  hoa?: number;
}

export interface VAInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  vaFundingFeePercent?: number;
  propertyTax?: number;
  insurance?: number;
}

export interface FHAInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  upfrontMIP?: number;
  annualMIP?: number;
  propertyTax?: number;
  insurance?: number;
}

export interface RefinanceInputs {
  currentLoanBalance: number;
  currentInterestRate: number;
  currentPayment: number;
  newInterestRate: number;
  newLoanTerm: number;
  closingCosts: number;
}

export interface AffordabilityInputs {
  monthlyIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  propertyTax?: number;
  insurance?: number;
}

export interface CalculationResults {
  monthlyPayment: number;
  principalAndInterest: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount?: number;
  monthlyTax?: number;
  monthlyInsurance?: number;
  monthlyHOA?: number;
  monthlyPMI?: number;
  downPaymentPercent?: number;
}

/**
 * Calculate conventional mortgage
 */
export function calculateConventional(inputs: ConventionalInputs): CalculationResults {
  const { homePrice, downPayment, interestRate, loanTerm, propertyTax = 0, insurance = 0, hoa = 0 } = inputs;

  const principal = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = principal / numberOfPayments;
  } else {
    monthlyPI = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalInterest = (monthlyPI * numberOfPayments) - principal;
  const totalPayment = monthlyPI * numberOfPayments;

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  // Calculate PMI if down payment < 20%
  const downPaymentPercent = (downPayment / homePrice) * 100;
  const monthlyPMI = downPaymentPercent < 20 ? (principal * 0.005 / 12) : 0;

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoa + monthlyPMI;

  return {
    monthlyPayment: totalMonthly,
    principalAndInterest: monthlyPI,
    totalInterest,
    totalPayment,
    loanAmount: principal,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA: hoa,
    monthlyPMI,
    downPaymentPercent
  };
}

/**
 * Calculate VA mortgage
 */
export function calculateVA(inputs: VAInputs): CalculationResults {
  const {
    homePrice,
    downPayment = 0,
    interestRate,
    loanTerm,
    vaFundingFeePercent = 2.3,
    propertyTax = 0,
    insurance = 0
  } = inputs;

  const principal = homePrice - downPayment;
  const fundingFee = principal * (vaFundingFeePercent / 100);
  const totalLoanAmount = principal + fundingFee;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = totalLoanAmount / numberOfPayments;
  } else {
    monthlyPI = (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalInterest = (monthlyPI * numberOfPayments) - totalLoanAmount;
  const totalPayment = monthlyPI * numberOfPayments;

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance;

  return {
    monthlyPayment: totalMonthly,
    principalAndInterest: monthlyPI,
    totalInterest,
    totalPayment,
    loanAmount: totalLoanAmount,
    monthlyTax,
    monthlyInsurance,
    monthlyPMI: 0, // VA loans don't have PMI
    downPaymentPercent: (downPayment / homePrice) * 100
  };
}

/**
 * Calculate FHA mortgage
 */
export function calculateFHA(inputs: FHAInputs): CalculationResults {
  const {
    homePrice,
    downPayment,
    interestRate,
    loanTerm,
    upfrontMIP = 1.75,
    annualMIP = 0.85,
    propertyTax = 0,
    insurance = 0
  } = inputs;

  const principal = homePrice - downPayment;
  const upfrontMIPAmount = principal * (upfrontMIP / 100);
  const totalLoanAmount = principal + upfrontMIPAmount;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPI: number;
  if (monthlyRate === 0) {
    monthlyPI = totalLoanAmount / numberOfPayments;
  } else {
    monthlyPI = (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const monthlyMIP = (principal * (annualMIP / 100)) / 12;

  const totalInterest = (monthlyPI * numberOfPayments) - totalLoanAmount;
  const totalPayment = monthlyPI * numberOfPayments;

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly = monthlyPI + monthlyMIP + monthlyTax + monthlyInsurance;

  return {
    monthlyPayment: totalMonthly,
    principalAndInterest: monthlyPI,
    totalInterest,
    totalPayment,
    loanAmount: totalLoanAmount,
    monthlyTax,
    monthlyInsurance,
    monthlyPMI: monthlyMIP, // FHA uses MIP instead of PMI
    downPaymentPercent: (downPayment / homePrice) * 100
  };
}

/**
 * Calculate refinance savings
 */
export function calculateRefinance(inputs: RefinanceInputs): CalculationResults & {
  monthlySavings: number;
  breakEvenMonths: number;
  lifetimeSavings: number;
} {
  const {
    currentLoanBalance,
    currentInterestRate,
    currentPayment,
    newInterestRate,
    newLoanTerm,
    closingCosts
  } = inputs;

  const monthlyRate = newInterestRate / 100 / 12;
  const numberOfPayments = newLoanTerm * 12;

  let newMonthlyPI: number;
  if (monthlyRate === 0) {
    newMonthlyPI = currentLoanBalance / numberOfPayments;
  } else {
    newMonthlyPI = (currentLoanBalance * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalInterest = (newMonthlyPI * numberOfPayments) - currentLoanBalance;
  const totalPayment = newMonthlyPI * numberOfPayments;

  const monthlySavings = currentPayment - newMonthlyPI;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : 0;
  const lifetimeSavings = (monthlySavings * numberOfPayments) - closingCosts;

  return {
    monthlyPayment: newMonthlyPI,
    principalAndInterest: newMonthlyPI,
    totalInterest,
    totalPayment,
    loanAmount: currentLoanBalance,
    monthlySavings,
    breakEvenMonths,
    lifetimeSavings
  };
}

/**
 * Calculate affordability (max home price)
 */
export function calculateAffordability(inputs: AffordabilityInputs): CalculationResults & {
  maxHomePrice: number;
  maxLoanAmount: number;
} {
  const {
    monthlyIncome,
    monthlyDebts,
    downPayment,
    interestRate,
    loanTerm,
    propertyTax = 0,
    insurance = 0
  } = inputs;

  // Use 28% front-end ratio (housing) and 36% back-end ratio (total debt)
  const maxHousingPayment = monthlyIncome * 0.28;
  const maxTotalPayment = monthlyIncome * 0.36;
  const availableForHousing = Math.min(maxHousingPayment, maxTotalPayment - monthlyDebts);

  // Subtract property tax and insurance from available payment
  const monthlyTax = propertyTax / 12;
  const monthlyIns = insurance / 12;
  const availableForPI = availableForHousing - monthlyTax - monthlyIns;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Calculate max loan amount
  let maxLoanAmount: number;
  if (monthlyRate === 0) {
    maxLoanAmount = availableForPI * numberOfPayments;
  } else {
    maxLoanAmount = availableForPI * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
  }

  const maxHomePrice = maxLoanAmount + downPayment;

  const totalInterest = (availableForPI * numberOfPayments) - maxLoanAmount;
  const totalPayment = availableForPI * numberOfPayments;

  return {
    monthlyPayment: availableForPI + monthlyTax + monthlyIns,
    principalAndInterest: availableForPI,
    totalInterest,
    totalPayment,
    loanAmount: maxLoanAmount,
    monthlyTax,
    monthlyInsurance: monthlyIns,
    maxHomePrice,
    maxLoanAmount,
    downPaymentPercent: (downPayment / maxHomePrice) * 100
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with cents
 */
export function formatCurrencyWithCents(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}
