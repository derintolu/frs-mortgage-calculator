import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Mail, Share2 } from 'lucide-react';

interface ButtonsCardProps {
  onEmailMe: () => void;
  onShare: () => void;
  brandColor: string;
}

export function ButtonsCard({ onEmailMe, onShare, brandColor }: ButtonsCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onEmailMe}
            className="flex-1"
            size="lg"
            style={{ backgroundColor: brandColor }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Me Results
          </Button>
          <Button
            onClick={onShare}
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
