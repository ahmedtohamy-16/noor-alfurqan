import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useHadith } from "@/hooks/useHadith";
import { useHadithBookmarks } from "@/hooks/useHadithBookmarks";
import { useHadithShareCount } from "@/hooks/useHadithShareCount";
import { useHadithOfTheDay } from "@/hooks/useHadithOfTheDay";

import {
  hadithBooks,
  getBookById,
  type Hadith,
} from "@/data/hadithBooks";
import { HADITH_TOPICS } from "@/data/hadithTopics";
import { normalizeArabic } from "@/lib/arabicNormalize";

import HadithPageHeader from "@/components/hadith/HadithPageHeader";
import HadithOfTheDayCard from "@/components/hadith/HadithOfTheDayCard";
import HadithSearchBar from "@/components/hadith/HadithSearchBar";
import HadithBookTabs from "@/components/hadith/HadithBookTabs";
import HadithTopicChips from "@/components/hadith/HadithTopicChips";
import HadithSortMenu, { type HadithSort } from "@/components/hadith/HadithSortMenu";
import HadithCardV2 from "@/components/hadith/HadithCardV2";
import HadithSkeleton from "@/components/hadith/HadithSkeleton";
import HadithBackToTop from "@/components/hadith/HadithBackToTop";
import HadithDetailsSheet from "@/components/hadith/HadithDetailsSheet";
import HadithShareDialog from "@/components/HadithShareDialog";

import { Tabs, TabsContent } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const HadithPage = () => {
  const { fetchHadiths, searchHadiths } = useHadith();
  const { bookmarks, isBookmarked, toggle: toggleBookmark } = useHadithBookmarks();
  const { incrementShare, fetchTopShared } = useHadithShareCount();
  const { hadith: hadithOfDay, loading: loadingDay } = useHadithOfTheDay();

  const [selectedBook, setSelectedBook] = useState<string>("bukhari"); // 'all' supported
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sort, setSort] = useState<HadithSort>("default");

  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const isSearchMode = debouncedQuery.trim().length > 0;
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [detailsHadith, setDetailsHadith] = useState<Hadith | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [shareHadith, setShareHadith] = useState<Hadith | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Load list when book changes
  useEffect(() => {
    if (isSearchMode) return;
    let cancelled = false;
    setLoadingList(true);
    setHadiths([]);
    setCurrentPage(1);
    (async () => {
      try {
        const bookId =
          selectedBook === "all" ? hadithBooks[0].id : selectedBook;
        const data = await fetchHadiths(bookId, 1, ITEMS_PER_PAGE);
        if (cancelled) return;
        setHadiths(data.hadiths);
        setHasMore(data.hasMore);
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedBook, isSearchMode, fetchHadiths]);

  // Load more
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || isSearchMode) return;
    setLoadingMore(true);
    try {
      const bookId = selectedBook === "all" ? hadithBooks[0].id : selectedBook;
      const data = await fetchHadiths(bookId, currentPage + 1, ITEMS_PER_PAGE);
      setHadiths((prev) => [...prev, ...data.hadiths]);
      setCurrentPage((p) => p + 1);
      setHasMore(data.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, isSearchMode, selectedBook, currentPage, fetchHadiths]);

  // Search
  useEffect(() => {
    if (!isSearchMode) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    (async () => {
      try {
        const bookId =
          selectedBook === "all" ? hadithBooks[0].id : selectedBook;
        const res = await searchHadiths(bookId, debouncedQuery);
        if (!cancelled) setSearchResults(res.results || []);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isSearchMode, selectedBook, searchHadiths]);

  // Topic filtering (client-side on currently loaded items)
  const filteredByTopic = useMemo(() => {
    const base = isSearchMode ? searchResults : hadiths;
    if (selectedTopics.length === 0) return base;
    const keywordSets = selectedTopics
      .map((id) => HADITH_TOPICS.find((t) => t.id === id)?.keywords || [])
      .filter((k) => k.length > 0);
    if (keywordSets.length === 0) return base;
    return base.filter((h) => {
      const nText = normalizeArabic(h.text + " " + (h.narrator || ""));
      return keywordSets.some((set) => set.some((kw) => nText.includes(kw)));
    });
  }, [hadiths, searchResults, selectedTopics, isSearchMode]);

  // Sort
  const [topShared, setTopShared] = useState<Record<string, number>>({});
  useEffect(() => {
    if (sort !== "most_shared") return;
    const bookId = selectedBook === "all" ? null : selectedBook;
    fetchTopShared(bookId, 200).then((rows) => {
      const map: Record<string, number> = {};
      rows.forEach((r) => {
        map[`${r.bookId}::${r.hadithNumber}`] = r.count;
      });
      setTopShared(map);
    });
  }, [sort, selectedBook, fetchTopShared]);

  const displayed = useMemo(() => {
    const arr = [...filteredByTopic];
    switch (sort) {
      case "most_shared": {
        return arr.sort((a, b) => {
          const ka = topShared[`${a.bookId}::${a.hadithNumber}`] || 0;
          const kb = topShared[`${b.bookId}::${b.hadithNumber}`] || 0;
          return kb - ka;
        });
      }
      case "random": {
        return arr.sort(() => Math.random() - 0.5);
      }
      case "by_narrator": {
        return arr.sort((a, b) =>
          (a.narrator || "").localeCompare(b.narrator || "", "ar")
        );
      }
      default:
        return arr;
    }
  }, [filteredByTopic, sort, topShared]);

  // Actions
  const handleCopy = async (h: Hadith) => {
    const book = getBookById(h.bookId);
    const text = `${h.text}\n\n— ${book?.nameAr || ""} (${h.hadithNumber})`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(h.id);
      toast.success("تم نسخ الحديث");
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error("فشل في النسخ");
    }
  };

  const handleShare = async (h: Hadith) => {
    incrementShare(h.bookId, h.hadithNumber);
    setShareHadith(h);
    setShareOpen(true);
  };

  const handleOpenDetails = (h: Hadith) => {
    setDetailsHadith(h);
    setDetailsOpen(true);
  };

  const handleToggleBookmark = async (h: Hadith) => {
    await toggleBookmark({
      bookId: h.bookId,
      hadithNumber: h.hadithNumber,
      text: h.text,
      narrator: h.narrator,
      grade: h.grade,
    });
  };

  // Infinite scroll sentinel
  useEffect(() => {
    if (isSearchMode) return;
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 600;
      if (nearBottom && !loadingMore && hasMore) handleLoadMore();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleLoadMore, isSearchMode, loadingMore, hasMore]);

  return (
    <TooltipProvider>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta
          name="description"
          content="مكتبة الأحاديث النبوية الشريفة من الكتب التسعة مع بحث ذكي عربي وحديث اليوم"
        />
      </Helmet>

      <div className="min-h-screen bg-background pb-28" dir="rtl">
        <div className="fixed inset-0 islamic-pattern opacity-[0.04] pointer-events-none" />

        <HadithPageHeader bookmarkCount={bookmarks.length} />

        <main className="relative z-10 space-y-5">
          <HadithOfTheDayCard
            hadith={hadithOfDay}
            loading={loadingDay}
            onShare={handleShare}
          />

          <HadithSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            isSearching={isSearching}
            resultsCount={searchResults.length}
            showCount={isSearchMode && !isSearching}
          />

          <HadithBookTabs
            selectedBookId={selectedBook}
            onSelect={setSelectedBook}
          />

          <HadithTopicChips
            selected={selectedTopics}
            onToggle={(id) =>
              setSelectedTopics((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id]
              )
            }
          />

          <div className="flex items-center justify-between px-4">
            <span className="text-xs text-muted-foreground">
              {displayed.length.toLocaleString("ar-EG")} حديث
            </span>
            <HadithSortMenu value={sort} onChange={setSort} />
          </div>

          {/* List */}
          {loadingList || (isSearchMode && isSearching) ? (
            <HadithSkeleton />
          ) : displayed.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p
                className="text-base font-bold mb-2"
                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
              >
                لا توجد نتائج
              </p>
              <p className="text-xs text-muted-foreground">
                جرّب كلمة أخرى أو غيّر الكتاب/الموضوع
              </p>
            </div>
          ) : (
            <div className="space-y-4 px-4">
              {displayed.map((h, i) => (
                <HadithCardV2
                  key={`${h.bookId}-${h.hadithNumber}-${h.id}`}
                  hadith={h}
                  index={i}
                  searchQuery={isSearchMode ? debouncedQuery : undefined}
                  isBookmarked={isBookmarked({ bookId: h.bookId, hadithNumber: h.hadithNumber })}
                  isCopied={copiedId === h.id}
                  onToggleBookmark={() => handleToggleBookmark(h)}
                  onCopy={() => handleCopy(h)}
                  onShare={() => handleShare(h)}
                  onOpenDetails={() => handleOpenDetails(h)}
                />
              ))}

              {!isSearchMode && hasMore && (
                <div className="py-6 flex justify-center">
                  {loadingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Button variant="outline" onClick={handleLoadMore} className="rounded-full">
                      تحميل المزيد
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        <HadithBackToTop />

        <HadithDetailsSheet
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          hadith={detailsHadith}
        />

        {shareHadith && (
          <HadithShareDialog
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
            hadithText={shareHadith.text}
            bookName={getBookById(shareHadith.bookId)?.nameAr || ""}
            hadithNumber={shareHadith.hadithNumber}
            narrator={shareHadith.narrator}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default HadithPage;
