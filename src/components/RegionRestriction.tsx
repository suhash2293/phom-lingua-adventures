
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Globe, AlertTriangle, Mail } from 'lucide-react';

interface RegionRestrictionProps {
  countryCode: string;
  onDismiss?: () => void;
}

const RegionRestriction: React.FC<RegionRestrictionProps> = ({ countryCode, onDismiss }) => {
  const handleContactSupport = () => {
    const subject = 'Region Access Request - PhomShah';
    const body = `Hello PhomShah Support Team,

I am writing from ${countryCode} and would like to request access to the PhomShah language learning platform.

Please let me know if PhomShah will be available in my region in the future.

Thank you for your time.

Best regards`;

    const mailtoLink = `mailto:nyiamlenla@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Globe className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Service Not Available</CardTitle>
          <CardDescription>
            PhomShah is not currently available in your region ({countryCode})
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              We're working to expand our services globally. Please check back later or contact us for updates about availability in your region.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              onClick={handleContactSupport}
              className="w-full"
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            
            {onDismiss && (
              <Button 
                onClick={onDismiss}
                variant="ghost"
                className="w-full"
              >
                Continue Anyway
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Currently available in: US, CA, GB, AU, NZ, IN
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionRestriction;
