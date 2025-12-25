import { ArrowRight, ArrowLeft, Lightbulb, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ProphetStory } from "@/data/prophetStories";

interface ProphetStoryViewerProps {
  prophet: ProphetStory;
  story: {
    title: string;
    content: string;
    lessons: string[];
  } | null;
  language: string;
  isRTL: boolean;
  onBack: () => void;
}

const ProphetStoryViewer = ({ prophet, story, language, isRTL, onBack }: ProphetStoryViewerProps) => {
  const prophetName = isRTL ? prophet.name.ar : (prophet.name[language.split('-')[0] as keyof typeof prophet.name] || prophet.name.en);

  const handleShare = async () => {
    if (story) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 200) + '...',
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
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
            <p className="text-muted-foreground">
              {isRTL ? 'القصة غير متوفرة بهذه اللغة' : 'Story not available in this language'}
            </p>
            <Button onClick={onBack} className="mt-4">
              {isRTL ? 'العودة' : 'Go Back'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">{prophetName}</h1>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="px-4 py-6 max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground leading-relaxed">{story.title}</h2>
            <Badge variant="secondary" className="mt-2">{prophet.era}</Badge>
          </div>

          {/* Story Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-foreground/90 leading-relaxed text-lg mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Lessons */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">
                  {isRTL ? 'الدروس والعبر' : 'Lessons & Morals'}
                </h3>
              </div>
              <ul className="space-y-3">
                {story.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
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
