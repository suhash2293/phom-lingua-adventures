
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [donationDetails, setDonationDetails] = useState<{ amount?: number; currency?: string }>({});
  
  useEffect(() => {
    // In a production app, you would verify the payment status
    // using the sessionId with the Stripe API via a backend function
    console.log("Donation successful with session ID:", sessionId);
    
    // For demo purposes, we're simulating getting donation details
    // In a real app, you would fetch this from your database
    setDonationDetails({
      amount: 1000, // Example amount
      currency: "inr",
    });
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
          
          {donationDetails.amount && (
            <p className="text-xl font-semibold">
              Amount: {donationDetails.currency === 'inr' ? '₹' : '$'}{(donationDetails.amount/100).toFixed(2)}
            </p>
          )}
          
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
