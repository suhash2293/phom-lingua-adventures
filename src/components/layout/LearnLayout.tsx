
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  ScrollText, 
  CalendarDays, 
  Calendar, 
  ListOrdered,
  Home,
  Gamepad2,
  Info as InfoIcon,
  Heart,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type LearnLayoutProps = {
  children: React.ReactNode;
};

// Define our main navigation items
const mainNavItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    description: "Go to homepage"
  },
  {
    title: "Games",
    url: "/games",
    icon: Gamepad2,
    description: "Play learning games"
  },
  {
    title: "About",
    url: "/about",
    icon: InfoIcon,
    description: "Learn about PhomShah"
  },
  {
    title: "Donate",
    url: "/donate",
    icon: Heart,
    description: "Support our mission"
  }
];

// Define our sidebar categories
const learnCategories = [
  {
    title: "Alphabets",
    url: "/learn/alphabets",
    icon: ScrollText,
    description: "Learn Phom alphabets"
  },
  {
    title: "Days",
    url: "/learn/days",
    icon: CalendarDays,
    description: "Learn days of the week in Phom"
  },
  {
    title: "Months",
    url: "/learn/months",
    icon: Calendar,
    description: "Learn months in Phom"
  },
  {
    title: "Numbers",
    url: "/learn/numbers",
    icon: ListOrdered,
    description: "Learn counting in Phom"
  }
];

const LearnSidebar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            PhomShah
          </button>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
            <SidebarTrigger className="md:hidden" />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    tooltip={item.description}
                  >
                    <item.icon className="text-primary" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Learn Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learnCategories.map((category) => (
                <SidebarMenuItem key={category.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(category.url)}
                    tooltip={category.description}
                  >
                    <category.icon className="text-yellow-500" />
                    <span>{category.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        {user ? (
          <Button 
            variant="outline" 
            className="w-full border-yellow-500 hover:bg-yellow-500/10" 
            onClick={() => navigate('/profile')}
          >
            View Profile
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="w-full" 
            onClick={() => navigate('/auth')}
          >
            Sign In to Sync
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

const LearnLayout: React.FC<LearnLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <LearnSidebar />
        <main className="flex-1 bg-gradient-to-br from-yellow-100/30 to-background">
          <SidebarTrigger />
          {!user && (
            <Alert className="m-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your progress is saved locally. <button onClick={() => navigate('/auth')} className="underline font-medium">Sign in</button> to sync across devices.
              </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LearnLayout;
