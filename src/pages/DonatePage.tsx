import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { PlayBillingService } from '@/services/PlayBillingService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
const DonatePage = () => {
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBillingAvailable, setIsBillingAvailable] = useState<boolean>(false);
  const [confirmationTier, setConfirmationTier] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize Play Billing on component mount
  useEffect(() => {
    const initPlayBilling = async () => {
      try {
        await PlayBillingService.initialize();
        const available = await PlayBillingService.isBillingAvailable();
        setIsBillingAvailable(available);
        if (!available) {
          toast({
            variant: 'destructive',
            title: 'Google Play Billing Unavailable',
            description: 'Donation features are currently unavailable on your device.'
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google Play Billing:', error);
        setIsBillingAvailable(false);
      }
    };
    initPlayBilling();
  }, [toast]);
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
  };

  // Show confirmation before proceeding with donation
  const handleDonateInitiate = (amount: number) => {
    // Map to the appropriate tier
    const tier = PlayBillingService.mapAmountToDonationTier(amount);
    if (!tier) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter an amount of at least ₹1.'
      });
      return;
    }
    setConfirmationTier({
      id: tier.id,
      amount: tier.amount
    });
    setShowConfirmation(true);
  };

  // Process the actual donation after confirmation
  const handleDonateConfirm = async () => {
    if (!confirmationTier) return;
    setIsLoading(true);
    try {
      const result = await PlayBillingService.purchaseDonation(confirmationTier.id);
      if (result.success) {
        // Acknowledge the purchase to prevent refund window
        if (result.transactionData?.purchaseToken) {
          await PlayBillingService.acknowledgePurchase(result.transactionData.purchaseToken);
        }

        // Navigate to success page with transaction details
        navigate('/donation-success', {
          state: {
            amount: confirmationTier.amount,
            transactionId: result.transactionData?.orderId || 'unknown',
            purchaseToken: result.transactionData?.purchaseToken || 'unknown'
          }
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Donation Failed',
          description: 'Unable to process your donation. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while processing your donation. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  // Updated predefined amounts including higher options
  const predefinedAmounts = [100, 500, 1000, 5000, 10000, 50000];
  return <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Support Our Mission</h1>
        <p className="text-lg mb-8">Your donation helps us preserve the Phom dialect and create more learning resources. As a non-profit initiative, we rely on community support to continue our work.</p>
        
        {!isBillingAvailable && <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">
                Google Play Billing is not available on your device. Donation features are disabled.
              </p>
            </CardContent>
          </Card>}
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Make a Donation</CardTitle>
            <CardDescription>
              Choose an amount to support our language preservation efforts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap gap-4 mb-4">
                {predefinedAmounts.map(amount => <Button key={amount} variant="outline" onClick={() => handleDonateInitiate(amount)} disabled={isLoading || !isBillingAvailable}>
                    ₹{amount.toLocaleString('en-IN')}
                  </Button>)}
              </div>
              
              <div className="flex gap-2 items-center">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <Input type="text" placeholder="Enter amount (minimum ₹1)" value={customAmount} onChange={handleCustomAmountChange} className="pl-7" min={1} disabled={isLoading || !isBillingAvailable} />
                </div>
                <Button onClick={() => handleDonateInitiate(parseInt(customAmount))} disabled={!customAmount || parseInt(customAmount) < 1 || isLoading || !isBillingAvailable}>
                  {isLoading ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </> : "Donate"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Where Your Money Goes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="bg-phom-yellow rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                📚
              </div>
              <div>
                <h3 className="font-medium mb-1">Creating Educational Content</h3>
                <p className="text-sm text-muted-foreground">
                  Developing new lessons, exercises, and practice materials
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-phom-yellow rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                🎤
              </div>
              <div>
                <h3 className="font-medium mb-1">Audio Recordings</h3>
                <p className="text-sm text-muted-foreground">
                  Recording high-quality pronunciation guides by native speakers
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-phom-yellow rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                💻
              </div>
              <div>
                <h3 className="font-medium mb-1">Platform Development</h3>
                <p className="text-sm text-muted-foreground">
                  Improving the learning experience and adding new features
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-phom-yellow rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                🌍
              </div>
              <div>
                <h3 className="font-medium mb-1">Community Outreach</h3>
                <p className="text-sm text-muted-foreground">Connecting with Phom speakers to preserve the dialect</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Donation</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be donating ₹{confirmationTier?.amount?.toLocaleString('en-IN')} (nearest available tier).
              <br />
              Would you like to continue with this donation?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDonateConfirm}>
              {isLoading ? <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </div> : `Donate ₹${confirmationTier?.amount?.toLocaleString('en-IN')}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default DonatePage;