import { 
  firestoreGet, 
  firestoreSet, 
  firestoreAdd, 
  firestoreUpdate, 
  firestoreDelete,
  firestoreQuery,
  COLLECTIONS,
  Timestamp
} from "@/lib/firebase";

export interface Lesson {
  id?: string;
  title: string;
  description: string;
  content: string;
  teacherId: string;
  teacherName: string;
  surahNumber?: number;
  ayahStart?: number;
  ayahEnd?: number;
  category: "tajweed" | "tafsir" | "memorization" | "general";
  level: "beginner" | "intermediate" | "advanced";
  isPublished: boolean;
  viewCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Get all published lessons
export const getPublishedLessons = async (): Promise<Lesson[]> => {
  return firestoreQuery<Lesson>(
    COLLECTIONS.LESSONS,
    [{ field: "isPublished", op: "==", value: true }],
    "createdAt",
    "desc"
  );
};

// Get lessons by teacher
export const getLessonsByTeacher = async (teacherId: string): Promise<Lesson[]> => {
  return firestoreQuery<Lesson>(
    COLLECTIONS.LESSONS,
    [{ field: "teacherId", op: "==", value: teacherId }],
    "createdAt",
    "desc"
  );
};

// Get lessons by category
export const getLessonsByCategory = async (category: string): Promise<Lesson[]> => {
  return firestoreQuery<Lesson>(
    COLLECTIONS.LESSONS,
    [
      { field: "isPublished", op: "==", value: true },
      { field: "category", op: "==", value: category }
    ],
    "createdAt",
    "desc"
  );
};

// Get single lesson
export const getLesson = async (lessonId: string): Promise<Lesson | null> => {
  return firestoreGet<Lesson>(COLLECTIONS.LESSONS, lessonId);
};

// Create lesson
export const createLesson = async (lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  return firestoreAdd(COLLECTIONS.LESSONS, lesson);
};

// Update lesson
export const updateLesson = async (lessonId: string, data: Partial<Lesson>): Promise<void> => {
  return firestoreUpdate(COLLECTIONS.LESSONS, lessonId, data);
};

// Delete lesson
export const deleteLesson = async (lessonId: string): Promise<void> => {
  return firestoreDelete(COLLECTIONS.LESSONS, lessonId);
};

// Increment view count
export const incrementViewCount = async (lessonId: string): Promise<void> => {
  const lesson = await getLesson(lessonId);
  if (lesson) {
    await firestoreUpdate(COLLECTIONS.LESSONS, lessonId, {
      viewCount: (lesson.viewCount || 0) + 1
    });
  }
};

// Toggle publish status
export const togglePublishStatus = async (lessonId: string): Promise<void> => {
  const lesson = await getLesson(lessonId);
  if (lesson) {
    await firestoreUpdate(COLLECTIONS.LESSONS, lessonId, {
      isPublished: !lesson.isPublished
    });
  }
};
