import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, BookOpen, Loader2 } from 'lucide-react';
import { ContentService } from '@/services/ContentService';
import { ContentItem, Category } from '@/types/content';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import ModuleTitleWithAudio from '@/components/learning/ModuleTitleWithAudio';

const BibleBooksPage = () => {
  const [books, setBooks] = useState<ContentItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playingSection, setPlayingSection] = useState<'old' | 'new' | null>(null);
  
  const { playAudio, preloadAudioBatch } = useAudioPreloader();

  // Section audio URLs (can be set via admin dashboard by updating category fields or content items)
  const [oldTestamentAudioUrl, setOldTestamentAudioUrl] = useState<string | null>(null);
  const [newTestamentAudioUrl, setNewTestamentAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categories = await ContentService.getCategories();
        const bibleCategory = categories.find(c => c.name === 'Bible Books');
        
        if (bibleCategory) {
          setCategory(bibleCategory);
          const items = await ContentService.getContentItemsByCategoryId(bibleCategory.id);
          setBooks(items);
          
          // Preload audio URLs
          const audioUrls = items.map(item => item.audio_url).filter(Boolean) as string[];
          if (bibleCategory.title_audio_url) audioUrls.push(bibleCategory.title_audio_url);
          if (bibleCategory.singular_audio_url) audioUrls.push(bibleCategory.singular_audio_url);
          preloadAudioBatch(audioUrls);
        }
      } catch (error) {
        console.error('Error fetching Bible books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [preloadAudioBatch]);

  const handlePlayAudio = async (book: ContentItem) => {
    if (!book.audio_url) return;
    setPlayingId(book.id);
    await playAudio(book.audio_url);
    setPlayingId(null);
  };

  const handlePlaySectionAudio = async (section: 'old' | 'new') => {
    const url = section === 'old' ? oldTestamentAudioUrl : newTestamentAudioUrl;
    if (!url) return;
    setPlayingSection(section);
    await playAudio(url);
    setPlayingSection(null);
  };

  // Separate books into sections based on sort_order
  const vocabularyItems = books.filter(book => book.sort_order < 0);
  const oldTestamentBooks = books.filter(book => book.sort_order >= 1 && book.sort_order <= 39);
  const newTestamentBooks = books.filter(book => book.sort_order >= 40 && book.sort_order <= 66);

  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      {/* Module Header */}
      <div className="flex flex-col items-center mb-8">
        <ModuleTitleWithAudio
          englishTitle={category?.name || 'Bible Books'}
          category={category}
          playAudioFromHook={playAudio}
        />
        <p className="text-muted-foreground text-center max-w-2xl">
          {category?.description || 'Learn the name of the Books in the Bible in Phom dialect'}
        </p>
      </div>

      {/* Common Bible Vocabularies Section */}
      {vocabularyItems.length > 0 && (
        <section className="mb-12">
          <Card className="mb-6 bg-gradient-to-r from-emerald-100/50 to-emerald-50/20 dark:from-emerald-900/30 dark:to-emerald-800/10 border-emerald-200/50 dark:border-emerald-700/30">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">Common Bible vocabularies</h2>
              </div>
              <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70 text-center">
                Learn common Bible vocabularies in Phom dialect
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {vocabularyItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
                <CardHeader className="pb-2 bg-gradient-to-r from-emerald-100/30 to-emerald-50/10 dark:from-emerald-900/20 dark:to-emerald-800/10">
                  <CardTitle className="text-sm md:text-base text-center font-medium">
                    {item.english_translation}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-4">
                  <p className="text-base md:text-lg font-semibold text-center mb-3 text-primary">
                    {item.phom_word}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-emerald-100/20 dark:group-hover:bg-emerald-900/20 transition-colors"
                    onClick={() => handlePlayAudio(item)}
                    disabled={!item.audio_url || playingId === item.id}
                  >
                    {playingId === item.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Headphones className="mr-2 h-4 w-4" />
                    )}
                    {item.audio_url ? 'Listen' : 'No Audio'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Old Testament Section */}
      <section className="mb-12">
        <Card className="mb-6 bg-gradient-to-r from-amber-100/50 to-amber-50/20 dark:from-amber-900/30 dark:to-amber-800/10 border-amber-200/50 dark:border-amber-700/30">
          <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">Old Testament</h2>
            </div>
            <p className="text-xl text-amber-700 dark:text-amber-300 font-semibold">
              Lai Chang
            </p>
            <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
              39 Books
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePlaySectionAudio('old')}
              disabled={!oldTestamentAudioUrl || playingSection === 'old'}
              className="border-amber-300 hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/30"
            >
              {playingSection === 'old' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Headphones className="h-4 w-4 mr-2" />
              )}
              {oldTestamentAudioUrl ? 'Listen' : 'No Audio'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {oldTestamentBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <CardHeader className="pb-2 bg-gradient-to-r from-amber-100/30 to-amber-50/10 dark:from-amber-900/20 dark:to-amber-800/10">
                <CardTitle className="text-sm md:text-base text-center font-medium">
                  {book.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <p className="text-base md:text-lg font-semibold text-center mb-3 text-primary">
                  {book.phom_word}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-amber-100/20 dark:group-hover:bg-amber-900/20 transition-colors"
                  onClick={() => handlePlayAudio(book)}
                  disabled={!book.audio_url || playingId === book.id}
                >
                  {playingId === book.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Headphones className="mr-2 h-4 w-4" />
                  )}
                  {book.audio_url ? 'Listen' : 'No Audio'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New Testament Section */}
      <section>
        <Card className="mb-6 bg-gradient-to-r from-sky-100/50 to-sky-50/20 dark:from-sky-900/30 dark:to-sky-800/10 border-sky-200/50 dark:border-sky-700/30">
          <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              <h2 className="text-2xl font-bold text-sky-800 dark:text-sky-200">New Testament</h2>
            </div>
            <p className="text-xl text-sky-700 dark:text-sky-300 font-semibold">
              Lai Jaa
            </p>
            <p className="text-sm text-sky-600/70 dark:text-sky-400/70">
              27 Books
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePlaySectionAudio('new')}
              disabled={!newTestamentAudioUrl || playingSection === 'new'}
              className="border-sky-300 hover:bg-sky-100 dark:border-sky-600 dark:hover:bg-sky-800/30"
            >
              {playingSection === 'new' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Headphones className="h-4 w-4 mr-2" />
              )}
              {newTestamentAudioUrl ? 'Listen' : 'No Audio'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {newTestamentBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <CardHeader className="pb-2 bg-gradient-to-r from-sky-100/30 to-sky-50/10 dark:from-sky-900/20 dark:to-sky-800/10">
                <CardTitle className="text-sm md:text-base text-center font-medium">
                  {book.english_translation}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 pb-4">
                <p className="text-base md:text-lg font-semibold text-center mb-3 text-primary">
                  {book.phom_word}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-sky-100/20 dark:group-hover:bg-sky-900/20 transition-colors"
                  onClick={() => handlePlayAudio(book)}
                  disabled={!book.audio_url || playingId === book.id}
                >
                  {playingId === book.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Headphones className="mr-2 h-4 w-4" />
                  )}
                  {book.audio_url ? 'Listen' : 'No Audio'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BibleBooksPage;
