import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  calculateRefinance,
  calculateAffordability,
  formatCurrency,
  formatCurrencyWithCents,
  formatPercent,
  type CalculationResults
} from '../../utils/mortgageCalculations';

// Results Card Component
export function ResultsCard({ results }: { results: CalculationResults }) {
  const hasData = results.monthlyPayment > 0;

  // Prepare data for pie chart — colors reference CSS custom properties
  const chartColors = typeof window !== 'undefined' ? (() => {
    const styles = getComputedStyle(document.documentElement);
    return [
      styles.getPropertyValue('--chart-1').trim() || '#667eea',
      styles.getPropertyValue('--chart-2').trim() || '#764ba2',
      styles.getPropertyValue('--chart-3').trim() || '#f093fb',
      styles.getPropertyValue('--chart-4').trim() || '#f5576c',
      styles.getPropertyValue('--chart-5').trim() || '#fa709a',
    ];
  })() : ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#fa709a'];

  const chartData = hasData ? [
    {
      name: 'Principal & Interest',
      value: results.principalAndInterest,
      color: chartColors[0]
    },
    {
      name: 'Property Tax',
      value: results.monthlyTax || 0,
      color: chartColors[1]
    },
    {
      name: 'Insurance',
      value: results.monthlyInsurance || 0,
      color: chartColors[2]
    },
    {
      name: 'HOA',
      value: results.monthlyHOA || 0,
      color: chartColors[3]
    },
    {
      name: 'PMI/MIP',
      value: results.monthlyPMI || 0,
      color: chartColors[4]
    }
  ].filter(item => item.value > 0) : [];

  return (
    <Card className="h-full" style={{
      background: 'var(--gradient-hero)',
    }}>
      <CardHeader className="bg-black/20">
        <CardTitle style={{ color: '#ffffff' }}>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4" style={{ color: 'var(--brand-dark-navy)' }}>
        <div className="text-center pb-4 border-b border-black/10">
          <p className="text-sm mb-1">Monthly Payment</p>
          <p className="text-4xl font-bold">
            {formatCurrencyWithCents(results.monthlyPayment)}
          </p>
        </div>

        {/* Donut Chart - Always show, empty state with outline */}
        <div className="flex justify-center pb-4 border-b border-black/10">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hasData ? chartData : [{ name: 'Empty', value: 1, color: 'rgba(0, 0, 0, 0.1)' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={hasData ? 2 : 0}
                  dataKey="value"
                  stroke="rgba(0, 0, 0, 0.15)"
                  strokeWidth={hasData ? 0 : 1}
                >
                  {(hasData ? chartData : [{ name: 'Empty', value: 1, color: 'rgba(0, 0, 0, 0.1)' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Principal & Interest</span>
            <span className="font-semibold">{formatCurrency(results.principalAndInterest)}</span>
          </div>

          {results.monthlyTax !== undefined && results.monthlyTax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Property Tax</span>
              <span className="font-semibold">{formatCurrency(results.monthlyTax)}</span>
            </div>
          )}

          {results.monthlyInsurance !== undefined && results.monthlyInsurance > 0 && (
            <div className="flex justify-between text-sm">
              <span>Insurance</span>
              <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
            </div>
          )}

          {results.monthlyHOA !== undefined && results.monthlyHOA > 0 && (
            <div className="flex justify-between text-sm">
              <span>HOA Fees</span>
              <span className="font-semibold">{formatCurrency(results.monthlyHOA)}</span>
            </div>
          )}

          {results.monthlyPMI !== undefined && results.monthlyPMI > 0 && (
            <div className="flex justify-between text-sm">
              <span>PMI/MIP</span>
              <span className="font-semibold">{formatCurrency(results.monthlyPMI)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-black/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Loan Amount</span>
            <span className="font-semibold">{formatCurrency(results.loanAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Interest</span>
            <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Payment</span>
            <span className="font-semibold">{formatCurrency(results.totalPayment)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Principal</span>
            <span>Interest</span>
          </div>
          <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ backgroundColor: 'var(--brand-dark-navy)', width: `${results.totalPayment > 0 ? ((results.loanAmount || 0) / results.totalPayment) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span>{formatPercent(results.totalPayment > 0 ? ((results.loanAmount || 0) / results.totalPayment) * 100 : 0)}</span>
            <span>{formatPercent(results.totalPayment > 0 ? (results.totalInterest / results.totalPayment) * 100 : 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Refinance Results Card
export function RefinanceResultsCard({ results }: { results: ReturnType<typeof calculateRefinance> }) {
  return (
    <Card className="h-fit" style={{
      background: 'var(--gradient-hero)',
    }}>
      <CardHeader className="bg-black/20">
        <CardTitle style={{ color: '#ffffff' }}>Refinance Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4" style={{ color: 'var(--brand-dark-navy)' }}>
        <div className="text-center pb-4 border-b border-black/10">
          <p className="text-sm mb-1">New Monthly Payment</p>
          <p className="text-4xl font-bold">
            {formatCurrencyWithCents(results.monthlyPayment)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Monthly Savings</span>
            <span className="font-bold">{formatCurrency(results.monthlySavings)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Break-Even Point</span>
            <span className="font-semibold">{results.breakEvenMonths} months</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Lifetime Savings</span>
            <span className="font-bold">{formatCurrency(results.lifetimeSavings)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-black/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Interest</span>
            <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Payment</span>
            <span className="font-semibold">{formatCurrency(results.totalPayment)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Affordability Results Card
export function AffordabilityResultsCard({ results }: { results: ReturnType<typeof calculateAffordability> }) {
  return (
    <Card className="h-fit" style={{
      background: 'var(--gradient-hero)',
    }}>
      <CardHeader className="bg-black/20">
        <CardTitle style={{ color: '#ffffff' }}>What You Can Afford</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4" style={{ color: 'var(--brand-dark-navy)' }}>
        <div className="text-center pb-4 border-b border-black/10">
          <p className="text-sm mb-1">Maximum Home Price</p>
          <p className="text-4xl font-bold">
            {formatCurrency(results.maxHomePrice)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Monthly Payment</span>
            <span className="font-semibold">{formatCurrencyWithCents(results.monthlyPayment)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Maximum Loan Amount</span>
            <span className="font-semibold">{formatCurrency(results.maxLoanAmount)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-black/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Principal & Interest</span>
            <span className="font-semibold">{formatCurrency(results.principalAndInterest)}</span>
          </div>
          {results.monthlyTax !== undefined && results.monthlyTax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Property Tax</span>
              <span className="font-semibold">{formatCurrency(results.monthlyTax)}</span>
            </div>
          )}
          {results.monthlyInsurance !== undefined && results.monthlyInsurance > 0 && (
            <div className="flex justify-between text-sm">
              <span>Insurance</span>
              <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
