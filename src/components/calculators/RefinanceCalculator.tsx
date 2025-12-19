import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Calculator } from 'lucide-react';
import {
  calculateRefinance,
  type RefinanceInputs
} from '../../utils/mortgageCalculations';
import { RefinanceResultsCard } from './ResultsCard';
import { US_STATES, CREDIT_SCORES } from './constants';

interface RefinanceCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function RefinanceCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: RefinanceCalculatorProps = {}) {
  const [inputs, setInputs] = useState<RefinanceInputs>({
    currentLoanBalance: '' as any,
    currentInterestRate: '' as any,
    currentPayment: '' as any,
    newInterestRate: '' as any,
    newLoanTerm: '' as any,
    closingCosts: '' as any
  });

  // Additional UI state for Goalee features
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California
  const [creditScoreIndex, setCreditScoreIndex] = useState(5); // 740-759

  const results = calculateRefinance(inputs);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Refinance Details
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
              label="Current Balance"
              type="currency"
              value={inputs.currentLoanBalance}
              onChange={(val) => setInputs({...inputs, currentLoanBalance: val})}
              defaultValue={250000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Current Rate"
              type="percent"
              value={inputs.currentInterestRate}
              onChange={(val) => setInputs({...inputs, currentInterestRate: val})}
              step="0.1"
              defaultValue={7.5}
              brandColor={brandColor}
            />

            <div className="md:col-span-2">
              <MortgageInput
                label="Current Monthly Payment"
                type="currency"
                value={inputs.currentPayment}
                onChange={(val) => setInputs({...inputs, currentPayment: val})}
                defaultValue={1748}
                brandColor={brandColor}
              />
            </div>


            <MortgageInput
              label="New Rate"
              type="percent"
              value={inputs.newInterestRate}
              onChange={(val) => setInputs({...inputs, newInterestRate: val})}
              step="0.1"
              defaultValue={6.0}
              brandColor={brandColor}
            />

            <MortgageSelect
              label="New Term"
              value={String(inputs.newLoanTerm)}
              onChange={(val) => setInputs({...inputs, newLoanTerm: val})}
              options={[
                { value: '15', label: '15 years' },
                { value: '20', label: '20 years' },
                { value: '30', label: '30 years' }
              ]}
              brandColor={brandColor}
            />

            <div className="md:col-span-2">
              <MortgageInput
                label="Closing Costs"
                type="currency"
                value={inputs.closingCosts}
                onChange={(val) => setInputs({...inputs, closingCosts: val})}
                defaultValue={5000}
                brandColor={brandColor}
              />
            </div>
          </CardContent>
        </Card>

        {showButtons && ButtonsComponent && onEmailMe && onShare && (
          <ButtonsComponent onEmailMe={onEmailMe} onShare={onShare} brandColor={brandColor} />
        )}
      </div>

      <RefinanceResultsCard results={results} />
    </div>
  );
}
