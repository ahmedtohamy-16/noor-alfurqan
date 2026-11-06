// Support tickets — stored in the Firebase `support_tickets` collection.
import {
  addDoc,
  collection,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();
const SUPPORT_TICKETS = "support_tickets";

export type TicketCategory = "technical" | "report" | "other";

export const createSupportTicket = async (
  uid: string,
  data: { category: TicketCategory; subject: string; description: string }
): Promise<string> => {
  if (!data.subject.trim() || !data.description.trim()) {
    throw new Error("الرجاء تعبئة جميع الحقول");
  }
  const ref = await addDoc(collection(db, SUPPORT_TICKETS), {
    user_uid: uid,
    category: data.category,
    subject: data.subject.trim().slice(0, 200),
    description: data.description.trim().slice(0, 2000),
    status: "open",
    created_at: serverTimestamp(),
  });
  return ref.id;
};

export const getMyTickets = async (uid: string) => {
  const q = query(
    collection(db, SUPPORT_TICKETS),
    where("user_uid", "==", uid),
    orderBy("created_at", "desc"),
    fbLimit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
