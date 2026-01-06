import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  ArrowRight,
  Ban,
  CheckCircle,
  Shield,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  UserProfile, 
  UserRole, 
  COLLECTIONS, 
  firestoreUpdate,
  firestoreQuery 
} from "@/lib/firebase";
import { updateUserRole } from "@/services/userService";

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Ban dialog
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && user && !isAdmin) {
      navigate("/");
      toast.error("هذه الصفحة للمسؤولين فقط");
      return;
    }

    if (user && isAdmin) {
      loadUsers();
    }
  }, [user, authLoading, isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      const allUsers = await firestoreQuery<UserProfile>(
        COLLECTIONS.USERS,
        [],
        "createdAt",
        "desc"
      );

      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("حدث خطأ في تحميل المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("تم تحديث الصلاحية بنجاح");
      loadUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("حدث خطأ في تحديث الصلاحية");
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);

    try {
      await firestoreUpdate(COLLECTIONS.USERS, selectedUser.uid, {
        isBanned: true,
        banReason: banReason || "مخالفة شروط الاستخدام",
        bannedAt: new Date().toISOString(),
      });

      toast.success("تم حظر المستخدم بنجاح");
      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
      loadUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("حدث خطأ في حظر المستخدم");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setIsProcessing(true);

    try {
      await firestoreUpdate(COLLECTIONS.USERS, userId, {
        isBanned: false,
        banReason: null,
        bannedAt: null,
      });

      toast.success("تم إلغاء حظر المستخدم بنجاح");
      loadUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("حدث خطأ في إلغاء الحظر");
    } finally {
      setIsProcessing(false);
    }
  };

  const openBanDialog = (userToBan: UserProfile) => {
    setSelectedUser(userToBan);
    setBanDialogOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    const config = {
      admin: { label: "مسؤول", variant: "destructive" as const },
      teacher: { label: "معلم", variant: "default" as const },
      student: { label: "طالب", variant: "secondary" as const },
    };
    return <Badge variant={config[role].variant}>{config[role].label}</Badge>;
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    banned: users.filter((u) => (u as any).isBanned).length,
    active: users.filter((u) => !(u as any).isBanned).length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">إدارة المستخدمين</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 space-y-4">
          <Skeleton className="h-24 w-full" />
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            إدارة المستخدمين
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 arabic-ui">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">نشط</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Ban className="w-8 h-8 mx-auto text-destructive mb-2" />
              <p className="text-2xl font-bold">{stats.banned}</p>
              <p className="text-sm text-muted-foreground">محظور</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="admin">مسؤول</SelectItem>
              <SelectItem value="teacher">معلم</SelectItem>
              <SelectItem value="student">طالب</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-right">
              المستخدمون ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الإجراءات</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الصلاحية</TableHead>
                    <TableHead className="text-right">البريد</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isBanned = (u as any).isBanned;
                    const isCurrentUser = u.uid === user?.uid;

                    return (
                      <TableRow key={u.uid} className={isBanned ? "opacity-60" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isBanned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnbanUser(u.uid)}
                                disabled={isProcessing}
                                className="gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                إلغاء الحظر
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openBanDialog(u)}
                                disabled={isCurrentUser || isProcessing}
                                className="gap-1"
                              >
                                <Ban className="w-4 h-4" />
                                حظر
                              </Button>
                            )}
                            <Select
                              value={u.role}
                              onValueChange={(v) => handleRoleChange(u.uid, v as UserRole)}
                              disabled={isCurrentUser}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">طالب</SelectItem>
                                <SelectItem value="teacher">معلم</SelectItem>
                                <SelectItem value="admin">مسؤول</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isBanned ? (
                            <Badge variant="destructive" className="gap-1">
                              <Ban className="w-3 h-3" />
                              محظور
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3" />
                              نشط
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                        <TableCell className="text-right">{u.email}</TableCell>
                        <TableCell className="text-right font-medium">
                          {u.displayName}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="mr-2">أنت</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ban Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="arabic-ui">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 justify-end text-destructive">
                حظر المستخدم
                <AlertTriangle className="w-5 h-5" />
              </DialogTitle>
              <DialogDescription className="text-right">
                هل أنت متأكد من حظر {selectedUser?.displayName}؟
                <br />
                لن يتمكن من الوصول للتطبيق بعد الحظر.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="سبب الحظر (اختياري)"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="text-right"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleBanUser}
                disabled={isProcessing}
                className="gap-2"
              >
                <Ban className="w-4 h-4" />
                تأكيد الحظر
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default UserManagementPage;