import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Video,
  FileText,
  MessageSquare,
  Users,
  Plus,
  ArrowRight,
  Upload,
  Trash2,
  Eye,
  Edit,
  GraduationCap,
  ClipboardList,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  COLLECTIONS, 
  firestoreQuery, 
  firestoreAdd, 
  firestoreUpdate,
  firestoreDelete 
} from "@/lib/firebase";

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  category: string;
  level: string;
  is_published: boolean;
  enrollment_count: number;
  created_at: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string | null;
  time_limit: number | null;
  pass_score: number;
  is_published: boolean;
  created_at: string;
}

interface TeacherFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, isTeacher, isAdmin, isLoading: authLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [files, setFiles] = useState<TeacherFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  // Course dialog
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "general",
    level: "beginner",
  });

  // Quiz dialog
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    time_limit: 30,
    pass_score: 60,
  });

  // File upload
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && user && !isTeacher && !isAdmin) {
      navigate("/");
      toast.error("هذه الصفحة متاحة للمعلمين فقط");
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, isTeacher, isAdmin, navigate]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [coursesData, quizzesData, filesData] = await Promise.all([
        firestoreQuery<Course>(
          COLLECTIONS.COURSES,
          [{ field: "teacher_id", op: "==", value: user.uid }],
          "created_at",
          "desc"
        ),
        firestoreQuery<Quiz>(
          COLLECTIONS.QUIZZES,
          [{ field: "teacher_id", op: "==", value: user.uid }],
          "created_at",
          "desc"
        ),
        firestoreQuery<TeacherFile>(
          COLLECTIONS.TEACHER_FILES,
          [{ field: "teacher_id", op: "==", value: user.uid }],
          "created_at",
          "desc"
        ),
      ]);

      setCourses(coursesData);
      setQuizzes(quizzesData);
      setFiles(filesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!user || !newCourse.title) {
      toast.error("يرجى إدخال عنوان الكورس");
      return;
    }

    try {
      await firestoreAdd(COLLECTIONS.COURSES, {
        teacher_id: user.uid,
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        level: newCourse.level,
        is_published: false,
        enrollment_count: 0,
        created_at: new Date().toISOString(),
      });

      toast.success("تم إنشاء الكورس بنجاح");
      setShowCourseDialog(false);
      setNewCourse({ title: "", description: "", category: "general", level: "beginner" });
      loadData();
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("حدث خطأ في إنشاء الكورس");
    }
  };

  const handleCreateQuiz = async () => {
    if (!user || !newQuiz.title) {
      toast.error("يرجى إدخال عنوان الاختبار");
      return;
    }

    try {
      await firestoreAdd(COLLECTIONS.QUIZZES, {
        teacher_id: user.uid,
        title: newQuiz.title,
        description: newQuiz.description,
        time_limit: newQuiz.time_limit,
        pass_score: newQuiz.pass_score,
        is_published: false,
        created_at: new Date().toISOString(),
      });

      toast.success("تم إنشاء الاختبار بنجاح");
      setShowQuizDialog(false);
      setNewQuiz({ title: "", description: "", time_limit: 30, pass_score: 60 });
      loadData();
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("حدث خطأ في إنشاء الاختبار");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت");
      return;
    }

    setIsUploading(true);

    try {
      // For now, we'll store file metadata in Firestore
      // In production, you'd upload to Firebase Storage first
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.uid}/${Date.now()}.${fileExt}`;

      await firestoreAdd(COLLECTIONS.TEACHER_FILES, {
        teacher_id: user.uid,
        file_name: file.name,
        file_url: fileName,
        file_type: file.type,
        file_size: file.size,
        created_at: new Date().toISOString(),
      });

      toast.success("تم رفع الملف بنجاح");
      loadData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ في رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await firestoreDelete(COLLECTIONS.TEACHER_FILES, fileId);
      toast.success("تم حذف الملف");
      loadData();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("حدث خطأ في حذف الملف");
    }
  };

  const handleTogglePublish = async (type: "course" | "quiz", id: string, currentStatus: boolean) => {
    try {
      const collectionName = type === "course" ? COLLECTIONS.COURSES : COLLECTIONS.QUIZZES;
      await firestoreUpdate(collectionName, id, { is_published: !currentStatus });

      toast.success(currentStatus ? "تم إلغاء النشر" : "تم النشر بنجاح");
      loadData();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async (type: "course" | "quiz", id: string) => {
    try {
      const collectionName = type === "course" ? COLLECTIONS.COURSES : COLLECTIONS.QUIZZES;
      await firestoreDelete(collectionName, id);

      toast.success("تم الحذف بنجاح");
      loadData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("حدث خطأ في الحذف");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5" />;
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">لوحة المعلم</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
        </main>
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
            <GraduationCap className="w-5 h-5 text-primary" />
            لوحة المعلم
          </h1>
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 arabic-ui">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">كورس</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ClipboardList className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{quizzes.length}</p>
              <p className="text-sm text-muted-foreground">اختبار</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <File className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{files.length}</p>
              <p className="text-sm text-muted-foreground">ملف</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              الكورسات
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              الاختبارات
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Upload className="w-4 h-4" />
              الملفات
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-between items-center">
              <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    كورس جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-right">إنشاء كورس جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="عنوان الكورس"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="text-right"
                    />
                    <Textarea
                      placeholder="وصف الكورس"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="text-right"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={newCourse.category}
                        onValueChange={(v) => setNewCourse({ ...newCourse, category: v })}
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
                        value={newCourse.level}
                        onValueChange={(v) => setNewCourse({ ...newCourse, level: v })}
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
                    <Button onClick={handleCreateCourse} className="w-full">
                      إنشاء الكورس
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <h3 className="text-lg font-semibold">الكورسات ({courses.length})</h3>
            </div>

            {courses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لم تقم بإنشاء أي كورسات بعد</p>
                  <Button className="mt-4" onClick={() => setShowCourseDialog(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء كورس
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant={course.is_published ? "default" : "secondary"}>
                          {course.is_published ? "منشور" : "مسودة"}
                        </Badge>
                        <CardTitle className="text-right">{course.title}</CardTitle>
                      </div>
                      <CardDescription className="text-right">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete("course", course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={course.is_published ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleTogglePublish("course", course.id, course.is_published)}
                        >
                          {course.is_published ? "إلغاء النشر" : "نشر"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            <div className="flex justify-between items-center">
              <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    اختبار جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-right">إنشاء اختبار جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="عنوان الاختبار"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      className="text-right"
                    />
                    <Textarea
                      placeholder="وصف الاختبار"
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      className="text-right"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">الوقت (دقيقة)</label>
                        <Input
                          type="number"
                          value={newQuiz.time_limit}
                          onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">درجة النجاح %</label>
                        <Input
                          type="number"
                          value={newQuiz.pass_score}
                          onChange={(e) => setNewQuiz({ ...newQuiz, pass_score: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateQuiz} className="w-full">
                      إنشاء الاختبار
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <h3 className="text-lg font-semibold">الاختبارات ({quizzes.length})</h3>
            </div>

            {quizzes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لم تقم بإنشاء أي اختبارات بعد</p>
                  <Button className="mt-4" onClick={() => setShowQuizDialog(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء اختبار
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant={quiz.is_published ? "default" : "secondary"}>
                          {quiz.is_published ? "منشور" : "مسودة"}
                        </Badge>
                        <CardTitle className="text-right">{quiz.title}</CardTitle>
                      </div>
                      <CardDescription className="text-right">{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete("quiz", quiz.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={quiz.is_published ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleTogglePublish("quiz", quiz.id, quiz.is_published)}
                        >
                          {quiz.is_published ? "إلغاء النشر" : "نشر"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={isUploading}>
                    <span>
                      <Upload className="w-4 h-4 ml-2" />
                      {isUploading ? "جاري الرفع..." : "رفع ملف"}
                    </span>
                  </Button>
                </label>
              </div>
              <h3 className="text-lg font-semibold">الملفات ({files.length})</h3>
            </div>

            {files.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <File className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لم تقم برفع أي ملفات بعد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="text-right">
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                        {getFileIcon(file.file_type)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;