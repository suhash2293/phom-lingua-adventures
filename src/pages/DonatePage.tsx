
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const DonatePage = () => {
  const { toast } = useToast();
  
  const handleDonate = (amount: string) => {
    // In a real implementation, this would open Stripe checkout
    toast({
      title: "Donation Flow Started",
      description: `Thank you for your generous ${amount} donation! This would open Stripe in a real implementation.`,
    });
  };

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Support Our Mission</h1>
        <p className="text-lg mb-8">
          Your donation helps us preserve the Phom language and create more learning resources. 
          As a non-profit initiative, we rely on community support to continue our work.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Basic Supporter</CardTitle>
              <CardDescription>One-time donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹500</p>
              <p className="text-muted-foreground mt-2">
                Help us cover basic operational costs
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleDonate("₹500")} className="w-full">
                Donate ₹500
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-phom-yellow">
            <CardHeader>
              <CardTitle className="text-phom-yellow">Regular Supporter</CardTitle>
              <CardDescription>One-time donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹1,000</p>
              <p className="text-muted-foreground mt-2">
                Help us create new learning materials
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleDonate("₹1,000")} className="w-full">
                Donate ₹1,000
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Major Contributor</CardTitle>
              <CardDescription>One-time donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹2,500</p>
              <p className="text-muted-foreground mt-2">
                Help us record new audio resources
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleDonate("₹2,500")} className="w-full">
                Donate ₹2,500
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
          <CardContent className="flex gap-4">
            {['₹100', '₹250', '₹5,000', 'Other'].map((amount) => (
              <Button 
                key={amount}
                variant="outline" 
                onClick={() => handleDonate(amount)}
              >
                {amount}
              </Button>
            ))}
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
