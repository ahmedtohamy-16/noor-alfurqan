import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Users, Ban, Mail, BarChart3, 
  Search, Shield, Send, X, Check, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  firestoreQuery, 
  firestoreSet, 
  firestoreDelete, 
  COLLECTIONS,
  getFirestoreDb
} from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
}

interface BlockedUser {
  id: string;
  user_id: string;
  reason: string | null;
  blocked_at: string;
  profile?: UserProfile;
}

interface UsageStats {
  total_users: number;
  today_reading_sessions: number;
  today_tasbih_sessions: number;
  total_favorites: number;
  blocked_users_count: number;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<UserProfile | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(false);
  
  // Block dialog
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const roles = await firestoreQuery<any>(
        'user_roles',
        [
          { field: "user_id", op: "==", value: user.uid },
          { field: "role", op: "==", value: "admin" }
        ]
      );

      if (roles.length === 0) {
        toast.error("ليس لديك صلاحية الوصول");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await Promise.all([fetchUsers(), fetchBlockedUsers(), fetchStats()]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const db = getFirestoreDb();
      const q = query(collection(db, COLLECTIONS.PROFILES), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const data = await firestoreQuery<BlockedUser>(
        'blocked_users',
        [],
        'blocked_at',
        'desc'
      );
      setBlockedUsers(data);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from Firestore
      const db = getFirestoreDb();
      const today = new Date().toISOString().split('T')[0];
      
      const [profilesSnap, readingSnap, tasbihSnap, favoritesSnap, blockedSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.PROFILES)),
        getDocs(collection(db, COLLECTIONS.READING_SESSIONS)),
        getDocs(collection(db, COLLECTIONS.TASBIH_STATS)),
        getDocs(collection(db, COLLECTIONS.FAVORITES)),
        getDocs(collection(db, 'blocked_users')),
      ]);

      const todayReadingSessions = readingSnap.docs.filter(d => 
        d.data().session_date === today
      ).length;

      const todayTasbihSessions = tasbihSnap.docs.filter(d => 
        d.data().session_date === today
      ).length;

      setStats({
        total_users: profilesSnap.size,
        today_reading_sessions: todayReadingSessions,
        today_tasbih_sessions: todayTasbihSessions,
        total_favorites: favoritesSnap.size,
        blocked_users_count: blockedSnap.size,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleBlockUser = async () => {
    if (!userToBlock || !user) return;

    try {
      const docId = `${userToBlock.id}_${Date.now()}`;
      await firestoreSet('blocked_users', docId, {
        user_id: userToBlock.id,
        blocked_by: user.uid,
        reason: blockReason || null,
        blocked_at: new Date().toISOString(),
      });

      // Update profile
      await firestoreSet(COLLECTIONS.PROFILES, userToBlock.id, {
        is_blocked: true,
      });

      toast.success("تم حظر المستخدم");
      setBlockDialogOpen(false);
      setBlockReason("");
      setUserToBlock(null);
      await Promise.all([fetchUsers(), fetchBlockedUsers(), fetchStats()]);
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("فشل في حظر المستخدم");
    }
  };

  const handleUnblockUser = async (blockedUser: BlockedUser) => {
    try {
      await firestoreDelete('blocked_users', blockedUser.id);
      await firestoreSet(COLLECTIONS.PROFILES, blockedUser.user_id, {
        is_blocked: false,
      });

      toast.success("تم إلغاء الحظر");
      await Promise.all([fetchUsers(), fetchBlockedUsers(), fetchStats()]);
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("فشل في إلغاء الحظر");
    }
  };

  const handleSendMessage = async () => {
    if (!user || (!messageRecipient && !isBroadcast)) return;

    try {
      const docId = `msg_${Date.now()}`;
      await firestoreSet('admin_messages', docId, {
        sender_id: user.uid,
        recipient_id: isBroadcast ? null : messageRecipient?.id,
        subject: messageSubject,
        message: messageContent,
        is_broadcast: isBroadcast,
        created_at: new Date().toISOString(),
      });

      toast.success(isBroadcast ? "تم إرسال الرسالة للجميع" : "تم إرسال الرسالة");
      setMessageDialogOpen(false);
      setMessageSubject("");
      setMessageContent("");
      setMessageRecipient(null);
      setIsBroadcast(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("فشل في إرسال الرسالة");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.includes(searchQuery)
  );

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              لوحة الإدارة
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.total_users}</p>
              <p className="text-xs text-muted-foreground">المستخدمين</p>
            </Card>
            <Card className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.today_reading_sessions}</p>
              <p className="text-xs text-muted-foreground">جلسات القراءة اليوم</p>
            </Card>
            <Card className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.today_tasbih_sessions}</p>
              <p className="text-xs text-muted-foreground">جلسات التسبيح اليوم</p>
            </Card>
            <Card className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.total_favorites}</p>
              <p className="text-xs text-muted-foreground">المفضلات</p>
            </Card>
            <Card className="p-4 text-center">
              <Ban className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.blocked_users_count}</p>
              <p className="text-xs text-muted-foreground">محظورين</p>
            </Card>
          </div>
        )}

        {/* Broadcast Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setIsBroadcast(true);
              setMessageDialogOpen(true);
            }}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            إرسال رسالة للجميع
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              المستخدمين ({users.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" className="gap-2">
              <Ban className="w-4 h-4" />
              المحظورين ({blockedUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12"
              />
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.map((profile) => (
                <Card key={profile.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {profile.username || "مستخدم"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(profile.created_at || "").toLocaleDateString("ar")}
                        </p>
                      </div>
                      {profile.is_blocked && (
                        <span className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs">
                          محظور
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMessageRecipient(profile);
                          setIsBroadcast(false);
                          setMessageDialogOpen(true);
                        }}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      {!profile.is_blocked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUserToBlock(profile);
                            setBlockDialogOpen(true);
                          }}
                        >
                          <Ban className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blocked">
            <div className="space-y-3">
              {blockedUsers.length === 0 ? (
                <Card className="p-8 text-center">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">لا يوجد مستخدمين محظورين</p>
                </Card>
              ) : (
                blockedUsers.map((blocked) => (
                  <Card key={blocked.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {blocked.user_id.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          السبب: {blocked.reason || "غير محدد"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(blocked.blocked_at).toLocaleDateString("ar")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockUser(blocked)}
                      >
                        إلغاء الحظر
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Block Dialog */}
        <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <DialogContent className="arabic-ui">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                حظر المستخدم
              </DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حظر "{userToBlock?.username || "هذا المستخدم"}"؟
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="سبب الحظر (اختياري)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={handleBlockUser}>
                حظر
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="arabic-ui">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {isBroadcast ? "إرسال رسالة للجميع" : `إرسال رسالة لـ ${messageRecipient?.username || "المستخدم"}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="عنوان الرسالة"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
              <Textarea
                placeholder="محتوى الرسالة"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSendMessage} disabled={!messageSubject || !messageContent}>
                <Send className="w-4 h-4 ml-2" />
                إرسال
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminPage;
