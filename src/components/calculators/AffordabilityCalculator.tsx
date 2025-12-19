import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Calculator } from 'lucide-react';
import {
  calculateAffordability,
  formatCurrency,
  type AffordabilityInputs
} from '../../utils/mortgageCalculations';
import { AffordabilityResultsCard } from './ResultsCard';
import { US_STATES, CREDIT_SCORES } from './constants';

interface AffordabilityCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function AffordabilityCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: AffordabilityCalculatorProps = {}) {
  const [inputs, setInputs] = useState<AffordabilityInputs>({
    monthlyIncome: '' as any,
    monthlyDebts: '' as any,
    downPayment: '' as any,
    interestRate: '' as any,
    loanTerm: '' as any,
    propertyTax: '' as any,
    insurance: '' as any
  });

  // Additional UI state for Goalee features
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California
  const [creditScoreIndex, setCreditScoreIndex] = useState(5); // 740-759

  const results = calculateAffordability(inputs);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              label="Monthly Income"
              type="currency"
              value={inputs.monthlyIncome}
              onChange={(val) => setInputs({...inputs, monthlyIncome: val})}
              defaultValue={6000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Monthly Debts"
              type="currency"
              value={inputs.monthlyDebts}
              onChange={(val) => setInputs({...inputs, monthlyDebts: val})}
              defaultValue={500}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Down Payment"
              type="currency"
              value={inputs.downPayment}
              onChange={(val) => setInputs({...inputs, downPayment: val})}
              defaultValue={50000}
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
              defaultValue={3000}
              brandColor={brandColor}
            />

            <div className="md:col-span-2">
              <MortgageInput
                label="Insurance (Annual)"
                type="currency"
                value={inputs.insurance}
                onChange={(val) => setInputs({...inputs, insurance: val})}
                defaultValue={1200}
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
              type: 'affordability',
              inputs,
              outputs: results,
              summary: {
                title: 'Affordability Calculator Results',
                primaryLabel: 'Maximum Home Price',
                primaryValue: formatCurrency(results.maxHomePrice),
                items: [
                  { label: 'Monthly Payment', value: formatCurrency(results.monthlyPayment) },
                  { label: 'Maximum Loan Amount', value: formatCurrency(results.maxLoanAmount) },
                  { label: 'Principal & Interest', value: formatCurrency(results.principalAndInterest) },
                  ...(results.monthlyTax ? [{ label: 'Property Tax', value: formatCurrency(results.monthlyTax) }] : []),
                  ...(results.monthlyInsurance ? [{ label: 'Insurance', value: formatCurrency(results.monthlyInsurance) }] : [])
                ]
              }
            }}
          />
        )}
      </div>

      <AffordabilityResultsCard results={results} />
    </div>
  );
}
