import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Home, TrendingUp } from 'lucide-react';
import { US_STATES, CREDIT_SCORES } from './constants';

interface DSCRCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function DSCRCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: DSCRCalculatorProps = {}) {
  const [purchasePrice, setPurchasePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [monthlyRent, setMonthlyRent] = useState<number>(3000);
  const [propertyTax, setPropertyTax] = useState<number>(4000);
  const [insurance, setInsurance] = useState<number>(1500);
  const [hoa, setHOA] = useState<number>(0);
  const [maintenance, setMaintenance] = useState<number>(200);
  const [vacancyRate, setVacancyRate] = useState<number>(5);
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California
  const [creditScoreIndex, setCreditScoreIndex] = useState(5); // 740-759

  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  // Calculate monthly payment (P&I only)
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Calculate monthly expenses
  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;
  const totalMonthlyExpenses = monthlyPI + monthlyTax + monthlyInsurance + hoa + maintenance;

  // Calculate effective rental income (accounting for vacancy)
  const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate / 100);

  // Calculate DSCR
  const dscr = effectiveMonthlyRent / totalMonthlyExpenses;

  // Calculate annual metrics
  const annualRent = monthlyRent * 12;
  const annualExpenses = totalMonthlyExpenses * 12;
  const annualCashFlow = (effectiveMonthlyRent - totalMonthlyExpenses) * 12;
  const cashOnCashReturn = (annualCashFlow / downPayment) * 100;
  const capRate = ((annualRent - (annualExpenses - (monthlyPI * 12))) / purchasePrice) * 100;

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

  const getDSCRStatus = () => {
    if (dscr >= 1.25) return { text: 'Excellent', color: 'text-green-300' };
    if (dscr >= 1.0) return { text: 'Good', color: 'text-blue-300' };
    if (dscr >= 0.8) return { text: 'Fair', color: 'text-yellow-300' };
    return { text: 'Poor', color: 'text-red-300' };
  };

  const dscrStatus = getDSCRStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Investment Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MortgageInput
              label="Purchase Price"
              type="currency"
              value={purchasePrice}
              onChange={(val) => setPurchasePrice(val)}
              defaultValue={400000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Down Payment"
              type="currency"
              value={downPayment}
              onChange={(val) => setDownPayment(val)}
              defaultValue={100000}
              brandColor={brandColor}
            />

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

            <MortgageInput
              label="Interest Rate"
              type="percent"
              value={interestRate}
              onChange={(val) => setInterestRate(val)}
              step="0.1"
              defaultValue={7.5}
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
              label="Monthly Rent"
              type="currency"
              value={monthlyRent}
              onChange={(val) => setMonthlyRent(val)}
              defaultValue={3000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Vacancy Rate"
              type="percent"
              value={vacancyRate}
              onChange={(val) => setVacancyRate(val)}
              step="1"
              defaultValue={5}
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
          </CardContent>
        </Card>

        {showButtons && ButtonsComponent && onEmailMe && onShare && (
          <ButtonsComponent onEmailMe={onEmailMe} onShare={onShare} brandColor={brandColor} />
        )}
      </div>

      {/* Results Card */}
      <Card className="h-fit" style={{
        background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)'
      }}>
        <CardHeader className="bg-black/20">
          <CardTitle className="text-white">DSCR Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-white">
          <div className="text-center pb-4 border-b border-white/20">
            <p className="text-sm opacity-90 mb-1">Debt Service Coverage Ratio</p>
            <p className="text-5xl font-bold mb-2">
              {dscr.toFixed(2)}x
            </p>
            <p className={`text-sm font-semibold ${dscrStatus.color}`}>
              {dscrStatus.text}
            </p>
          </div>

          {/* DSCR Gauge */}
          <div className="pb-4 border-b border-white/20">
            <div className="flex justify-between text-xs mb-2 opacity-75">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-400 via-yellow-300 via-blue-300 to-green-300 h-full rounded-full transition-all relative"
                style={{ width: '100%' }}
              >
                <div
                  className="absolute top-0 h-full w-1 bg-white shadow-lg"
                  style={{
                    left: `${Math.min(Math.max((dscr / 2) * 100, 0), 100)}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1 opacity-75">
              <span>0.5</span>
              <span>1.0</span>
              <span>1.5</span>
              <span>2.0</span>
            </div>
          </div>

          <div className="space-y-3 pb-4 border-b border-white/20">
            <p className="text-sm font-semibold mb-2">Monthly Cash Flow</p>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Rental Income</span>
              <span className="font-semibold">{formatCurrency(monthlyRent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Vacancy Loss</span>
              <span className="font-semibold text-red-300">-{formatCurrency(monthlyRent * (vacancyRate / 100))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Effective Income</span>
              <span className="font-semibold">{formatCurrency(effectiveMonthlyRent)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-white/10">
              <span className="opacity-90">Total Expenses</span>
              <span className="font-semibold text-red-300">-{formatCurrency(totalMonthlyExpenses)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10">
              <span>Net Cash Flow</span>
              <span className={annualCashFlow >= 0 ? 'text-green-300' : 'text-red-300'}>
                {formatCurrency((effectiveMonthlyRent - totalMonthlyExpenses))}
              </span>
            </div>
          </div>

          {/* Return Metrics Card */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-semibold">Return Metrics</p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Cash-on-Cash Return</span>
              <span className="font-semibold">{formatPercent(cashOnCashReturn)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Cap Rate</span>
              <span className="font-semibold">{formatPercent(capRate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Annual Cash Flow</span>
              <span className={`font-semibold ${annualCashFlow >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(annualCashFlow)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs opacity-75 leading-relaxed">
              DSCR (Debt Service Coverage Ratio) measures the property&apos;s ability to cover debt payments with rental income. Lenders typically require a minimum DSCR of 1.0-1.25 for investment property loans.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
