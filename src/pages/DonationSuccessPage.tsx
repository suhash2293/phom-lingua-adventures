
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface LocationState {
  amount?: number;
  transactionId?: string;
  purchaseToken?: string;
}

const DonationSuccessPage = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const { toast } = useToast();
  const { user } = useAuth();
  
  const donationAmount = state?.amount || 0;
  const transactionId = state?.transactionId || 'unknown';
  const purchaseToken = state?.purchaseToken || 'unknown';
  
  // Record the donation in Supabase
  useEffect(() => {
    const recordDonation = async () => {
      if (donationAmount > 0 && user) {
        try {
          // Record the donation in our database
          await supabase.from('donations').insert({
            amount: donationAmount,
            currency: 'inr',
            email: user.email,
            user_id: user.id,
            google_play_transaction_id: transactionId,
            purchase_token: purchaseToken,
            status: 'completed',
          });
          
          console.log('Donation recorded successfully');
        } catch (error) {
          console.error('Error recording donation:', error);
          // Non-critical error, don't show to user
        }
      }
    };
    
    recordDonation();
  }, [donationAmount, transactionId, purchaseToken, user]);
  
  return (
    <div className="container px-4 md:px-6 py-12 max-w-3xl mx-auto">
      <Card className="border-green-500">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl md:text-3xl">Thank You for Your Donation!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg">
            Your contribution will help us preserve the Phom language and create new learning resources.
          </p>
          
          {donationAmount > 0 && (
            <p className="text-xl font-semibold">
              Amount: ₹{donationAmount.toLocaleString('en-IN')}
            </p>
          )}
          
          <div className="pt-6">
            <p className="text-muted-foreground mb-6">
              Your purchase has been processed through Google Play. Thank you for supporting our mission!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/donate">Donate Again</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationSuccessPage;
