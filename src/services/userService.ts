import { 
  firestoreGet, 
  firestoreSet, 
  firestoreUpdate, 
  firestoreQuery,
  COLLECTIONS,
  UserProfile,
  UserRole,
  updateUserRole as updateRole
} from "@/lib/firebase";

// Get all users (admin only)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  return firestoreQuery<UserProfile>(
    COLLECTIONS.USERS,
    [],
    "createdAt",
    "desc"
  );
};

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
  return firestoreQuery<UserProfile>(
    COLLECTIONS.USERS,
    [{ field: "role", op: "==", value: role }],
    "createdAt",
    "desc"
  );
};

// Get user by ID
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  return firestoreGet<UserProfile>(COLLECTIONS.USERS, userId);
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> => {
  return firestoreUpdate(COLLECTIONS.USERS, userId, data);
};

// Update user role (admin only)
export const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
  return updateRole(userId, newRole);
};

// Get teachers
export const getTeachers = async (): Promise<UserProfile[]> => {
  const teachers = await getUsersByRole("teacher");
  const admins = await getUsersByRole("admin");
  return [...teachers, ...admins];
};

// Get students
export const getStudents = async (): Promise<UserProfile[]> => {
  return getUsersByRole("student");
};

// Count users by role
export const countUsersByRole = async (): Promise<Record<UserRole, number>> => {
  const [admins, teachers, students] = await Promise.all([
    getUsersByRole("admin"),
    getUsersByRole("teacher"),
    getUsersByRole("student")
  ]);
  
  return {
    admin: admins.length,
    teacher: teachers.length,
    student: students.length
  };
};
