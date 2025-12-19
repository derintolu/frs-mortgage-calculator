import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { ToggleButton } from '../ui/toggle-button';
import { Home } from 'lucide-react';
import {
  calculateConventional,
  formatCurrency,
  formatPercent,
  type ConventionalInputs
} from '../../utils/mortgageCalculations';
import { ResultsCard } from './ResultsCard';
import { US_STATES, CREDIT_SCORES } from './constants';

interface ConventionalCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function ConventionalCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: ConventionalCalculatorProps = {}) {
  const [inputs, setInputs] = useState<ConventionalInputs>({
    homePrice: '' as any,
    downPayment: '' as any,
    interestRate: '' as any,
    loanTerm: '' as any,
    propertyTax: '' as any,
    insurance: '' as any,
    hoa: '' as any
  });

  const [downPaymentMode, setDownPaymentMode] = useState<'$' | '%'>('$');
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California
  const [creditScoreIndex, setCreditScoreIndex] = useState(5); // 740-759

  const results = calculateConventional(inputs);

  const handleDownPaymentChange = (value: number) => {
    if (downPaymentMode === '%') {
      const dollarAmount = (inputs.homePrice * value) / 100;
      setInputs({...inputs, downPayment: dollarAmount});
    } else {
      setInputs({...inputs, downPayment: value});
    }
  };

  const getDownPaymentDisplayValue = () => {
    if (downPaymentMode === '%') {
      return inputs.homePrice > 0 ? (inputs.downPayment / inputs.homePrice) * 100 : 0;
    }
    return inputs.downPayment;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MortgageInput
                label="Home Price"
                type="currency"
                value={inputs.homePrice}
                onChange={(val) => setInputs({...inputs, homePrice: val})}
                defaultValue={300000}
                brandColor={brandColor}
              />

              <MortgageInput
                label="Down Payment"
                type={downPaymentMode === '$' ? 'currency' : 'percent'}
                value={getDownPaymentDisplayValue()}
                onChange={handleDownPaymentChange}
                defaultValue={downPaymentMode === '$' ? 60000 : 20}
                brandColor={brandColor}
                rightElement={
                  <ToggleButton
                    options={['$', '%']}
                    value={downPaymentMode}
                    onChange={(val) => setDownPaymentMode(val as '$' | '%')}
                  />
                }
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
                value={inputs.interestRate}
                onChange={(val) => setInputs({...inputs, interestRate: val})}
                step="0.1"
                defaultValue={6.5}
                brandColor={brandColor}
              />

              <MortgageSelect
                label="Loan Term"
                value={String(inputs.loanTerm)}
                onChange={(val) => setInputs({...inputs, loanTerm: val})}
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
                value={inputs.propertyTax}
                onChange={(val) => setInputs({...inputs, propertyTax: val})}
                defaultValue={2000}
                brandColor={brandColor}
              />

              <MortgageInput
                label="Insurance (Annual)"
                type="currency"
                value={inputs.insurance}
                onChange={(val) => setInputs({...inputs, insurance: val})}
                defaultValue={1000}
                brandColor={brandColor}
              />

              <div className="md:col-span-2">
                <MortgageInput
                  label="HOA Fees (Monthly)"
                  type="currency"
                  value={inputs.hoa}
                  onChange={(val) => setInputs({...inputs, hoa: val})}
                  defaultValue={0}
                  brandColor={brandColor}
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {showButtons && ButtonsComponent && onEmailMe && onShare && (
          <ButtonsComponent
            onEmailMe={onEmailMe}
            onShare={onShare}
            brandColor={brandColor}
            results={{
              type: 'conventional',
              inputs: {
                homePrice: inputs.homePrice,
                downPayment: inputs.downPayment,
                interestRate: inputs.interestRate,
                loanTerm: inputs.loanTerm,
                propertyTax: inputs.propertyTax,
                insurance: inputs.insurance,
                hoa: inputs.hoa
              },
              outputs: results,
              summary: {
                title: 'Payment Calculator Results',
                primaryLabel: 'Monthly Payment',
                primaryValue: formatCurrency(results.monthlyPayment),
                items: [
                  { label: 'Principal & Interest', value: formatCurrency(results.principalAndInterest) },
                  ...(results.monthlyTax ? [{ label: 'Property Tax', value: formatCurrency(results.monthlyTax) }] : []),
                  ...(results.monthlyInsurance ? [{ label: 'Insurance', value: formatCurrency(results.monthlyInsurance) }] : []),
                  ...(results.monthlyHOA ? [{ label: 'HOA', value: formatCurrency(results.monthlyHOA) }] : []),
                  ...(results.monthlyPMI ? [{ label: 'PMI/MIP', value: formatCurrency(results.monthlyPMI) }] : []),
                  { label: 'Loan Amount', value: formatCurrency(results.loanAmount || 0) },
                  { label: 'Total Interest', value: formatCurrency(results.totalInterest) },
                  { label: 'Total Payment', value: formatCurrency(results.totalPayment) }
                ]
              }
            }}
          />
        )}
      </div>

      <ResultsCard results={results} />
    </div>
  );
}
