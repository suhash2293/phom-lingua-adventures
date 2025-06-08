
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Trash2, Clock, Info, ExternalLink } from 'lucide-react';

const AccountManagementCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="lg:col-span-3 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-600" />
          Account Management & Data Control
        </CardTitle>
        <CardDescription>
          Manage your account data and deletion options in compliance with Google Play Store policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Rights Information */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Your Data Rights:</strong> You have the right to request deletion of your personal data and account at any time. This process is permanent and cannot be undone.
          </AlertDescription>
        </Alert>

        {/* Data Deletion Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              What Gets Deleted
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your user profile and account information</li>
              <li>• Game progress and achievements</li>
              <li>• Game session history and scores</li>
              <li>• Learning streaks and XP points</li>
              <li>• All personal data associated with your account</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Deletion Timeline
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Immediate:</strong> Account deleted right away</li>
              <li>• <strong>Scheduled:</strong> 30-day grace period to cancel</li>
              <li>• <strong>Web Portal:</strong> Alternative deletion method</li>
              <li>• <strong>Support:</strong> Contact us for assistance</li>
            </ul>
          </div>
        </div>

        {/* Deletion Options */}
        <div className="space-y-4">
          <h4 className="font-semibold">Account Deletion Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="destructive" 
              onClick={() => navigate('/account-deletion')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Delete Now</div>
                <div className="text-xs opacity-90">Immediate deletion</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate('/account-deletion')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Clock className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Schedule Deletion</div>
                <div className="text-xs opacity-70">30-day grace period</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => window.open(`${window.location.origin}/account-deletion-web`, '_blank')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Web Portal</div>
                <div className="text-xs opacity-70">Alternative method</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Google Play Policy Compliance */}
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Policy Compliance:</strong> This account deletion process complies with Google Play Store policies. 
            You can delete your account and associated data at any time. For questions or support, contact us at{' '}
            <a href="mailto:nyiamlenla@gmail.com" className="text-blue-600 underline">
              nyiamlenla@gmail.com
            </a>
          </AlertDescription>
        </Alert>

        {/* Additional Information */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Need Help?</strong> If you're experiencing issues with the app or have concerns, 
            please contact our support team before deleting your account. We're here to help!
          </p>
          <p>
            <strong>Data Export:</strong> Currently, we don't offer data export functionality. 
            Once your account is deleted, your data cannot be recovered.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountManagementCard;
