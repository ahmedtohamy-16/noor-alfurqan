import { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { X, Download, ChevronUp, ChevronDown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DownloadTask {
  id: string;
  name: string;
  type: 'ayah' | 'surah' | 'range' | 'reciter';
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
  totalSize?: string;
}

interface DownloadManagerContextType {
  tasks: DownloadTask[];
  addTask: (task: Omit<DownloadTask, 'id' | 'progress' | 'status'>) => string;
  updateTask: (id: string, updates: Partial<DownloadTask>) => void;
  removeTask: (id: string) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const DownloadManagerContext = createContext<DownloadManagerContextType | null>(null);

export const useDownloadManager = () => {
  const context = useContext(DownloadManagerContext);
  if (!context) {
    throw new Error('useDownloadManager must be used within DownloadManagerProvider');
  }
  return context;
};

interface DownloadManagerProviderProps {
  children: ReactNode;
}

export const DownloadManagerProvider = ({ children }: DownloadManagerProviderProps) => {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const addTask = useCallback((task: Omit<DownloadTask, 'id' | 'progress' | 'status'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: DownloadTask = {
      ...task,
      id,
      progress: 0,
      status: 'pending',
    };
    setTasks(prev => [...prev, newTask]);
    setIsVisible(true);
    return id;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<DownloadTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  return (
    <DownloadManagerContext.Provider value={{ tasks, addTask, updateTask, removeTask, isVisible, setIsVisible }}>
      {children}
      <DownloadManagerUI />
    </DownloadManagerContext.Provider>
  );
};

const DownloadManagerUI = () => {
  const { tasks, removeTask, isVisible, setIsVisible } = useDownloadManager();
  const [isExpanded, setIsExpanded] = useState(true);

  const activeTasks = tasks.filter(t => t.status === 'downloading' || t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'error');

  if (!isVisible || tasks.length === 0) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 bg-card border rounded-xl shadow-xl transition-all duration-300 arabic-ui overflow-hidden",
        isExpanded ? "max-h-96" : "max-h-14"
      )}
      dir="rtl"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b bg-muted/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">
            التحميلات ({activeTasks.length} نشط)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto p-2 space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "p-3 rounded-lg border transition-all",
                task.status === 'completed' && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                task.status === 'error' && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                (task.status === 'downloading' || task.status === 'pending') && "bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate flex-1">{task.name}</span>
                <div className="flex items-center gap-1">
                  {task.status === 'downloading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {task.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {task.status === 'error' && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeTask(task.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {(task.status === 'downloading' || task.status === 'pending') && (
                <div className="space-y-1">
                  <Progress value={task.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.totalSize || ''}</span>
                    <span>{Math.round(task.progress)}%</span>
                  </div>
                </div>
              )}
              
              {task.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{task.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DownloadManagerProvider;
