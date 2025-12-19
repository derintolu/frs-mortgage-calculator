import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Mail, Share2 } from 'lucide-react';

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

interface ButtonsCardProps {
  onEmailMe: (results?: CalculatorResults) => void;
  onShare: (results?: CalculatorResults) => void;
  brandColor: string;
  results?: CalculatorResults;
}

export function ButtonsCard({ onEmailMe, onShare, brandColor, results }: ButtonsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onEmailMe(results)}
            className="flex-1"
            size="lg"
            style={{ backgroundColor: brandColor }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Me Results
          </Button>
          <Button
            onClick={() => onShare(results)}
            className="flex-1"
            size="lg"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
