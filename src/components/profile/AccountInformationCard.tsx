
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AccountInformationCardProps {
  user: any;
}

const AccountInformationCard: React.FC<AccountInformationCardProps> = ({ user }) => {
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Email address cannot be changed.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language-preference">Learning Language Preference</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="phom-english"
                  name="language-preference"
                  defaultChecked
                />
                <label htmlFor="phom-english">Phom to English</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="english-phom"
                  name="language-preference"
                />
                <label htmlFor="english-phom">English to Phom</label>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit">Update Profile</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AccountInformationCard;
