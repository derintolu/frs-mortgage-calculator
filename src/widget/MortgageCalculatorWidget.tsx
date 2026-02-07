import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/BrandedTabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { FloatingInput } from '../components/ui/floating-input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Calculator, User, Mail, Phone, Send, Share2 } from 'lucide-react';
import {
  ConventionalCalculator,
  AffordabilityCalculator,
  BuydownCalculator,
  DSCRCalculator,
  RefinanceCalculator,
  NetProceedsCalculator,
  RentVsBuyCalculator
} from '../components/calculators';
import { ButtonsCard } from './components/ButtonsCard';
import type { CalculatorType, WidgetConfig } from './main';

interface LoanOfficerData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title?: string;
  nmls?: string;
  nmls_number?: string;
  mobile_number?: string;
  phone_number?: string;
  profile_image?: string;
}

// Generic results type that can hold any calculator's output
interface CalculatorResults {
  type: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  summary: {
    title: string;
    primaryValue: string;
    primaryLabel: string;
    items: Array<{ label: string; value: string }>;
  };
}

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  recipientEmail?: string;
  wantsContact: boolean;
}

// Calculator type configuration
const CALCULATOR_CONFIG: Record<Exclude<CalculatorType, 'all'>, { title: string; description: string }> = {
  conventional: {
    title: 'Payment Calculator',
    description: 'Calculate your monthly mortgage payment breakdown',
  },
  affordability: {
    title: 'Affordability Calculator',
    description: 'Find out how much home you can afford',
  },
  buydown: {
    title: 'Buydown Calculator',
    description: 'Explore rate buydown options and savings',
  },
  dscr: {
    title: 'DSCR Calculator',
    description: 'Calculate debt service coverage ratio for investment properties',
  },
  refinance: {
    title: 'Refinance Calculator',
    description: 'Analyze potential savings from refinancing',
  },
  netproceeds: {
    title: 'Net Proceeds Calculator',
    description: 'Estimate your proceeds from selling your home',
  },
  rentvsbuy: {
    title: 'Rent vs Buy Calculator',
    description: 'Compare the costs of renting versus buying',
  },
};

// Loan Officer Profile Component
function LoanOfficerProfile({
  loanOfficer,
  gradientStart = '#2563eb',
  gradientEnd = '#2dd4da'
}: {
  loanOfficer: LoanOfficerData;
  gradientStart?: string;
  gradientEnd?: string;
}) {
  const fullName = `${loanOfficer.first_name} ${loanOfficer.last_name}`;
  const nmls = loanOfficer.nmls || loanOfficer.nmls_number || '';
  const phone = loanOfficer.mobile_number || loanOfficer.phone_number || '';
  const avatar = loanOfficer.profile_image || '';
  const jobTitle = loanOfficer.job_title || '';

  const gradientStyle = `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`;

  return (
    <Card className="mb-6">
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className="relative p-1 rounded-full"
          style={{
            background: gradientStyle
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3
            className="text-2xl font-bold"
            style={{
              backgroundImage: gradientStyle,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {fullName}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
            {jobTitle && (
              <span className="text-base font-semibold text-muted-foreground">{jobTitle}</span>
            )}
            {nmls && (
              <span
                className="text-base font-semibold"
                style={{
                  backgroundImage: gradientStyle,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                NMLS# {nmls}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {phone && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{phone}</span>
              </div>
            )}
            {loanOfficer.email && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{loanOfficer.email}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Email Results Modal Component
function EmailResultsModal({
  mode,
  apiUrl,
  webhookUrl,
  brandColor,
  loanOfficer,
  calculatorType,
  results,
  onOpenChange
}: {
  mode: 'email-me' | 'share';
  apiUrl?: string;
  webhookUrl?: string;
  brandColor: string;
  loanOfficer?: LoanOfficerData;
  calculatorType: string;
  results?: CalculatorResults;
  onOpenChange?: (open: boolean) => void;
}) {
  const [leadData, setLeadData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    recipientEmail: '',
    wantsContact: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!leadData.name || !leadData.email) {
      setSubmitError('Please enter your name and email');
      return;
    }

    if (mode === 'share' && !leadData.recipientEmail) {
      setSubmitError('Please enter recipient email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      action: mode,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      recipient_email: leadData.recipientEmail,
      wants_contact: leadData.wantsContact,
      loan_officer_id: loanOfficer?.id || 0,
      calculator_type: calculatorType,
      results: results || {},
      webhook_url: webhookUrl || ''
    };

    try {
      // Use REST API endpoint if available, otherwise fall back to webhook
      const endpoint = apiUrl ? `${apiUrl}/leads` : webhookUrl;

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send');
        }
      }

      setSubmitSuccess(true);
      setSubmitError(null);

      // Close modal after 2 seconds on success
      setTimeout(() => {
        if (onOpenChange) onOpenChange(false);
        // Reset form after closing
        setTimeout(() => {
          setSubmitSuccess(false);
          setLeadData({ name: '', email: '', phone: '', recipientEmail: '', wantsContact: false });
        }, 300);
      }, 2000);
    } catch (error) {
      console.error('Error submitting:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanOfficerName = loanOfficer
    ? `${loanOfficer.first_name} ${loanOfficer.last_name}`
    : 'our loan officer';

  return (
    <DialogContent className="sm:!max-w-[600px]">
      {submitSuccess ? (
        <div className="py-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              {mode === 'email-me' ? <Mail className="h-6 w-6 text-green-600" /> : <Share2 className="h-6 w-6 text-green-600" />}
            </div>
            <DialogTitle className="text-green-600 text-lg font-semibold mb-2">
              {mode === 'email-me' ? 'Results Sent!' : 'Results Shared!'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {mode === 'email-me'
                ? 'Check your email for your calculator results.'
                : 'The results have been sent to the recipient.'}
            </DialogDescription>
          </div>
        </div>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>
              {mode === 'email-me' ? 'Email Me Results' : 'Share Results'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'email-me'
                ? 'Enter your information to receive these calculator results via email.'
                : 'Share these calculator results with someone else.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FloatingInput
              label="Full Name"
              value={leadData.name}
              onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
              icon={<User className="w-4 h-4" />}
            />

            <FloatingInput
              label="Your Email Address"
              type="email"
              value={leadData.email}
              onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
              icon={<Mail className="w-4 h-4" />}
            />

            <FloatingInput
              label="Phone Number (Optional)"
              type="tel"
              value={leadData.phone}
              onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
              icon={<Phone className="w-4 h-4" />}
            />

            {mode === 'share' && (
              <FloatingInput
                label="Recipient Email Address"
                type="email"
                value={leadData.recipientEmail}
                onChange={(e) => setLeadData({ ...leadData, recipientEmail: e.target.value })}
                icon={<Mail className="w-4 h-4" />}
              />
            )}

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="wantsContact"
                checked={leadData.wantsContact}
                onChange={(e) => setLeadData({ ...leadData, wantsContact: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="wantsContact"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I&apos;d like {loanOfficerName} to contact me about these results
              </label>
            </div>

            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {submitError}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
              style={{ backgroundColor: brandColor }}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  {mode === 'email-me' ? <Mail className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                  {mode === 'email-me' ? 'Email Me Results' : 'Send Results'}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  );
}

// Single Calculator Component - renders just one calculator type
function SingleCalculator({
  type,
  showButtons,
  onEmailMe,
  onShare,
  brandColor,
}: {
  type: Exclude<CalculatorType, 'all'>;
  showButtons: boolean;
  onEmailMe: (results?: CalculatorResults) => void;
  onShare: (results?: CalculatorResults) => void;
  brandColor: string;
}) {
  const calculatorProps = {
    showButtons,
    onEmailMe,
    onShare,
    brandColor,
    ButtonsComponent: ButtonsCard,
  };

  switch (type) {
    case 'conventional':
      return <ConventionalCalculator {...calculatorProps} />;
    case 'affordability':
      return <AffordabilityCalculator {...calculatorProps} />;
    case 'buydown':
      return <BuydownCalculator {...calculatorProps} />;
    case 'dscr':
      return <DSCRCalculator {...calculatorProps} />;
    case 'refinance':
      return <RefinanceCalculator {...calculatorProps} />;
    case 'netproceeds':
      return <NetProceedsCalculator {...calculatorProps} />;
    case 'rentvsbuy':
      return <RentVsBuyCalculator {...calculatorProps} />;
    default:
      return <ConventionalCalculator {...calculatorProps} />;
  }
}

export function MortgageCalculatorWidget({ config = {} }: { config?: WidgetConfig }) {
  const {
    loanOfficerId,
    webhookUrl,
    showLeadForm = true,
    brandColor = '#3b82f6',
    gradientStart = '#2563eb',
    gradientEnd = '#2dd4da',
    calculatorType = 'all',
  } = config;

  const [activeTab, setActiveTab] = useState('conventional');
  const [loanOfficer, setLoanOfficer] = useState<LoanOfficerData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailMode, setEmailMode] = useState<'email-me' | 'share'>('email-me');
  const [currentResults, setCurrentResults] = useState<CalculatorResults | null>(null);

  // Fetch loan officer profile if ID provided
  useEffect(() => {
    if (loanOfficerId) {
      setIsLoadingProfile(true);
      fetch(`/wp-json/frs-users/v1/profiles/user/${loanOfficerId}`)
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data) {
            setLoanOfficer(response.data);
          }
        })
        .catch(err => console.error('Failed to fetch loan officer profile:', err))
        .finally(() => setIsLoadingProfile(false));
    }
  }, [loanOfficerId]);

  const handleEmailMe = (results?: CalculatorResults) => {
    if (results) setCurrentResults(results);
    setEmailMode('email-me');
    setEmailModalOpen(true);
  };

  const handleShare = (results?: CalculatorResults) => {
    if (results) setCurrentResults(results);
    setEmailMode('share');
    setEmailModalOpen(true);
  };

  // Determine if we should show a single calculator or all with tabs
  const isSingleCalculator = calculatorType !== 'all';
  const currentCalcType = isSingleCalculator ? calculatorType : activeTab;
  const calcConfig = isSingleCalculator ? CALCULATOR_CONFIG[calculatorType as Exclude<CalculatorType, 'all'>] : null;

  return (
    <div
      className="calc-widget w-full max-w-7xl mx-auto p-6 font-sans"
      style={{
        '--gradient-start': gradientStart,
        '--gradient-end': gradientEnd,
      } as React.CSSProperties}
    >
      <style>{`
        .calc-widget {
          --input: ${gradientStart};
          --border: ${gradientStart};
          --ring: ${gradientEnd};
        }
        .calc-widget input,
        .calc-widget select,
        .calc-widget textarea,
        .calc-widget [role="combobox"],
        .calc-widget button[role="combobox"],
        .calc-widget .border,
        .calc-widget .border-input {
          border-color: ${gradientStart} !important;
        }
        .calc-widget input:focus,
        .calc-widget select:focus,
        .calc-widget textarea:focus,
        .calc-widget [role="combobox"]:focus,
        .calc-widget input:focus-visible,
        .calc-widget select:focus-visible {
          border-color: ${gradientEnd} !important;
          box-shadow: 0 0 0 3px ${gradientEnd}40 !important;
          outline: none !important;
        }
      `}</style>

      {/* Calculator Section - Full Width */}
      <div className="w-full">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2 rounded-lg"
            style={{ background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)` }}
          >
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">
            {isSingleCalculator && calcConfig ? calcConfig.title : 'Mortgage Calculator'}
          </h2>
        </div>

        <p className="text-muted-foreground mt-2 mb-6">
          {isSingleCalculator && calcConfig
            ? calcConfig.description
            : 'Calculate payments for different mortgage types'}
        </p>

        {/* Single Calculator Mode */}
        {isSingleCalculator ? (
          <SingleCalculator
            type={calculatorType as Exclude<CalculatorType, 'all'>}
            showButtons={showLeadForm}
            onEmailMe={handleEmailMe}
            onShare={handleShare}
            brandColor={gradientStart}
          />
        ) : (
          /* Multi-Calculator Mode with Tabs */
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            gradientStart={gradientStart}
            gradientEnd={gradientEnd}
          >
            {/* Mobile: Dropdown selector */}
            <div className="frs-mc-mobile-nav mb-6 p-4 rounded-lg border-2" style={{ borderColor: gradientStart }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calculator Type</label>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger
                  className="w-full h-12 text-base font-medium border-2 rounded-lg"
                  style={{ borderColor: gradientStart }}
                >
                  <SelectValue placeholder="Select calculator type" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-2 shadow-lg">
                  <SelectItem value="conventional" className="py-3 text-base">Payment Calculator</SelectItem>
                  <SelectItem value="affordability" className="py-3 text-base">Affordability Calculator</SelectItem>
                  <SelectItem value="buydown" className="py-3 text-base">Buydown Calculator</SelectItem>
                  <SelectItem value="dscr" className="py-3 text-base">DSCR Calculator</SelectItem>
                  <SelectItem value="refinance" className="py-3 text-base">Refinance Calculator</SelectItem>
                  <SelectItem value="netproceeds" className="py-3 text-base">Net Proceeds Calculator</SelectItem>
                  <SelectItem value="rentvsbuy" className="py-3 text-base">Rent vs Buy Calculator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop: Tabs */}
            <TabsList className="frs-mc-desktop-nav grid grid-cols-4 lg:grid-cols-7 mb-6 gap-1 w-full">
              <TabsTrigger value="conventional">Payment</TabsTrigger>
              <TabsTrigger value="affordability">Affordability</TabsTrigger>
              <TabsTrigger value="buydown">Buydown</TabsTrigger>
              <TabsTrigger value="dscr">DSCR</TabsTrigger>
              <TabsTrigger value="refinance">Refinance</TabsTrigger>
              <TabsTrigger value="netproceeds">Net Proceeds</TabsTrigger>
              <TabsTrigger value="rentvsbuy">Rent vs Buy</TabsTrigger>
            </TabsList>

            <TabsContent value="conventional">
              <ConventionalCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>

            <TabsContent value="affordability">
              <AffordabilityCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>

            <TabsContent value="buydown">
              <BuydownCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>

            <TabsContent value="dscr">
              <DSCRCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>

            <TabsContent value="refinance">
              <RefinanceCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>

            <TabsContent value="netproceeds">
              <NetProceedsCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>

            <TabsContent value="rentvsbuy">
              <RentVsBuyCalculator
                showButtons={showLeadForm}
                onEmailMe={handleEmailMe}
                onShare={handleShare}
                brandColor={gradientStart}
                ButtonsComponent={ButtonsCard}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Disclaimer - At the very bottom, styled like the original */}
        <div className="text-[10px] text-gray-400 leading-tight pt-4 border-t border-gray-200 mt-6">
          <p>
            Results received from this calculator are designed for comparative purposes only, and accuracy is not guaranteed.
            This calculator is made available to you as an educational tool only and calculations are based on borrower-input information.
            This is not an advertisement for the above terms, interest rates, or payment amounts. We do not guarantee the accuracy of any
            information or inputs by users of the software. This calculator does not have the ability to pre-qualify you for any loan program
            which should be verified independently with one of our Loan Consultants. Qualification for loan programs may require additional
            information such as credit scores and cash reserves which is not gathered in this calculator. Information such as interest rates
            and pricing are user input should not be perceived as a quote. Additional fees such as HOA dues are not included in calculations.
            All information such as interest rates, taxes, insurance, PMI payments, etc. are estimates and should be used for comparison only.
            We do not guarantee any of the information obtained by this calculator. To get an accurate rate and fee quote and to be prequalified
            or preapproved please use the contact form to request further assistance.
          </p>
        </div>
      </div>

      {/* Email Results Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <EmailResultsModal
          mode={emailMode}
          apiUrl={config.apiUrl}
          webhookUrl={webhookUrl}
          brandColor={brandColor}
          loanOfficer={loanOfficer || undefined}
          calculatorType={currentCalcType}
          results={currentResults || undefined}
          onOpenChange={setEmailModalOpen}
        />
      </Dialog>
    </div>
  );
}
