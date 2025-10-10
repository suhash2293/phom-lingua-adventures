import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import phomshahLogo from '@/assets/phomshah-logo.png';

export default function Header() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <img alt="PhomShah Logo" width={40} height={40} className="rounded" src={phomshahLogo} />
            <span className="font-bold text-xl text-phom-yellow">PhomShah</span>
          </Link>
        </div>

        {!isMobile ? (
          <nav className="flex items-center gap-6">
            <Link to="/learn" className="text-sm font-medium hover:text-primary transition-colors">
              Learn
            </Link>
            <Link to="/games" className="text-sm font-medium hover:text-primary transition-colors">
              Games
            </Link>
            <Link to="/donate" className="text-sm font-medium hover:text-primary transition-colors">
              Donate
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Admin</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer w-full">Admin Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/learn" className="text-lg font-semibold hover:text-primary transition-colors">
                  Learn
                </Link>
                <Link to="/games" className="text-lg font-semibold hover:text-primary transition-colors">
                  Games
                </Link>
                <Link to="/donate" className="text-lg font-semibold hover:text-primary transition-colors">
                  Donate
                </Link>
                <Link to="/about" className="text-lg font-semibold hover:text-primary transition-colors">
                  About
                </Link>
                {user && (
                  <>
                    <Link to="/admin" className="text-lg font-semibold hover:text-primary transition-colors">
                      Admin Dashboard
                    </Link>
                    <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
