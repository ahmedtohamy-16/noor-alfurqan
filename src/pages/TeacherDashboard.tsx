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
import { supabase } from "@/integrations/supabase/client";

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

      const [coursesRes, quizzesRes, filesRes] = await Promise.all([
        supabase
          .from("courses" as any)
          .select("*")
          .eq("teacher_id", user.uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("quizzes" as any)
          .select("*")
          .eq("teacher_id", user.uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("teacher_files" as any)
          .select("*")
          .eq("teacher_id", user.uid)
          .order("created_at", { ascending: false }),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data as unknown as Course[]);
      if (quizzesRes.data) setQuizzes(quizzesRes.data as unknown as Quiz[]);
      if (filesRes.data) setFiles(filesRes.data as unknown as TeacherFile[]);
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
      const { error } = await supabase.from("courses" as any).insert({
        teacher_id: user.uid,
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        level: newCourse.level,
      });

      if (error) throw error;

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
      const { error } = await supabase.from("quizzes" as any).insert({
        teacher_id: user.uid,
        title: newQuiz.title,
        description: newQuiz.description,
        time_limit: newQuiz.time_limit,
        pass_score: newQuiz.pass_score,
      });

      if (error) throw error;

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
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.uid}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("teacher-content")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("teacher-content")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("teacher_files" as any).insert({
        teacher_id: user.uid,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      toast.success("تم رفع الملف بنجاح");
      loadData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ في رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    try {
      // Extract path from URL
      const urlParts = fileUrl.split("/teacher-content/");
      if (urlParts[1]) {
        await supabase.storage.from("teacher-content").remove([urlParts[1]]);
      }

      const { error } = await supabase.from("teacher_files" as any).delete().eq("id", fileId);

      if (error) throw error;

      toast.success("تم حذف الملف");
      loadData();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("حدث خطأ في حذف الملف");
    }
  };

  const handleTogglePublish = async (type: "course" | "quiz", id: string, currentStatus: boolean) => {
    try {
      const table = type === "course" ? "courses" : "quizzes";
      const { error } = await supabase
        .from(table as any)
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(currentStatus ? "تم إلغاء النشر" : "تم النشر بنجاح");
      loadData();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async (type: "course" | "quiz", id: string) => {
    try {
      const table = type === "course" ? "courses" : "quizzes";
      const { error } = await supabase.from(table as any).delete().eq("id", id);

      if (error) throw error;

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
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete("course", course.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleTogglePublish("course", course.id, course.is_published)}
                          >
                            <Eye className={`w-4 h-4 ${course.is_published ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/teacher/course/${course.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right flex-1">
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <Badge variant={course.is_published ? "default" : "secondary"}>
                              {course.is_published ? "منشور" : "مسودة"}
                            </Badge>
                            <h4 className="font-semibold">{course.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {course.description || "بدون وصف"}
                          </p>
                          <div className="flex gap-2 justify-end items-center">
                            <Badge variant="outline">{course.category}</Badge>
                            <Badge variant="outline">{course.level}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {course.enrollment_count} مشترك
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
                        <label className="text-sm text-muted-foreground block mb-1 text-right">
                          الوقت المحدد (دقيقة)
                        </label>
                        <Input
                          type="number"
                          value={newQuiz.time_limit}
                          onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: parseInt(e.target.value) || 30 })}
                          className="text-right"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1 text-right">
                          درجة النجاح (%)
                        </label>
                        <Input
                          type="number"
                          value={newQuiz.pass_score}
                          onChange={(e) => setNewQuiz({ ...newQuiz, pass_score: parseInt(e.target.value) || 60 })}
                          className="text-right"
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
              <div className="grid gap-4">
                {quizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete("quiz", quiz.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleTogglePublish("quiz", quiz.id, quiz.is_published)}
                          >
                            <Eye className={`w-4 h-4 ${quiz.is_published ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/teacher/quiz/${quiz.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right flex-1">
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <Badge variant={quiz.is_published ? "default" : "secondary"}>
                              {quiz.is_published ? "منشور" : "مسودة"}
                            </Badge>
                            <h4 className="font-semibold">{quiz.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {quiz.description || "بدون وصف"}
                          </p>
                          <div className="flex gap-3 justify-end text-xs text-muted-foreground">
                            <span>{quiz.time_limit} دقيقة</span>
                            <span>النجاح: {quiz.pass_score}%</span>
                          </div>
                        </div>
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
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                />
                <Button asChild disabled={isUploading}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 ml-2" />
                    {isUploading ? "جاري الرفع..." : "رفع ملف"}
                  </label>
                </Button>
              </div>
              <h3 className="text-lg font-semibold">الملفات ({files.length})</h3>
            </div>

            <p className="text-sm text-muted-foreground text-right">
              يمكنك رفع صور، فيديوهات، ملفات PDF، ومستندات Word و PowerPoint (حتى 50 ميجابايت)
            </p>

            {files.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <File className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لم تقم برفع أي ملفات بعد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteFile(file.id, file.file_url)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 flex-1 justify-end hover:text-primary transition-colors"
                        >
                          <div className="text-right">
                            <p className="font-medium truncate max-w-[200px]">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.file_size)}
                            </p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg">
                            {getFileIcon(file.file_type)}
                          </div>
                        </a>
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