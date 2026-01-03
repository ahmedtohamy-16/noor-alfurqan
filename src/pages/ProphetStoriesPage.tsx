import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Book, Globe, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { prophetStories, languages, getStoryByLanguage, type ProphetStory, type ExtendedStory } from "@/data/prophetStories";
import ProphetStoryViewer from "@/components/ProphetStoryViewer";
import { useAuth } from "@/hooks/useAuth";
import { firestoreGet, firestoreSet, COLLECTIONS } from "@/lib/firebase";

const ProphetStoriesPage = () => {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [selectedProphet, setSelectedProphet] = useState<ProphetStory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentLanguage = languages.find(l => l.id === selectedLanguage);
  const isRTL = currentLanguage?.direction === 'rtl';

  // Load saved language preference
  useEffect(() => {
    const loadPreference = async () => {
      if (user) {
        const data = await firestoreGet<any>('user_story_preferences', user.uid);
        if (data?.preferred_language) {
          setSelectedLanguage(data.preferred_language);
        }
      }
    };
    loadPreference();
  }, [user]);

  // Save language preference
  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    
    if (user) {
      await firestoreSet('user_story_preferences', user.uid, {
        user_id: user.uid,
        preferred_language: newLanguage,
      });
    }
  };

  const handleSelectProphet = (prophet: ProphetStory) => {
    setSelectedProphet(prophet);
  };

  const handleBack = () => {
    setSelectedProphet(null);
  };

  // Filter prophets based on search
  const filteredProphets = useMemo(() => {
    if (!searchQuery.trim()) return prophetStories;
    
    const query = searchQuery.toLowerCase();
    return prophetStories.filter((prophet) => {
      const story = getStoryByLanguage(prophet.id, selectedLanguage);
      const prophetName = isRTL ? prophet.name.ar : (prophet.name[selectedLanguage.split('-')[0] as keyof typeof prophet.name] || prophet.name.en);
      
      return (
        prophetName.toLowerCase().includes(query) ||
        prophet.era.toLowerCase().includes(query) ||
        story?.title.toLowerCase().includes(query) ||
        story?.content.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedLanguage, isRTL]);

  if (selectedProphet) {
    const story = getStoryByLanguage(selectedProphet.id, selectedLanguage);
    return (
      <ProphetStoryViewer
        prophet={selectedProphet}
        story={story}
        language={selectedLanguage}
        isRTL={isRTL}
        onBack={handleBack}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>قصص الأنبياء | Stories of the Prophets</title>
        <meta name="description" content="اقرأ قصص الأنبياء بلغات ولهجات مختلفة - Read stories of the Prophets in different languages and dialects" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Book className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">قصص الأنبياء</h1>
            <p className="text-muted-foreground">Stories of the Prophets</p>
          </div>
        </div>

        {/* Search and Language Selector */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 space-y-3">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? "ابحث عن نبي أو قصة..." : "Search for a prophet or story..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    اللهجات العربية
                  </div>
                  {languages.filter(l => l.id.startsWith('ar')).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      <div className="flex items-center gap-2">
                        <span>{lang.nameNative}</span>
                        <span className="text-muted-foreground text-xs">({lang.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-t mt-1 pt-2">
                    اللغات الأخرى
                  </div>
                  {languages.filter(l => !l.id.startsWith('ar')).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      <div className="flex items-center gap-2">
                        <span>{lang.nameNative}</span>
                        <span className="text-muted-foreground text-xs">({lang.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Prophets List */}
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {filteredProphets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isRTL ? 'لم يتم العثور على نتائج' : 'No results found'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredProphets.map((prophet) => {
                  const story = getStoryByLanguage(prophet.id, selectedLanguage);
                  const prophetName = isRTL ? prophet.name.ar : (prophet.name[selectedLanguage.split('-')[0] as keyof typeof prophet.name] || prophet.name.en);
                  
                  return (
                    <Card 
                      key={prophet.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleSelectProphet(prophet)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-primary">{prophet.order}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-foreground">{prophetName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {prophet.era}
                                </Badge>
                                {story && (
                                  <span className="text-xs text-muted-foreground">
                                    {story.lessons.length} {isRTL ? 'دروس' : 'lessons'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProphetStoriesPage;
