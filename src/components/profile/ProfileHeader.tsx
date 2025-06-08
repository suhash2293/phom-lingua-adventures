
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ProfileHeaderProps {
  deletionRequest: any;
  onCancelDeletion: () => void;
  formatDate: (dateString: string) => string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  deletionRequest,
  onCancelDeletion,
  formatDate
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      {/* Account Deletion Warning */}
      {deletionRequest && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Account Deletion Scheduled</strong>
                <p className="text-sm mt-1">
                  Your account will be deleted on {formatDate(deletionRequest.deletion_scheduled_at)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onCancelDeletion}>
                Cancel Deletion
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProfileHeader;
