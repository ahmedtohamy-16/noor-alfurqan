/**
 * Hook to handle guest data migration when user logs in or signs up
 */

import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { 
  hasGuestData, 
  migrateGuestDataToUser, 
  getGuestDataSummary 
} from "@/services/guestDataService";
import { toast } from "sonner";

export const useGuestMigration = () => {
  const { user } = useAuth();
  const hasMigratedRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleMigration = async () => {
      // Only run once per user session
      if (!user || hasMigratedRef.current) return;
      
      // Prevent re-running for the same user
      if (previousUserIdRef.current === user.uid) return;
      previousUserIdRef.current = user.uid;

      // Check if there's guest data to migrate
      if (!hasGuestData()) {
        hasMigratedRef.current = true;
        return;
      }

      const summary = getGuestDataSummary();
      if (!summary.hasData) {
        hasMigratedRef.current = true;
        return;
      }

      // Perform migration
      try {
        const result = await migrateGuestDataToUser(user.uid);
        
        if (result.success && result.migratedItems.length > 0) {
          toast.success(
            `تم نقل بياناتك: ${result.migratedItems.join("، ")}`,
            {
              duration: 5000,
              description: "جميع بياناتك السابقة محفوظة في حسابك الآن",
            }
          );
        } else if (result.errors.length > 0) {
          toast.warning(
            "تم نقل بعض البيانات",
            {
              duration: 5000,
              description: `لم يتم نقل: ${result.errors.join("، ")}`,
            }
          );
        }
      } catch (error) {
        console.error("Migration error:", error);
        // Don't show error to user, just log it
      }

      hasMigratedRef.current = true;
    };

    handleMigration();
  }, [user]);

  // Reset migration flag when user logs out
  useEffect(() => {
    if (!user) {
      hasMigratedRef.current = false;
      previousUserIdRef.current = null;
    }
  }, [user]);
};
