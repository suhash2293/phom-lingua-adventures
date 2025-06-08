
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, ExternalLink, AlertTriangle, Info } from 'lucide-react';

const AccountDeletionPage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleImmediateDelete = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account immediately? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-deletion', {
        method: 'DELETE'
      });

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Sign out the user
      await logout();
      navigate('/');

    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleDelete = async () => {
    if (!confirm('Are you sure you want to schedule your account for deletion? You will have 30 days to cancel this request.')) {
      return;
    }

    setIsScheduling(true);
    try {
      const { data, error } = await supabase.functions.invoke('account-deletion', {
        body: {
          deletion_method: 'in_app',
          reason: reason || null
        }
      });

      if (error) throw error;

      toast({
        title: "Deletion Scheduled",
        description: "Your account will be deleted in 30 days. You can cancel this request anytime.",
      });

      navigate('/profile');

    } catch (error) {
      console.error('Error scheduling deletion:', error);
      toast({
        title: "Error",
        description: "Failed to schedule account deletion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleWebDeletion = () => {
    // Open web deletion URL in new tab
    window.open(`${window.location.origin}/account-deletion-web`, '_blank');
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Delete Your Account</h1>
        
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Account deletion is permanent and cannot be undone. 
            All your progress, achievements, and game history will be permanently lost.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Immediate Deletion Option */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Immediately
              </CardTitle>
              <CardDescription>
                Your account and all associated data will be deleted immediately. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for deletion (optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Help us improve by telling us why you're leaving..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The following data will be permanently deleted:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your user profile and account information</li>
                      <li>Game progress and achievements</li>
                      <li>Game session history and scores</li>
                      <li>Learning streaks and XP points</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                onClick={handleImmediateDelete}
                disabled={isDeleting}
                className="w-full"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* Scheduled Deletion Option */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule for Deletion (30 days)</CardTitle>
              <CardDescription>
                Schedule your account for deletion after 30 days. You can cancel this request anytime during the waiting period.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={handleScheduleDelete}
                disabled={isScheduling}
                className="w-full"
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Deletion'}
              </Button>
            </CardFooter>
          </Card>

          {/* Web Deletion Option */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Delete via Website
              </CardTitle>
              <CardDescription>
                Visit our website to complete the deletion process through our web interface.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={handleWebDeletion}
                className="w-full"
              >
                Open Web Deletion Page
              </Button>
            </CardFooter>
          </Card>

          {/* Back Button */}
          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionPage;
