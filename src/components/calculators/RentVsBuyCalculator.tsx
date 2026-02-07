import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Home, TrendingUp } from 'lucide-react';
import { US_STATES, CREDIT_SCORES } from './constants';

interface RentVsBuyCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function RentVsBuyCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: RentVsBuyCalculatorProps = {}) {
  // Buy inputs
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000);
  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [propertyTax, setPropertyTax] = useState<number>(4000);
  const [insurance, setInsurance] = useState<number>(1500);
  const [hoa, setHOA] = useState<number>(0);
  const [maintenance, setMaintenance] = useState<number>(200);
  const [homeAppreciation, setHomeAppreciation] = useState<number>(3);

  // Rent inputs
  const [monthlyRent, setMonthlyRent] = useState<number>(2500);
  const [renterInsurance, setRenterInsurance] = useState<number>(200);
  const [rentIncrease, setRentIncrease] = useState<number>(3);

  // Other inputs
  const [yearsToCompare, setYearsToCompare] = useState<number>(10);
  const [investmentReturn, setInvestmentReturn] = useState<number>(7);
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California
  const [creditScoreIndex, setCreditScoreIndex] = useState(5); // 740-759

  // Calculate buying costs
  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;
  const totalMonthlyBuyCost = monthlyPI + monthlyTax + monthlyInsurance + hoa + maintenance;

  // Calculate total costs over time period
  let totalBuyCosts = downPayment;
  let totalRentCosts = 0;
  let currentHomeValue = homePrice;
  let currentRent = monthlyRent;
  let investedSavings = 0;

  for (let year = 1; year <= yearsToCompare; year++) {
    // Buy costs
    totalBuyCosts += totalMonthlyBuyCost * 12;

    // Rent costs
    totalRentCosts += currentRent * 12 + renterInsurance;
    currentRent *= (1 + rentIncrease / 100);

    // Home appreciation
    currentHomeValue *= (1 + homeAppreciation / 100);

    // Investment of down payment difference for renters
    if (year === 1) {
      investedSavings = downPayment;
    }
    investedSavings *= (1 + investmentReturn / 100);
    investedSavings += (totalMonthlyBuyCost - (monthlyRent + renterInsurance / 12)) * 12;
  }

  // Calculate equity built
  const remainingBalance = loanAmount * Math.pow(1 + monthlyRate, yearsToCompare * 12) -
    monthlyPI * ((Math.pow(1 + monthlyRate, yearsToCompare * 12) - 1) / monthlyRate);
  const equityBuilt = currentHomeValue - Math.max(remainingBalance, 0);

  // Net position
  const buyNetPosition = equityBuilt - totalBuyCosts;
  const rentNetPosition = investedSavings - totalRentCosts;

  const netDifference = buyNetPosition - rentNetPosition;
  const buyIsBetter = netDifference > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (amount: number) => {
    return `${amount.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Comparison Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buy Section */}
            <div className="pb-4 border-b">
              <h3 className="text-sm font-semibold mb-4">Buying</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MortgageInput
                  label="Home Price"
                  type="currency"
                  value={homePrice}
                  onChange={(val) => setHomePrice(val)}
                  defaultValue={400000}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Down Payment"
                  type="currency"
                  value={downPayment}
                  onChange={(val) => setDownPayment(val)}
                  defaultValue={80000}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Interest Rate"
                  type="percent"
                  value={interestRate}
                  onChange={(val) => setInterestRate(val)}
                  step="0.1"
                  defaultValue={7.0}
                  brandColor={brandColor}
                />
                <MortgageSelect
                  label="Loan Term"
                  value={String(loanTerm)}
                  onChange={(val) => setLoanTerm(Number(val))}
                  options={[
                    { value: '15', label: '15 years' },
                    { value: '20', label: '20 years' },
                    { value: '30', label: '30 years' }
                  ]}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Property Tax (Annual)"
                  type="currency"
                  value={propertyTax}
                  onChange={(val) => setPropertyTax(val)}
                  defaultValue={4000}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Insurance (Annual)"
                  type="currency"
                  value={insurance}
                  onChange={(val) => setInsurance(val)}
                  defaultValue={1500}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="HOA Fees (Monthly)"
                  type="currency"
                  value={hoa}
                  onChange={(val) => setHOA(val)}
                  defaultValue={0}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Maintenance (Monthly)"
                  type="currency"
                  value={maintenance}
                  onChange={(val) => setMaintenance(val)}
                  defaultValue={200}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Home Appreciation"
                  type="percent"
                  value={homeAppreciation}
                  onChange={(val) => setHomeAppreciation(val)}
                  step="0.5"
                  defaultValue={3}
                  brandColor={brandColor}
                />
              </div>
            </div>

            {/* Rent Section */}
            <div className="pb-4 border-b">
              <h3 className="text-sm font-semibold mb-4">Renting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MortgageInput
                  label="Monthly Rent"
                  type="currency"
                  value={monthlyRent}
                  onChange={(val) => setMonthlyRent(val)}
                  defaultValue={2500}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Renter's Insurance (Annual)"
                  type="currency"
                  value={renterInsurance}
                  onChange={(val) => setRenterInsurance(val)}
                  defaultValue={200}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Annual Rent Increase"
                  type="percent"
                  value={rentIncrease}
                  onChange={(val) => setRentIncrease(val)}
                  step="0.5"
                  defaultValue={3}
                  brandColor={brandColor}
                />
                <MortgageInput
                  label="Investment Return"
                  type="percent"
                  value={investmentReturn}
                  onChange={(val) => setInvestmentReturn(val)}
                  step="0.5"
                  defaultValue={7}
                  brandColor={brandColor}
                />
              </div>
            </div>

            {/* Other Inputs */}
            <div>
              <h3 className="text-sm font-semibold mb-4">General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MortgageSelect
                  label="Property State"
                  value={String(propertyStateIndex)}
                  onChange={(val) => setPropertyStateIndex(val)}
                  options={US_STATES.map((state, idx) => ({ value: String(idx), label: state }))}
                  brandColor={brandColor}
                />
                <MortgageSelect
                  label="Credit Score"
                  value={String(creditScoreIndex)}
                  onChange={(val) => setCreditScoreIndex(val)}
                  options={CREDIT_SCORES.map((score, idx) => ({ value: String(idx), label: score.label }))}
                  brandColor={brandColor}
                />
                <MortgageSelect
                  label="Years to Compare"
                  value={String(yearsToCompare)}
                  onChange={(val) => setYearsToCompare(Number(val))}
                  options={[
                    { value: '5', label: '5 years' },
                    { value: '10', label: '10 years' },
                    { value: '15', label: '15 years' },
                    { value: '20', label: '20 years' },
                    { value: '30', label: '30 years' }
                  ]}
                  brandColor={brandColor}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {showButtons && ButtonsComponent && onEmailMe && onShare && (
          <ButtonsComponent onEmailMe={onEmailMe} onShare={onShare} brandColor={brandColor} />
        )}
      </div>

      {/* Results Card */}
      <Card className="h-fit" style={{
        background: 'var(--gradient-hero)',
      }}>
        <CardHeader className="bg-black/20">
          <CardTitle style={{ color: '#ffffff' }}>Comparison Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4" style={{ color: 'var(--brand-dark-navy)' }}>
          <div className="text-center pb-4 border-b border-black/10">
            <p className="text-sm mb-1">After {yearsToCompare} years</p>
            <p className={`text-4xl font-bold mb-2 ${buyIsBetter ? 'text-green-800' : 'text-blue-800'}`}>
              {buyIsBetter ? 'Buying' : 'Renting'}
            </p>
            <p className="text-sm">
              is better by {formatCurrency(Math.abs(netDifference))}
            </p>
          </div>

          {/* Monthly Costs */}
          <div className="space-y-3 pb-4 border-b border-black/10">
            <p className="text-sm font-semibold mb-2">Monthly Costs</p>
            <div className="flex justify-between text-sm">
              <span>Buying (Month 1)</span>
              <span className="font-semibold">{formatCurrency(totalMonthlyBuyCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Renting (Month 1)</span>
              <span className="font-semibold">{formatCurrency(monthlyRent + renterInsurance / 12)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-black/10">
              <span>Difference</span>
              <span className={`font-semibold ${totalMonthlyBuyCost > monthlyRent ? 'text-red-800' : 'text-green-800'}`}>
                {formatCurrency(Math.abs(totalMonthlyBuyCost - monthlyRent))}
              </span>
            </div>
          </div>

          {/* Buying Position */}
          <div className="space-y-2 pb-4 border-b border-black/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-semibold">Buying Position</p>
            </div>
            <div className="flex justify-between text-sm">
              <span>Home Value</span>
              <span className="font-semibold text-green-800">{formatCurrency(currentHomeValue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining Loan</span>
              <span className="font-semibold text-red-800">-{formatCurrency(Math.max(remainingBalance, 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Costs</span>
              <span className="font-semibold text-red-800">-{formatCurrency(totalBuyCosts)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-black/10">
              <span>Net Position</span>
              <span className={buyNetPosition >= 0 ? 'text-green-800' : 'text-red-800'}>
                {formatCurrency(buyNetPosition)}
              </span>
            </div>
          </div>

          {/* Renting Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-semibold">Renting Position</p>
            </div>
            <div className="flex justify-between text-sm">
              <span>Invested Savings</span>
              <span className="font-semibold text-green-800">{formatCurrency(investedSavings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Rent Paid</span>
              <span className="font-semibold text-red-800">-{formatCurrency(totalRentCosts)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-black/10">
              <span>Net Position</span>
              <span className={rentNetPosition >= 0 ? 'text-green-800' : 'text-red-800'}>
                {formatCurrency(rentNetPosition)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-black/10">
            <p className="text-xs leading-relaxed">
              This comparison assumes the renter invests the down payment and any monthly savings. Results depend heavily on home appreciation, investment returns, and length of ownership. Consider lifestyle factors beyond financial calculations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
