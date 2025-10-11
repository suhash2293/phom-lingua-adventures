
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
  CardFooter,
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
import ContentSearch from '@/components/admin/ContentSearch';
import BulkNumberGenerator from '@/components/admin/BulkNumberGenerator';
import { ContentService } from '@/services/ContentService';
import { Category, ContentItem } from '@/types/content';

const AdminPage = () => {
  const { user, loading: authLoading, adminCheckComplete } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ContentItem[] | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  
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
  
  // Show loading while checking authentication and admin status
  if (authLoading || !adminCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }
  
  // If not logged in, redirect to admin sign-in
  if (!user) {
    return <Navigate to="/admin-signin" replace />;
  }
  
  // If logged in but not admin, redirect to home
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
    
    // Clear search results if any
    setSearchResults(null);
  };
  
  const getNumbersCategory = () => {
    const numbersCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('number')
    );
    return numbersCategory ? numbersCategory.id : '';
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
          <div className="flex flex-col mb-6">
            <h2 className="text-2xl font-semibold mb-4">Content Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant={activeTab === 'add' ? "default" : "outline"}
                onClick={() => setActiveTab('add')}
              >
                Add Single Item
              </Button>
              <Button 
                variant={activeTab === 'bulk' ? "default" : "outline"}
                onClick={() => setActiveTab('bulk')}
              >
                Bulk Generate Numbers
              </Button>
              <Button 
                variant={activeTab === 'browse' ? "default" : "outline"}
                onClick={() => {
                  setActiveTab('browse');
                  setSearchResults(null);
                }}
              >
                Browse Content
              </Button>
              <Button 
                variant={activeTab === 'search' ? "default" : "outline"}
                onClick={() => setActiveTab('search')}
              >
                Search
              </Button>
            </div>
          </div>

          {activeTab === 'add' && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Content</CardTitle>
                <CardDescription>Add new words, phrases, and audio to the database</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentUploadForm />
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'bulk' && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Generate Numbers</CardTitle>
                <CardDescription>Quickly generate number entries in a sequence</CardDescription>
              </CardHeader>
              <CardContent>
                <BulkNumberGenerator 
                  categories={categories}
                  onSuccess={handleContentItemSaved}
                />
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <p>This tool will generate number entries in sequence.</p>
                <p>You can add audio files to these entries later.</p>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'search' && (
            <Card>
              <CardHeader>
                <CardTitle>Search Content</CardTitle>
                <CardDescription>Find content across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentSearch onResultsFound={setSearchResults} />
                
                {searchResults !== null && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Search Results: {searchResults.length} items found
                    </h3>
                    {searchResults.length > 0 ? (
                      <ContentList 
                        categoryId={searchResults[0].category_id} 
                        categories={categories}
                        onEditItem={setEditingItem}
                        items={searchResults}
                        showCategoryName={true}
                      />
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No results found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'browse' && (
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
          )}
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
