import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Home, DollarSign } from 'lucide-react';
import { US_STATES } from './constants';

interface NetProceedsCalculatorProps {
  showButtons?: boolean;
  onEmailMe?: () => void;
  onShare?: () => void;
  brandColor?: string;
  ButtonsComponent?: React.ComponentType<any>;
}

export function NetProceedsCalculator({
  showButtons = false,
  onEmailMe,
  onShare,
  brandColor = '#3b82f6',
  ButtonsComponent
}: NetProceedsCalculatorProps = {}) {
  const [salePrice, setSalePrice] = useState<number>(500000);
  const [mortgageBalance, setMortgageBalance] = useState<number>(300000);
  const [agentCommission, setAgentCommission] = useState<number>(6);
  const [closingCosts, setClosingCosts] = useState<number>(3);
  const [homeWarranty, setHomeWarranty] = useState<number>(500);
  const [repairs, setRepairs] = useState<number>(2000);
  const [propertytax, setPropertyTax] = useState<number>(0);
  const [propertyStateIndex, setPropertyStateIndex] = useState(4); // California

  // Calculate costs
  const commissionAmount = salePrice * (agentCommission / 100);
  const closingCostsAmount = salePrice * (closingCosts / 100);
  const totalCosts = commissionAmount + closingCostsAmount + homeWarranty + repairs + propertytax + mortgageBalance;
  const netProceeds = salePrice - totalCosts;

  // Calculate percentages for visualization
  const proceedsPercent = (netProceeds / salePrice) * 100;
  const mortgagePercent = (mortgageBalance / salePrice) * 100;
  const commissionPercent = agentCommission;
  const closingPercent = closingCosts;
  const otherPercent = ((homeWarranty + repairs + propertytax) / salePrice) * 100;

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
              Sale Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MortgageInput
              label="Sale Price"
              type="currency"
              value={salePrice}
              onChange={(val) => setSalePrice(val)}
              defaultValue={500000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Mortgage Balance"
              type="currency"
              value={mortgageBalance}
              onChange={(val) => setMortgageBalance(val)}
              defaultValue={300000}
              brandColor={brandColor}
            />

            <MortgageSelect
              label="Property State"
              value={String(propertyStateIndex)}
              onChange={(val) => setPropertyStateIndex(val)}
              options={US_STATES.map((state, idx) => ({ value: String(idx), label: state }))}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Agent Commission"
              type="percent"
              value={agentCommission}
              onChange={(val) => setAgentCommission(val)}
              step="0.5"
              defaultValue={6}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Closing Costs"
              type="percent"
              value={closingCosts}
              onChange={(val) => setClosingCosts(val)}
              step="0.5"
              defaultValue={3}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Home Warranty"
              type="currency"
              value={homeWarranty}
              onChange={(val) => setHomeWarranty(val)}
              defaultValue={500}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Repairs/Concessions"
              type="currency"
              value={repairs}
              onChange={(val) => setRepairs(val)}
              defaultValue={2000}
              brandColor={brandColor}
            />

            <MortgageInput
              label="Property Tax (Prorated)"
              type="currency"
              value={propertytax}
              onChange={(val) => setPropertyTax(val)}
              defaultValue={0}
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
          <CardTitle className="text-white">Net Proceeds</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-white">
          <div className="text-center pb-4 border-b border-white/20">
            <p className="text-sm opacity-90 mb-1">Estimated Net Proceeds</p>
            <p className="text-4xl font-bold mb-1">
              {formatCurrency(netProceeds)}
            </p>
            <p className="text-sm opacity-75">
              {formatPercent(proceedsPercent)} of sale price
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 pb-4 border-b border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4" />
              <p className="text-sm font-semibold">Cost Breakdown</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Sale Price</span>
                <span className="font-semibold">{formatCurrency(salePrice)}</span>
              </div>
              <div className="w-full bg-green-400 rounded-full h-2" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Mortgage Payoff ({formatPercent(mortgagePercent)})</span>
                <span className="font-semibold text-red-300">-{formatCurrency(mortgageBalance)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-red-400 h-full rounded-full"
                  style={{ width: `${mortgagePercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Agent Commission ({formatPercent(commissionPercent)})</span>
                <span className="font-semibold text-red-300">-{formatCurrency(commissionAmount)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-orange-400 h-full rounded-full"
                  style={{ width: `${commissionPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Closing Costs ({formatPercent(closingPercent)})</span>
                <span className="font-semibold text-red-300">-{formatCurrency(closingCostsAmount)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-full rounded-full"
                  style={{ width: `${closingPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Other Costs ({formatPercent(otherPercent)})</span>
                <span className="font-semibold text-red-300">-{formatCurrency(homeWarranty + repairs + propertytax)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-blue-400 h-full rounded-full"
                  style={{ width: `${otherPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Costs */}
          <div className="space-y-2">
            <p className="text-sm font-semibold mb-2">Itemized Costs</p>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Mortgage Balance</span>
              <span className="font-semibold">{formatCurrency(mortgageBalance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Agent Commission</span>
              <span className="font-semibold">{formatCurrency(commissionAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Closing Costs</span>
              <span className="font-semibold">{formatCurrency(closingCostsAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Home Warranty</span>
              <span className="font-semibold">{formatCurrency(homeWarranty)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Repairs/Concessions</span>
              <span className="font-semibold">{formatCurrency(repairs)}</span>
            </div>
            {propertytax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Property Tax</span>
                <span className="font-semibold">{formatCurrency(propertytax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10">
              <span>Total Costs</span>
              <span className="text-red-300">{formatCurrency(totalCosts)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs opacity-75 leading-relaxed">
              This estimate includes typical selling costs. Actual costs may vary based on your specific situation, local customs, and negotiations. Consult with a real estate professional for precise figures.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
