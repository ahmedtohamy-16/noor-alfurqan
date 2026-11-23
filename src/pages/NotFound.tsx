import { Link } from "react-router-dom";
import { Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-6" dir="rtl">
    <div className="text-center max-w-sm">
      <p className="text-6xl font-extrabold text-primary mb-3">٤٠٤</p>
      <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
      <p className="text-muted-foreground mb-6">ربما تغيّر الرابط أو حُذفت الصفحة.</p>
      <div className="flex flex-col gap-2">
        <Button asChild><Link to="/"><Home className="w-4 h-4" />العودة للرئيسية</Link></Button>
        <Button asChild variant="outline"><Link to="/quran"><BookOpen className="w-4 h-4" />فهرس القرآن</Link></Button>
      </div>
    </div>
  </div>
);

export default NotFound;
