
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface DonationDetails {
  amount?: number;
  currency?: string;
  email?: string;
  status?: string;
}

const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [donationDetails, setDonationDetails] = useState<DonationDetails>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function fetchDonationDetails() {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch donation details from the database
        const { data, error } = await supabase
          .from('donations')
          .select('amount, currency, email, status')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setDonationDetails(data);
        } else {
          // Fallback to a default amount if we can't find the donation
          setDonationDetails({
            amount: 1000,
            currency: "inr",
          });
        }
      } catch (error) {
        console.error("Error fetching donation details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch donation details. Please contact support.",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDonationDetails();
  }, [sessionId]);
  
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
          
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : donationDetails.amount ? (
            <p className="text-xl font-semibold">
              Amount: {donationDetails.currency === 'inr' ? '₹' : '$'}{(donationDetails.amount).toFixed(2)}
            </p>
          ) : null}
          
          <div className="pt-6">
            <p className="text-muted-foreground mb-6">
              A receipt has been emailed to you. If you have any questions about your donation, 
              please contact us.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/learn">Start Learning</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationSuccessPage;
