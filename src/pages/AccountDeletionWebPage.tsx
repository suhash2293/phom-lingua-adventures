
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';

const AccountDeletionWebPage = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create mailto link for manual processing
      const subject = 'Account Deletion Request - PhomShah';
      const body = `Dear PhomShah Support Team,

I am requesting the deletion of my account associated with this email address.

Email: ${email}
${reason ? `Reason: ${reason}` : ''}

Please confirm the deletion of my account and all associated data within 30 days as per your privacy policy.

Thank you.`;

      const mailtoLink = `mailto:nyiamlenla@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      setIsSubmitted(true);
      
      toast({
        title: "Email Opened",
        description: "Your email client has been opened with the deletion request. Please send the email to complete your request.",
      });
      
    } catch (error) {
      console.error('Error creating email:', error);
      toast({
        title: "Error",
        description: "Failed to create deletion request email. Please contact support directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Deletion Request Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Your account deletion request has been prepared. Please send the email that was opened in your email client to complete the process.
          </p>
          <Alert className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Your account will be deleted within 30 days of receiving your email request. 
              All your data including progress, achievements, and game history will be permanently removed.
            </AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Delete Your PhomShah Account</h1>
        
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This will permanently delete your PhomShah account and all associated data. 
            This action cannot be undone.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Deletion Request
            </CardTitle>
            <CardDescription>
              Please provide your account email address to request account deletion. 
              We will process your request within 30 days as per our privacy policy.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your PhomShah account email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the email address associated with your PhomShah account
                </p>
              </div>

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
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  By submitting this request, the following data will be permanently deleted:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your user profile and account information</li>
                    <li>Game progress and achievements</li>
                    <li>Game session history and scores</li>
                    <li>Learning streaks and XP points</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating Request...' : 'Submit Deletion Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:nyiamlenla@gmail.com" className="text-primary hover:underline">
              nyiamlenla@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionWebPage;
