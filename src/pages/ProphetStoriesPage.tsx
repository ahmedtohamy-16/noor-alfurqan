import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Book, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { prophetStories, languages, getStoryByLanguage, type ProphetStory } from "@/data/prophetStories";
import ProphetStoryViewer from "@/components/ProphetStoryViewer";

const ProphetStoriesPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [selectedProphet, setSelectedProphet] = useState<ProphetStory | null>(null);

  const currentLanguage = languages.find(l => l.id === selectedLanguage);
  const isRTL = currentLanguage?.direction === 'rtl';

  const handleSelectProphet = (prophet: ProphetStory) => {
    setSelectedProphet(prophet);
  };

  const handleBack = () => {
    setSelectedProphet(null);
  };

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

        {/* Language Selector */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
            <div className="grid gap-3">
              {prophetStories.map((prophet) => {
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
          </div>
        </div>
      </div>
    </>
  );
};

export default ProphetStoriesPage;
