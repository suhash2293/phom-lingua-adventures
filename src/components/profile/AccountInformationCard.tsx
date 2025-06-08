
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';

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
        <CardDescription>Update your personal details and security settings</CardDescription>
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

          {/* Security Settings Link */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Account Security</h4>
                <p className="text-sm text-muted-foreground">
                  Manage two-factor authentication and trusted devices
                </p>
              </div>
              <Link to="/profile/security">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </Link>
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
