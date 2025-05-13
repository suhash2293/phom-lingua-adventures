
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem } from '@/types/content';

type ContentSearchProps = {
  onResultsFound: (results: ContentItem[]) => void;
};

export default function ContentSearch({ onResultsFound }: ContentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = await ContentService.searchContentItems(searchQuery);
      onResultsFound(results);
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 mb-4">
      <Input
        type="text"
        placeholder="Search words or translations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button type="submit" size="icon" disabled={isSearching}>
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
