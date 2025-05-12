
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/0d42e53f-67e0-44b9-b835-4ca4918bd0dd.png"
              alt="PhomShah Logo"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-bold text-xl text-phom-yellow">PhomShah</span>
          </Link>
        </div>

        {!isMobile ? (
          <nav className="flex items-center gap-6">
            <Link to="/learn" className="text-sm font-medium hover:text-primary transition-colors">
              Learn
            </Link>
            <Link to="/practice" className="text-sm font-medium hover:text-primary transition-colors">
              Practice
            </Link>
            <Link to="/donate" className="text-sm font-medium hover:text-primary transition-colors">
              Donate
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                    Admin
                  </Link>
                )}
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default">Sign In</Button>
              </Link>
            )}
          </nav>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 py-4">
                <Link 
                  to="/" 
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/learn" 
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  Learn
                </Link>
                <Link 
                  to="/practice" 
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  Practice
                </Link>
                <Link 
                  to="/donate" 
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  Donate
                </Link>
                <Link 
                  to="/about" 
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  About
                </Link>
                {user ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      Profile
                    </Link>
                    {user.isAdmin && (
                      <Link 
                        to="/admin" 
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Button variant="outline" onClick={signOut}>Sign Out</Button>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button variant="default" className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
