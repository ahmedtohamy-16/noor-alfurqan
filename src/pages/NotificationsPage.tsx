import { useState, useEffect } from "react";
import { Bell, Trash2, Check, Clock, BookOpen, Sunrise, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { firestoreQuery, firestoreSet, firestoreDelete, COLLECTIONS } from "@/lib/firebase";
import { toast } from "sonner";
import Header from "@/components/Header";

interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  notification_type: string;
  tag: string | null;
  read: boolean;
  created_at: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "wird":
      return <BookOpen className="w-5 h-5 text-green-500" />;
    case "prayer":
      return <Clock className="w-5 h-5 text-primary" />;
    case "azkar":
      return <Sunrise className="w-5 h-5 text-amber-500" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case "wird":
      return <Badge variant="secondary" className="bg-green-500/10 text-green-600">الورد اليومي</Badge>;
    case "prayer":
      return <Badge variant="secondary" className="bg-primary/10 text-primary">الصلاة</Badge>;
    case "azkar":
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">الأذكار</Badge>;
    default:
      return <Badge variant="secondary">عام</Badge>;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return date.toLocaleDateString("ar-SA", { 
    day: "numeric", 
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined 
  });
};

type FilterTab = "all" | "social" | "islamic";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await firestoreQuery<NotificationItem>(
        COLLECTIONS.NOTIFICATION_HISTORY,
        [{ field: "user_id", op: "==", value: user.uid }],
        "created_at",
        "desc",
        100
      );
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await firestoreSet(COLLECTIONS.NOTIFICATION_HISTORY, id, { read: true });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(
        unread.map(n => firestoreSet(COLLECTIONS.NOTIFICATION_HISTORY, n.id, { read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("تم تحديد الكل كمقروء");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await firestoreDelete(COLLECTIONS.NOTIFICATION_HISTORY, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("تم حذف الإشعار");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("حدث خطأ في الحذف");
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    
    try {
      await Promise.all(
        notifications.map(n => firestoreDelete(COLLECTIONS.NOTIFICATION_HISTORY, n.id))
      );
      setNotifications([]);
      toast.success("تم حذف جميع الإشعارات");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("حدث خطأ في الحذف");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 arabic-ui">
          <Card className="p-8 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">الإشعارات</h2>
            <p className="text-muted-foreground">يرجى تسجيل الدخول لعرض الإشعارات</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <div className="container mx-auto px-4 py-6 arabic-ui">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">الإشعارات</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="w-4 h-4 ml-1" />
                  قراءة الكل
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4 ml-1" />
                حذف الكل
              </Button>
            </div>
          )}
        </div>

        {/* Tabs (All / Social / Islamic) */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-none">
          {([
            { key: "all", label: "All" },
            { key: "social", label: "Social" },
            { key: "islamic", label: "Islamic" },
          ] as { key: FilterTab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                filter === t.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">لا توجد إشعارات</h2>
            <p className="text-muted-foreground text-sm">
              ستظهر هنا الإشعارات التي تصلك
            </p>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {notifications
                .filter((n) => {
                  if (filter === "all") return true;
                  const islamicTypes = ["wird", "prayer", "azkar"];
                  const isIslamic = islamicTypes.includes(n.notification_type);
                  return filter === "islamic" ? isIslamic : !isIslamic;
                })
                .map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 transition-all ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationBadge(notification.notification_type)}
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <h3 className="font-bold text-foreground">{notification.title}</h3>
                          {notification.body && (
                            <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
