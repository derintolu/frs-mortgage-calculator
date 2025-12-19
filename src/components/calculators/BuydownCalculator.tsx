import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Home } from 'lucide-react';
import { US_STATES, CREDIT_SCORES } from './constants';

type BuydownType = '2-1' | '1-1' | '3-2-1' | '1-0';

interface BuydownCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function BuydownCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: BuydownCalculatorProps = {}) {
  const [homePrice, setHomePrice] = useState<number>(300000);
  const [downPayment, setDownPayment] = useState<number>(60000);
  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [buydownType, setBuydownType] = useState<BuydownType>('2-1');
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California
  const [creditScoreIndex, setCreditScoreIndex] = useState(5); // 740-759

  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;

  // Calculate standard payment
  const standardPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Calculate buydown payments
  const getBuydownPayments = () => {
    switch (buydownType) {
      case '2-1': {
        const year1Rate = (interestRate - 2) / 100 / 12;
        const year2Rate = (interestRate - 1) / 100 / 12;
        const year1Payment = loanAmount * (year1Rate * Math.pow(1 + year1Rate, numPayments)) / (Math.pow(1 + year1Rate, numPayments) - 1);
        const year2Payment = loanAmount * (year2Rate * Math.pow(1 + year2Rate, numPayments)) / (Math.pow(1 + year2Rate, numPayments) - 1);
        return {
          year1: year1Payment,
          year2: year2Payment,
          year3: standardPayment,
          savings: (standardPayment - year1Payment) * 12 + (standardPayment - year2Payment) * 12
        };
      }
      case '1-1': {
        const year1Rate = (interestRate - 1) / 100 / 12;
        const year1Payment = loanAmount * (year1Rate * Math.pow(1 + year1Rate, numPayments)) / (Math.pow(1 + year1Rate, numPayments) - 1);
        return {
          year1: year1Payment,
          year2: standardPayment,
          year3: standardPayment,
          savings: (standardPayment - year1Payment) * 12
        };
      }
      case '3-2-1': {
        const year1Rate = (interestRate - 3) / 100 / 12;
        const year2Rate = (interestRate - 2) / 100 / 12;
        const year3Rate = (interestRate - 1) / 100 / 12;
        const year1Payment = loanAmount * (year1Rate * Math.pow(1 + year1Rate, numPayments)) / (Math.pow(1 + year1Rate, numPayments) - 1);
        const year2Payment = loanAmount * (year2Rate * Math.pow(1 + year2Rate, numPayments)) / (Math.pow(1 + year2Rate, numPayments) - 1);
        const year3Payment = loanAmount * (year3Rate * Math.pow(1 + year3Rate, numPayments)) / (Math.pow(1 + year3Rate, numPayments) - 1);
        return {
          year1: year1Payment,
          year2: year2Payment,
          year3: year3Payment,
          savings: (standardPayment - year1Payment) * 12 + (standardPayment - year2Payment) * 12 + (standardPayment - year3Payment) * 12
        };
      }
      case '1-0': {
        const year1Rate = (interestRate - 1) / 100 / 12;
        const year1Payment = loanAmount * (year1Rate * Math.pow(1 + year1Rate, numPayments)) / (Math.pow(1 + year1Rate, numPayments) - 1);
        return {
          year1: year1Payment,
          year2: standardPayment,
          year3: standardPayment,
          savings: (standardPayment - year1Payment) * 12
        };
      }
    }
  };

  const buydownPayments = getBuydownPayments();
  const estimatedCost = buydownPayments.savings;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Buydown Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MortgageInput
              label="Home Price"
              type="currency"
              value={homePrice}
              onChange={(val) => setHomePrice(val)}
              defaultValue={300000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Down Payment"
              type="currency"
              value={downPayment}
              onChange={(val) => setDownPayment(val)}
              defaultValue={60000}
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

            <div className="md:col-span-2">
              <MortgageSelect
                label="Buydown Type"
                value={buydownType}
                onChange={(val) => setBuydownType(val as BuydownType)}
                options={[
                  { value: '2-1', label: '2-1 Buydown' },
                  { value: '1-1', label: '1-1 Buydown' },
                  { value: '3-2-1', label: '3-2-1 Buydown' },
                  { value: '1-0', label: '1-0 Buydown' }
                ]}
                brandColor={brandColor}
              />
            </div>
          </CardContent>
        </Card>

        {showButtons && ButtonsComponent && onEmailMe && onShare && (
          <ButtonsComponent
            onEmailMe={onEmailMe}
            onShare={onShare}
            brandColor={brandColor}
            results={{
              type: 'buydown',
              inputs: { homePrice, downPayment, interestRate, loanTerm, buydownType },
              outputs: { standardPayment, buydownPayments, buydownCost },
              summary: {
                title: 'Buydown Calculator Results',
                primaryLabel: 'Standard Payment',
                primaryValue: `$${standardPayment.toLocaleString()}`,
                items: [
                  { label: 'Buydown Type', value: buydownType },
                  { label: 'Year 1 Payment', value: `$${buydownPayments[0]?.toLocaleString() || 'N/A'}` },
                  { label: 'Buydown Cost', value: `$${buydownCost.toLocaleString()}` },
                  { label: 'Loan Amount', value: `$${(homePrice - downPayment).toLocaleString()}` }
                ]
              }
            }}
          />
        )}
      </div>

      {/* Results Card */}
      <Card className="h-fit" style={{
        background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)',
        color: '#ffffff'
      }}>
        <CardHeader className="bg-black/20">
          <CardTitle style={{ color: '#ffffff' }}>Buydown Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4" style={{ color: '#ffffff' }}>
          <div className="text-center pb-4 border-b border-white/20">
            <p className="text-sm opacity-90 mb-1">Standard Payment</p>
            <p className="text-4xl font-bold">
              {formatCurrency(standardPayment)}
            </p>
          </div>

          {/* Payment Visualization Bars */}
          <div className="space-y-3 pb-4 border-b border-white/20">
            <p className="text-sm font-semibold mb-3">Payment Schedule</p>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Year 1</span>
                <span className="font-semibold">{formatCurrency(buydownPayments.year1)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-full rounded-full"
                  style={{ width: `${(buydownPayments.year1 / standardPayment) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Year 2</span>
                <span className="font-semibold">{formatCurrency(buydownPayments.year2)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-full rounded-full"
                  style={{ width: `${(buydownPayments.year2 / standardPayment) * 100}%` }}
                />
              </div>
            </div>

            {buydownType === '3-2-1' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Year 3</span>
                  <span className="font-semibold">{formatCurrency(buydownPayments.year3)}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-full rounded-full"
                    style={{ width: `${(buydownPayments.year3 / standardPayment) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Year {buydownType === '3-2-1' ? '4+' : '3+'}</span>
                <span className="font-semibold">{formatCurrency(standardPayment)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Loan Amount</span>
              <span className="font-semibold">{formatCurrency(loanAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Total Savings</span>
              <span className="font-semibold text-green-300">{formatCurrency(buydownPayments.savings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Estimated Cost</span>
              <span className="font-semibold">{formatCurrency(estimatedCost)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs opacity-75 leading-relaxed">
              A {buydownType} buydown temporarily reduces your interest rate and monthly payments. The seller or builder typically pays for this upfront cost to make the home more affordable in the early years.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
