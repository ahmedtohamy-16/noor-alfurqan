import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Shield, 
  BarChart3, 
  ArrowRight,
  GraduationCap,
  UserCog,
  Plus,
  Trash2,
  Edit,
  Eye,
  Ban,
  Mail,
  Search,
  Send,
  Check,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, UserProfile, firestoreSet, firestoreDelete, COLLECTIONS, getFirestoreDb } from "@/lib/firebase";
import { getAllUsers, updateUserRole, countUsersByRole } from "@/services/userService";
import { 
  getPublishedLessons, 
  getLessonsByTeacher,
  createLesson, 
  deleteLesson,
  togglePublishStatus,
  Lesson 
} from "@/services/lessonService";
import { collection, getDocs } from "firebase/firestore";
import ProAdminsManager from "@/components/pro/ProAdminsManager";
import ProRedeemCodeManager from "@/components/pro/ProRedeemCodeManager";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, role, isAdmin, isTeacher, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<Record<UserRole, number>>({ admin: 0, teacher: 0, student: 0 });
  const [totalStats, setTotalStats] = useState({ users: 0, lessons: 0, favorites: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Lesson dialog
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    content: "",
    category: "general" as Lesson["category"],
    level: "beginner" as Lesson["level"],
  });

  // Message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<UserProfile | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Wait for role to be loaded
    if (role === null && !isLoading) {
      return;
    }
    
    loadData();
  }, [user, role, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (isAdmin) {
        const [fetchedUsers, fetchedStats] = await Promise.all([
          getAllUsers(),
          countUsersByRole()
        ]);
        setUsers(fetchedUsers);
        setStats(fetchedStats);

        // Get additional stats
        const db = getFirestoreDb();
        const [lessonsSnap, favoritesSnap] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.LESSONS)),
          getDocs(collection(db, COLLECTIONS.FAVORITES)),
        ]);
        
        setTotalStats({
          users: fetchedUsers.length,
          lessons: lessonsSnap.size,
          favorites: favoritesSnap.size,
        });
      }
      
      // Teachers and admins can see lessons
      if (isTeacher || isAdmin) {
        const fetchedLessons = isAdmin 
          ? await getPublishedLessons()
          : user ? await getLessonsByTeacher(user.uid) : [];
        setLessons(fetchedLessons);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("تم تحديث الصلاحية بنجاح");
      loadData();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("حدث خطأ في تحديث الصلاحية");
    }
  };

  const handleCreateLesson = async () => {
    if (!newLesson.title || !newLesson.content) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await createLesson({
        ...newLesson,
        teacherId: user!.uid,
        teacherName: userProfile?.displayName || user?.displayName || "معلم",
        isPublished: false,
        viewCount: 0,
      });
      toast.success("تم إنشاء الدرس بنجاح");
      setShowLessonDialog(false);
      setNewLesson({ title: "", description: "", content: "", category: "general", level: "beginner" });
      loadData();
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("حدث خطأ في إنشاء الدرس");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      toast.success("تم حذف الدرس بنجاح");
      loadData();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("حدث خطأ في حذف الدرس");
    }
  };

  const handleTogglePublish = async (lessonId: string) => {
    try {
      await togglePublishStatus(lessonId);
      toast.success("تم تحديث حالة النشر");
      loadData();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("حدث خطأ في تحديث الحالة");
    }
  };

  const handleSendMessage = async () => {
    if (!user || (!messageRecipient && !isBroadcast)) return;

    try {
      const docId = `msg_${Date.now()}`;
      await firestoreSet('admin_messages', docId, {
        sender_id: user.uid,
        recipient_id: isBroadcast ? null : messageRecipient?.uid,
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

  const getRoleBadge = (userRole: UserRole) => {
    const config = {
      admin: { label: "مسؤول", variant: "destructive" as const },
      teacher: { label: "معلم", variant: "default" as const },
      student: { label: "طالب", variant: "secondary" as const },
    };
    return <Badge variant={config[userRole].variant}>{config[userRole].label}</Badge>;
  };

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.includes(searchQuery)
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">لوحة الإدارة</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <div className="space-y-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  // Access denied for non-teachers/non-admins
  if (!isAdmin && !isTeacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">غير مصرح لك بالوصول</h2>
            <p className="text-muted-foreground mb-4">
              هذه الصفحة متاحة للمعلمين والمسؤولين فقط
            </p>
            <Button onClick={() => navigate("/")}>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {isAdmin ? "لوحة الإدارة" : "لوحة المعلم"}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 arabic-ui">
        {/* Stats Cards - Admin Only */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.student}</p>
                    <p className="text-sm text-muted-foreground">طالب</p>
                  </div>
                  <GraduationCap className="w-10 h-10 text-primary opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.teacher}</p>
                    <p className="text-sm text-muted-foreground">معلم</p>
                  </div>
                  <Users className="w-10 h-10 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{totalStats.lessons}</p>
                    <p className="text-sm text-muted-foreground">درس</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{totalStats.favorites}</p>
                    <p className="text-sm text-muted-foreground">مفضلة</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-amber-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Quick Actions */}
        {isAdmin && (
          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate("/user-management")}
              className="gap-2"
            >
              <UserCog className="w-4 h-4" />
              إدارة المستخدمين
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/teacher")}
              className="gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              لوحة المعلم
            </Button>
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
        )}

        {/* Tabs */}
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-1"}`}>
            <TabsTrigger value="lessons">الدروس</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">المستخدمين</TabsTrigger>}
            {isAdmin && <TabsTrigger value="pro">Pro</TabsTrigger>}
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex justify-between items-center">
              <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    درس جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-right">إنشاء درس جديد</DialogTitle>
                    <DialogDescription className="text-right">
                      أضف درساً جديداً للطلاب
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="عنوان الدرس"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      className="text-right"
                    />
                    <Textarea
                      placeholder="وصف الدرس"
                      value={newLesson.description}
                      onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                      className="text-right"
                    />
                    <Textarea
                      placeholder="محتوى الدرس"
                      value={newLesson.content}
                      onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                      className="text-right min-h-[150px]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={newLesson.category}
                        onValueChange={(v) => setNewLesson({ ...newLesson, category: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tajweed">التجويد</SelectItem>
                          <SelectItem value="tafsir">التفسير</SelectItem>
                          <SelectItem value="memorization">الحفظ</SelectItem>
                          <SelectItem value="general">عام</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={newLesson.level}
                        onValueChange={(v) => setNewLesson({ ...newLesson, level: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">مبتدئ</SelectItem>
                          <SelectItem value="intermediate">متوسط</SelectItem>
                          <SelectItem value="advanced">متقدم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateLesson} className="w-full">
                      إنشاء الدرس
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <h3 className="text-lg font-semibold">الدروس ({lessons.length})</h3>
            </div>

            {lessons.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد دروس بعد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteLesson(lesson.id!)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleTogglePublish(lesson.id!)}
                          >
                            <Eye className={`w-4 h-4 ${lesson.isPublished ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                        </div>
                        <div className="text-right flex-1">
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                              {lesson.isPublished ? "منشور" : "مسودة"}
                            </Badge>
                            <h4 className="font-semibold">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                          <div className="flex gap-2 justify-end">
                            <Badge variant="outline">{lesson.category}</Badge>
                            <Badge variant="outline">{lesson.level}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {lesson.viewCount} مشاهدة
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="users" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن مستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-right flex items-center justify-end gap-2">
                    <span>إدارة المستخدمين ({filteredUsers.length})</span>
                    <UserCog className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الإجراءات</TableHead>
                          <TableHead className="text-right">الصلاحية</TableHead>
                          <TableHead className="text-right">البريد</TableHead>
                          <TableHead className="text-right">الاسم</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.uid}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={u.role}
                                  onValueChange={(v) => handleRoleChange(u.uid, v as UserRole)}
                                  disabled={u.uid === user?.uid}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="student">طالب</SelectItem>
                                    <SelectItem value="teacher">معلم</SelectItem>
                                    <SelectItem value="admin">مسؤول</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setMessageRecipient(u);
                                    setIsBroadcast(false);
                                    setMessageDialogOpen(true);
                                  }}
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(u.role)}</TableCell>
                            <TableCell className="text-right">{u.email}</TableCell>
                            <TableCell className="text-right font-medium">{u.displayName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="pro" className="space-y-4">
              <ProRedeemCodeManager />
              <ProAdminsManager />
            </TabsContent>
          )}
        </Tabs>

        {/* Message Dialog */}
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="arabic-ui">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 justify-end">
                {isBroadcast ? "إرسال رسالة للجميع" : `إرسال رسالة لـ ${messageRecipient?.displayName || "المستخدم"}`}
                <Mail className="w-5 h-5 text-primary" />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="عنوان الرسالة"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className="text-right"
              />
              <Textarea
                placeholder="محتوى الرسالة"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
                className="text-right"
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
