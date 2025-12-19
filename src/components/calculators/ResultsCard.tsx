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

  // Prepare data for pie chart
  const chartData = hasData ? [
    {
      name: 'Principal & Interest',
      value: results.principalAndInterest,
      color: '#ffffff'
    },
    {
      name: 'Property Tax',
      value: results.monthlyTax || 0,
      color: '#93c5fd'
    },
    {
      name: 'Insurance',
      value: results.monthlyInsurance || 0,
      color: '#60a5fa'
    },
    {
      name: 'HOA',
      value: results.monthlyHOA || 0,
      color: '#3b82f6'
    },
    {
      name: 'PMI/MIP',
      value: results.monthlyPMI || 0,
      color: '#2563eb'
    }
  ].filter(item => item.value > 0) : [];

  return (
    <Card className="h-full" style={{
      background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)'
    }}>
      <CardHeader className="bg-black/20">
        <CardTitle className="text-white">Payment Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 text-white">
        <div className="text-center pb-4 border-b border-white/20">
          <p className="text-sm opacity-90 mb-1">Monthly Payment</p>
          <p className="text-4xl font-bold">
            {formatCurrencyWithCents(results.monthlyPayment)}
          </p>
        </div>

        {/* Donut Chart - Always show, empty state with outline */}
        <div className="flex justify-center pb-4 border-b border-white/20">
          <div className="w-48 h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hasData ? chartData : [{ name: 'Empty', value: 1, color: 'rgba(255, 255, 255, 0.15)' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={hasData ? 2 : 0}
                  dataKey="value"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={hasData ? 0 : 1}
                >
                  {(hasData ? chartData : [{ name: 'Empty', value: 1, color: 'rgba(255, 255, 255, 0.15)' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Principal & Interest</span>
            <span className="font-semibold">{formatCurrency(results.principalAndInterest)}</span>
          </div>

          {results.monthlyTax !== undefined && results.monthlyTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Property Tax</span>
              <span className="font-semibold">{formatCurrency(results.monthlyTax)}</span>
            </div>
          )}

          {results.monthlyInsurance !== undefined && results.monthlyInsurance > 0 && (
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Insurance</span>
              <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
            </div>
          )}

          {results.monthlyHOA !== undefined && results.monthlyHOA > 0 && (
            <div className="flex justify-between text-sm">
              <span className="opacity-90">HOA Fees</span>
              <span className="font-semibold">{formatCurrency(results.monthlyHOA)}</span>
            </div>
          )}

          {results.monthlyPMI !== undefined && results.monthlyPMI > 0 && (
            <div className="flex justify-between text-sm">
              <span className="opacity-90">PMI/MIP</span>
              <span className="font-semibold">{formatCurrency(results.monthlyPMI)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/20 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Loan Amount</span>
            <span className="font-semibold">{formatCurrency(results.loanAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Total Interest</span>
            <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Total Payment</span>
            <span className="font-semibold">{formatCurrency(results.totalPayment)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs opacity-90">
            <span>Principal</span>
            <span>Interest</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all"
              style={{
                width: `${results.totalPayment > 0 ? ((results.loanAmount || 0) / results.totalPayment) * 100 : 0}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-90">
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
      background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)'
    }}>
      <CardHeader className="bg-black/20">
        <CardTitle className="text-white">Refinance Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 text-white">
        <div className="text-center pb-4 border-b border-white/20">
          <p className="text-sm opacity-90 mb-1">New Monthly Payment</p>
          <p className="text-4xl font-bold">
            {formatCurrencyWithCents(results.monthlyPayment)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Monthly Savings</span>
            <span className="font-semibold text-green-300">{formatCurrency(results.monthlySavings)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Break-Even Point</span>
            <span className="font-semibold">{results.breakEvenMonths} months</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Lifetime Savings</span>
            <span className="font-semibold text-green-300">{formatCurrency(results.lifetimeSavings)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/20 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Total Interest</span>
            <span className="font-semibold">{formatCurrency(results.totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Total Payment</span>
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
      background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)'
    }}>
      <CardHeader className="bg-black/20">
        <CardTitle className="text-white">What You Can Afford</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 text-white">
        <div className="text-center pb-4 border-b border-white/20">
          <p className="text-sm opacity-90 mb-1">Maximum Home Price</p>
          <p className="text-4xl font-bold">
            {formatCurrency(results.maxHomePrice)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Monthly Payment</span>
            <span className="font-semibold">{formatCurrencyWithCents(results.monthlyPayment)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Maximum Loan Amount</span>
            <span className="font-semibold">{formatCurrency(results.maxLoanAmount)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/20 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Principal & Interest</span>
            <span className="font-semibold">{formatCurrency(results.principalAndInterest)}</span>
          </div>
          {results.monthlyTax !== undefined && results.monthlyTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Property Tax</span>
              <span className="font-semibold">{formatCurrency(results.monthlyTax)}</span>
            </div>
          )}
          {results.monthlyInsurance !== undefined && results.monthlyInsurance > 0 && (
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Insurance</span>
              <span className="font-semibold">{formatCurrency(results.monthlyInsurance)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
