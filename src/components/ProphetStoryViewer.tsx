import { ArrowRight, ArrowLeft, Lightbulb, Share2, BookOpen, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ProphetStory, ExtendedStory } from "@/data/prophetStories";
import { prophetLocationsData } from "@/data/prophetLocations";
import ProphetStoryMap from "./ProphetStoryMap";

// Import prophet images
import adamImg from "@/assets/prophets/adam.jpg";
import idrisImg from "@/assets/prophets/idris.jpg";
import nuhImg from "@/assets/prophets/nuh.jpg";
import hudImg from "@/assets/prophets/hud.jpg";
import salehImg from "@/assets/prophets/saleh.jpg";
import ibrahimImg from "@/assets/prophets/ibrahim.jpg";
import ismailImg from "@/assets/prophets/ismail.jpg";
import ishaqImg from "@/assets/prophets/ishaq.jpg";
import yaqubImg from "@/assets/prophets/yaqub.jpg";
import yusufImg from "@/assets/prophets/yusuf.jpg";
import ayyubImg from "@/assets/prophets/ayyub.jpg";
import shuaybImg from "@/assets/prophets/shuayb.jpg";
import musaImg from "@/assets/prophets/musa.jpg";
import harunImg from "@/assets/prophets/harun.jpg";
import dhulkiflImg from "@/assets/prophets/dhulkifl.jpg";
import dawudImg from "@/assets/prophets/dawud.jpg";
import sulaymanImg from "@/assets/prophets/sulayman.jpg";
import ilyasImg from "@/assets/prophets/ilyas.jpg";
import alyasaImg from "@/assets/prophets/alyasa.jpg";
import yunusImg from "@/assets/prophets/yunus.jpg";
import zakariyaImg from "@/assets/prophets/zakariya.jpg";
import yahyaImg from "@/assets/prophets/yahya.jpg";
import isaImg from "@/assets/prophets/isa.jpg";
import muhammadImg from "@/assets/prophets/muhammad.jpg";
import lutImg from "@/assets/prophets/lut.jpg";

const prophetImageMap: Record<string, string> = {
  adam: adamImg, idris: idrisImg, nuh: nuhImg, hud: hudImg, saleh: salehImg,
  ibrahim: ibrahimImg, ismail: ismailImg, ishaq: ishaqImg, yaqub: yaqubImg,
  yusuf: yusufImg, ayyub: ayyubImg, shuayb: shuaybImg, musa: musaImg,
  harun: harunImg, dhulkifl: dhulkiflImg, dawud: dawudImg, sulayman: sulaymanImg,
  ilyas: ilyasImg, alyasa: alyasaImg, yunus: yunusImg, zakariya: zakariyaImg,
  yahya: yahyaImg, isa: isaImg, muhammad: muhammadImg, lut: lutImg,
};

interface ProphetStoryViewerProps {
  prophet: ProphetStory;
  story: ExtendedStory | null;
  language: string;
  isRTL: boolean;
  onBack: () => void;
}

const ProphetStoryViewer = ({ prophet, story, language, isRTL, onBack }: ProphetStoryViewerProps) => {
  const prophetName = isRTL ? prophet.name.ar : (prophet.name[language.split('-')[0] as keyof typeof prophet.name] || prophet.name.en);
  const prophetImage = prophetImageMap[prophet.id];
  const locationData = prophetLocationsData.find(l => l.prophetId === prophet.id);

  const handleShare = async () => {
    if (story) {
      try {
        await navigator.share({ title: story.title, text: story.content.substring(0, 200) + '...', url: window.location.href });
      } catch (err) {
        await navigator.clipboard.writeText(story.content);
        toast.success(isRTL ? 'تم نسخ القصة' : 'Story copied');
      }
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{isRTL ? 'القصة غير متوفرة بهذه اللغة' : 'Story not available in this language'}</p>
            <Button onClick={onBack} className="mt-4">{isRTL ? 'العودة' : 'Go Back'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">{prophetName}</h1>
          <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="w-5 h-5" /></Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="px-4 py-6 max-w-4xl mx-auto">
          {/* Hero Image */}
          {prophetImage && (
            <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 shadow-lg">
              <img src={prophetImage} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">{prophet.era}</Badge>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-foreground leading-relaxed mb-4">{story.title}</h2>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-foreground/90 leading-relaxed text-lg mb-4">{paragraph}</p>
            ))}
          </div>

          {/* Map */}
          {locationData && <ProphetStoryMap locationData={locationData} isRTL={isRTL} />}

          {/* Quran Verses */}
          {story.quranVerses && story.quranVerses.length > 0 && (
            <Card className="mt-8 bg-emerald-500/10 border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-lg text-foreground">{isRTL ? 'آيات من القرآن الكريم' : 'Verses from the Holy Quran'}</h3>
                </div>
                <div className="space-y-4">
                  {story.quranVerses.map((verse, index) => (
                    <div key={index} className="bg-background/50 rounded-lg p-4 border border-emerald-500/10">
                      <p className="text-lg font-arabic leading-loose text-foreground mb-2" dir="rtl">{verse.arabic}</p>
                      {verse.translation && !isRTL && <p className="text-muted-foreground text-sm italic">{verse.translation}</p>}
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{verse.reference}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hadiths */}
          {story.hadiths && story.hadiths.length > 0 && (
            <Card className="mt-6 bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-bold text-lg text-foreground">{isRTL ? 'أحاديث نبوية شريفة' : 'Prophetic Hadiths'}</h3>
                </div>
                <div className="space-y-4">
                  {story.hadiths.map((hadith, index) => (
                    <div key={index} className="bg-background/50 rounded-lg p-4 border border-amber-500/10">
                      <p className="text-foreground leading-relaxed mb-2" dir={isRTL ? 'rtl' : 'ltr'}>"{hadith.text}"</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">{hadith.source}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lessons */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">{isRTL ? 'الدروس والعبر' : 'Lessons & Morals'}</h3>
              </div>
              <ul className="space-y-3">
                {story.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">{index + 1}</span>
                    <span className="text-foreground/80">{lesson}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProphetStoryViewer;
