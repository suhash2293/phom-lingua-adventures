
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const DonatePage = () => {
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'inr' | 'usd'>('inr');
  
  const handleDonate = async (amount: number) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { amount, currency },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Could not process your donation. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
  };

  const handleCustomDonate = () => {
    // Convert to number to ensure it's at least 1
    const amount = parseInt(customAmount);
    if (amount >= 1) {
      handleDonate(amount);
    }
  };

  const getCurrencySymbol = () => currency === 'inr' ? '₹' : '$';

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Support Our Mission</h1>
        <p className="text-lg mb-8">
          Your donation helps us preserve the Phom language and create more learning resources. 
          As a non-profit initiative, we rely on community support to continue our work.
        </p>
        
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-md border">
            <Button 
              variant={currency === 'inr' ? "default" : "ghost"}
              className="rounded-r-none"
              onClick={() => setCurrency('inr')}
            >
              ₹ INR
            </Button>
            <Button 
              variant={currency === 'usd' ? "default" : "ghost"}
              className="rounded-l-none"
              onClick={() => setCurrency('usd')}
            >
              $ USD
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Basic Supporter</CardTitle>
              <CardDescription>One-time donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{getCurrencySymbol()}{currency === 'inr' ? '500' : '6'}</p>
              <p className="text-muted-foreground mt-2">
                Help us cover basic operational costs
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleDonate(currency === 'inr' ? 500 : 6)} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Donate {getCurrencySymbol()}{currency === 'inr' ? '500' : '6'}</>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-phom-yellow">
            <CardHeader>
              <CardTitle className="text-phom-yellow">Regular Supporter</CardTitle>
              <CardDescription>One-time donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{getCurrencySymbol()}{currency === 'inr' ? '1,000' : '12'}</p>
              <p className="text-muted-foreground mt-2">
                Help us create new learning materials
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleDonate(currency === 'inr' ? 1000 : 12)} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Donate {getCurrencySymbol()}{currency === 'inr' ? '1,000' : '12'}</>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Major Contributor</CardTitle>
              <CardDescription>One-time donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{getCurrencySymbol()}{currency === 'inr' ? '2,500' : '30'}</p>
              <p className="text-muted-foreground mt-2">
                Help us record new audio resources
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleDonate(currency === 'inr' ? 2500 : 30)} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Donate {getCurrencySymbol()}{currency === 'inr' ? '2,500' : '30'}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Custom Donation</CardTitle>
            <CardDescription>
              Choose your own contribution amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap gap-4 mb-4">
                {[
                  { inr: 100, usd: 2 },
                  { inr: 250, usd: 3 },
                  { inr: 5000, usd: 60 }
                ].map((amount) => (
                  <Button 
                    key={`${amount[currency]}`}
                    variant="outline" 
                    onClick={() => handleDonate(amount[currency])}
                    disabled={isLoading}
                  >
                    {getCurrencySymbol()}{amount[currency]}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2 items-center">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">{getCurrencySymbol()}</span>
                  <Input
                    type="text"
                    placeholder={`Enter amount (min ${getCurrencySymbol()}1)`}
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="pl-7"
                    min={1}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  onClick={handleCustomDonate}
                  disabled={!customAmount || parseInt(customAmount) < 1 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Donate"
                  )}
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
                <p className="text-sm text-muted-foreground">
                  Connecting with Phom speakers to preserve the language
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
