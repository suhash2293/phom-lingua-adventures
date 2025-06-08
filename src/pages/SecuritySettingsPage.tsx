
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SecuritySettings from '@/components/profile/SecuritySettings';

const SecuritySettingsPage = () => {
  const { user } = useAuth();

  // If not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Security Settings</h1>
            <p className="text-muted-foreground">
              Manage your account security and two-factor authentication
            </p>
          </div>
        </div>

        {/* Security Settings */}
        <SecuritySettings userEmail={user.email} />
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
