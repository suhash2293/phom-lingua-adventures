
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { ScrollText, CalendarDays, Calendar, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LearnLayoutProps = {
  children: React.ReactNode;
};

// Define our sidebar categories
const categories = [
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
    title: "Numbers (1-100)",
    url: "/learn/numbers",
    icon: ListOrdered,
    description: "Learn counting in Phom"
  }
];

const LearnSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b p-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">Learn Phom</h2>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
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
        <Button 
          variant="outline" 
          className="w-full border-yellow-500 hover:bg-yellow-500/10" 
          onClick={() => navigate('/profile')}
        >
          View Profile
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

const LearnLayout: React.FC<LearnLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <LearnSidebar />
        <div className="flex-1 bg-gradient-to-br from-yellow-100/30 to-background">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LearnLayout;
