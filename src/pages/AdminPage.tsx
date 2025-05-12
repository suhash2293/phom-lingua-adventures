
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ContentUploadForm from '@/components/admin/ContentUploadForm';
import ContentList from '@/components/admin/ContentList';
import ContentEditForm from '@/components/admin/ContentEditForm';
import { ContentService } from '@/services/ContentService';
import { Category, ContentItem } from '@/types/content';

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ContentService.getCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast({
          variant: "destructive",
          title: "Failed to load categories",
          description: "There was a problem loading the content categories."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [toast]);
  
  // If not logged in or not admin, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const handleContentItemSaved = () => {
    // Force refresh of content list
    setSelectedCategoryId(prevId => {
      // This trick forces React to re-render the content list
      const temp = '';
      setTimeout(() => setSelectedCategoryId(prevId), 0);
      return temp;
    });
  };
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="content" className="mb-8">
        <TabsList>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Content</CardTitle>
                <CardDescription>Add new words, phrases, and audio to the database</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentUploadForm />
              </CardContent>
            </Card>
            
            {/* Content Browser */}
            <Card>
              <CardHeader>
                <CardTitle>Browse Content</CardTitle>
                <CardDescription>View, edit, and delete existing content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label htmlFor="category-select" className="block text-sm font-medium mb-2">
                    Select Category
                  </label>
                  <Select 
                    value={selectedCategoryId} 
                    onValueChange={setSelectedCategoryId}
                  >
                    <SelectTrigger id="category-select" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : selectedCategoryId ? (
                  <ContentList 
                    categoryId={selectedCategoryId} 
                    categories={categories}
                    onEditItem={setEditingItem}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a category to view content
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-12 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  User management functionality will be implemented soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Content Dialog */}
      <ContentEditForm 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        onSaved={handleContentItemSaved}
      />
    </div>
  );
};

export default AdminPage;
