// Social network service layer (Firestore-based)
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  addDoc,
  serverTimestamp,
  increment,
  Timestamp,
  writeBatch,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const db = getFirestoreDb();

// ==================== TYPES ====================
export interface SocialProfile {
  uid: string;
  username: string; // unique, lowercase
  display_name: string;
  bio?: string;
  avatar_url?: string | null;
  is_private: boolean;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at?: Timestamp;
}

export type PostVisibility = "public" | "friends" | "private";

export interface Post {
  id: string;
  author_uid: string;
  author_username: string;
  author_display_name: string;
  author_avatar?: string | null;
  author_verified?: boolean;
  content: string;
  media_urls: string[];
  visibility: PostVisibility;
  hashtags: string[];
  likes_count: number;
  comments_count: number;
  created_at: Timestamp;
  edited_at?: Timestamp | null;
}

export interface Follow {
  id: string;
  follower_uid: string;
  following_uid: string;
  status: "pending" | "accepted";
  created_at: Timestamp;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_uid: string;
  author_username: string;
  author_display_name: string;
  author_avatar?: string | null;
  content: string;
  parent_id?: string | null;
  created_at: Timestamp;
}

// ==================== COLLECTIONS ====================
export const SOCIAL_COLLECTIONS = {
  PROFILES: "social_profiles",
  POSTS: "posts",
  FOLLOWS: "follows",
  LIKES: "post_likes",
  COMMENTS: "post_comments",
  HASHTAGS: "hashtags",
  VERIFICATION_REQUESTS: "verification_requests",
  SUPPORT_TICKETS: "support_tickets",
};

// ==================== USERNAMES & PROFILES ====================
export const isValidUsername = (username: string): boolean =>
  /^[a-z0-9_]{3,20}$/.test(username);

export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  const u = username.toLowerCase().trim();
  if (!isValidUsername(u)) return false;
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.PROFILES),
    where("username", "==", u),
    fbLimit(1)
  );
  const snap = await getDocs(q);
  return snap.empty;
};

export const createSocialProfile = async (
  uid: string,
  data: { username: string; display_name: string; avatar_url?: string | null; bio?: string }
): Promise<void> => {
  const username = data.username.toLowerCase().trim();
  if (!isValidUsername(username)) {
    throw new Error("اسم المستخدم غير صالح (3-20 حرف، أحرف إنجليزية وأرقام و _ فقط)");
  }
  const available = await isUsernameAvailable(username);
  if (!available) throw new Error("اسم المستخدم مستخدم بالفعل");

  const profile: Omit<SocialProfile, "created_at"> & { created_at: any } = {
    uid,
    username,
    display_name: data.display_name,
    bio: data.bio || "",
    avatar_url: data.avatar_url || null,
    is_private: false,
    is_verified: false,
    followers_count: 0,
    following_count: 0,
    posts_count: 0,
    created_at: serverTimestamp(),
  };
  await setDoc(doc(db, SOCIAL_COLLECTIONS.PROFILES, uid), profile);
};

export const getSocialProfileByUid = async (uid: string): Promise<SocialProfile | null> => {
  const snap = await getDoc(doc(db, SOCIAL_COLLECTIONS.PROFILES, uid));
  return snap.exists() ? (snap.data() as SocialProfile) : null;
};

export const getSocialProfileByUsername = async (
  username: string
): Promise<SocialProfile | null> => {
  const u = username.toLowerCase().trim();
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.PROFILES),
    where("username", "==", u),
    fbLimit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as SocialProfile);
};

export const updateSocialProfile = async (
  uid: string,
  data: Partial<Pick<SocialProfile, "display_name" | "bio" | "avatar_url" | "is_private">>
): Promise<void> => {
  await updateDoc(doc(db, SOCIAL_COLLECTIONS.PROFILES, uid), data as any);
};

// ==================== HASHTAGS ====================
export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#[\p{L}\p{N}_]+/gu) || [];
  const tags = matches.map((t) => t.slice(1).toLowerCase());
  return Array.from(new Set(tags)).slice(0, 30);
};

const incrementHashtags = async (tags: string[]): Promise<void> => {
  if (!tags.length) return;
  const batch = writeBatch(db);
  tags.forEach((tag) => {
    const ref = doc(db, SOCIAL_COLLECTIONS.HASHTAGS, tag);
    batch.set(
      ref,
      { tag, usage_count: increment(1), last_used_at: serverTimestamp() },
      { merge: true }
    );
  });
  await batch.commit();
};

export const getTrendingHashtags = async (max = 10) => {
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.HASHTAGS),
    orderBy("usage_count", "desc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as { tag: string; usage_count: number });
};

// ==================== POSTS ====================
export const createPost = async (
  author: SocialProfile,
  data: { content: string; media_urls?: string[]; visibility?: PostVisibility }
): Promise<string> => {
  const content = data.content.trim();
  if (!content && !(data.media_urls?.length)) {
    throw new Error("لا يمكن نشر منشور فارغ");
  }
  if (content.length > 2000) throw new Error("الحد الأقصى 2000 حرف");

  const hashtags = extractHashtags(content);
  const ref = await addDoc(collection(db, SOCIAL_COLLECTIONS.POSTS), {
    author_uid: author.uid,
    author_username: author.username,
    author_display_name: author.display_name,
    author_avatar: author.avatar_url || null,
    author_verified: author.is_verified || false,
    content,
    media_urls: data.media_urls || [],
    visibility: data.visibility || "public",
    hashtags,
    likes_count: 0,
    comments_count: 0,
    created_at: serverTimestamp(),
    edited_at: null,
  });

  await Promise.all([
    incrementHashtags(hashtags),
    updateDoc(doc(db, SOCIAL_COLLECTIONS.PROFILES, author.uid), {
      posts_count: increment(1),
    }),
  ]);

  return ref.id;
};

export const deletePost = async (postId: string, authorUid: string): Promise<void> => {
  await deleteDoc(doc(db, SOCIAL_COLLECTIONS.POSTS, postId));
  await updateDoc(doc(db, SOCIAL_COLLECTIONS.PROFILES, authorUid), {
    posts_count: increment(-1),
  });
};

export const getPost = async (postId: string): Promise<Post | null> => {
  const snap = await getDoc(doc(db, SOCIAL_COLLECTIONS.POSTS, postId));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Post) : null;
};

export interface FeedPage {
  posts: Post[];
  cursor: QueryDocumentSnapshot<DocumentData> | null;
}

export const getPublicFeed = async (
  pageSize = 20,
  cursor: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<FeedPage> => {
  const constraints: any[] = [
    where("visibility", "==", "public"),
    orderBy("created_at", "desc"),
    fbLimit(pageSize),
  ];
  if (cursor) constraints.splice(2, 0, startAfter(cursor));
  const q = query(collection(db, SOCIAL_COLLECTIONS.POSTS), ...constraints);
  const snap = await getDocs(q);
  return {
    posts: snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Post)),
    cursor: snap.docs[snap.docs.length - 1] || null,
  };
};

export const getUserPosts = async (
  authorUid: string,
  pageSize = 20
): Promise<Post[]> => {
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.POSTS),
    where("author_uid", "==", authorUid),
    orderBy("created_at", "desc"),
    fbLimit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Post));
};

export const getFollowingFeed = async (
  followerUid: string,
  pageSize = 20
): Promise<Post[]> => {
  // Get users I follow
  const followsQ = query(
    collection(db, SOCIAL_COLLECTIONS.FOLLOWS),
    where("follower_uid", "==", followerUid),
    where("status", "==", "accepted"),
    fbLimit(50)
  );
  const followsSnap = await getDocs(followsQ);
  const followingUids = followsSnap.docs.map((d) => (d.data() as Follow).following_uid);
  if (followingUids.length === 0) return [];

  // Firestore 'in' supports up to 30 values
  const chunks: string[][] = [];
  for (let i = 0; i < followingUids.length; i += 30) {
    chunks.push(followingUids.slice(i, i + 30));
  }

  const allPosts: Post[] = [];
  for (const chunk of chunks) {
    const q = query(
      collection(db, SOCIAL_COLLECTIONS.POSTS),
      where("author_uid", "in", chunk),
      orderBy("created_at", "desc"),
      fbLimit(pageSize)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) =>
      allPosts.push({ id: d.id, ...(d.data() as any) } as Post)
    );
  }
  return allPosts
    .sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0))
    .slice(0, pageSize);
};

// ==================== FOLLOWS ====================
const buildFollowId = (followerUid: string, followingUid: string) =>
  `${followerUid}__${followingUid}`;

export const followUser = async (
  followerUid: string,
  target: SocialProfile
): Promise<"accepted" | "pending"> => {
  if (followerUid === target.uid) throw new Error("لا يمكن متابعة نفسك");
  const id = buildFollowId(followerUid, target.uid);
  const status: "pending" | "accepted" = target.is_private ? "pending" : "accepted";

  await setDoc(doc(db, SOCIAL_COLLECTIONS.FOLLOWS, id), {
    follower_uid: followerUid,
    following_uid: target.uid,
    status,
    created_at: serverTimestamp(),
  });

  if (status === "accepted") {
    const batch = writeBatch(db);
    batch.update(doc(db, SOCIAL_COLLECTIONS.PROFILES, target.uid), {
      followers_count: increment(1),
    });
    batch.update(doc(db, SOCIAL_COLLECTIONS.PROFILES, followerUid), {
      following_count: increment(1),
    });
    await batch.commit();
  }
  return status;
};

export const unfollowUser = async (
  followerUid: string,
  followingUid: string
): Promise<void> => {
  const id = buildFollowId(followerUid, followingUid);
  const followRef = doc(db, SOCIAL_COLLECTIONS.FOLLOWS, id);
  const snap = await getDoc(followRef);
  if (!snap.exists()) return;
  const wasAccepted = (snap.data() as Follow).status === "accepted";
  await deleteDoc(followRef);
  if (wasAccepted) {
    const batch = writeBatch(db);
    batch.update(doc(db, SOCIAL_COLLECTIONS.PROFILES, followingUid), {
      followers_count: increment(-1),
    });
    batch.update(doc(db, SOCIAL_COLLECTIONS.PROFILES, followerUid), {
      following_count: increment(-1),
    });
    await batch.commit();
  }
};

export const getFollowStatus = async (
  followerUid: string,
  followingUid: string
): Promise<"none" | "pending" | "accepted"> => {
  const snap = await getDoc(
    doc(db, SOCIAL_COLLECTIONS.FOLLOWS, buildFollowId(followerUid, followingUid))
  );
  if (!snap.exists()) return "none";
  return (snap.data() as Follow).status;
};

// ==================== LIKES ====================
const buildLikeId = (postId: string, userUid: string) => `${postId}__${userUid}`;

export const toggleLike = async (
  postId: string,
  userUid: string
): Promise<boolean> => {
  const id = buildLikeId(postId, userUid);
  const ref = doc(db, SOCIAL_COLLECTIONS.LIKES, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(doc(db, SOCIAL_COLLECTIONS.POSTS, postId), {
      likes_count: increment(-1),
    });
    return false;
  } else {
    await setDoc(ref, {
      post_id: postId,
      user_uid: userUid,
      created_at: serverTimestamp(),
    });
    await updateDoc(doc(db, SOCIAL_COLLECTIONS.POSTS, postId), {
      likes_count: increment(1),
    });
    return true;
  }
};

export const isPostLiked = async (postId: string, userUid: string): Promise<boolean> => {
  const snap = await getDoc(
    doc(db, SOCIAL_COLLECTIONS.LIKES, buildLikeId(postId, userUid))
  );
  return snap.exists();
};

// ==================== COMMENTS ====================
export const addComment = async (
  postId: string,
  author: SocialProfile,
  content: string,
  parentId: string | null = null
): Promise<string> => {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("التعليق فارغ");
  if (trimmed.length > 500) throw new Error("الحد الأقصى للتعليق 500 حرف");

  const ref = await addDoc(collection(db, SOCIAL_COLLECTIONS.COMMENTS), {
    post_id: postId,
    author_uid: author.uid,
    author_username: author.username,
    author_display_name: author.display_name,
    author_avatar: author.avatar_url || null,
    content: trimmed,
    parent_id: parentId,
    created_at: serverTimestamp(),
  });
  await updateDoc(doc(db, SOCIAL_COLLECTIONS.POSTS, postId), {
    comments_count: increment(1),
  });
  return ref.id;
};

export const getPostComments = async (postId: string): Promise<PostComment[]> => {
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.COMMENTS),
    where("post_id", "==", postId),
    orderBy("created_at", "asc"),
    fbLimit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as PostComment));
};

// ==================== SEARCH ====================
export const searchUsers = async (term: string, max = 20): Promise<SocialProfile[]> => {
  const t = term.toLowerCase().trim();
  if (!t) return [];
  // Prefix search on username
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.PROFILES),
    where("username", ">=", t),
    where("username", "<=", t + "\uf8ff"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SocialProfile);
};

export const searchByHashtag = async (tag: string, max = 30): Promise<Post[]> => {
  const t = tag.toLowerCase().replace(/^#/, "").trim();
  if (!t) return [];
  const q = query(
    collection(db, SOCIAL_COLLECTIONS.POSTS),
    where("visibility", "==", "public"),
    where("hashtags", "array-contains", t),
    orderBy("created_at", "desc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Post));
};

// ==================== VERIFICATION ====================
export const requestVerification = async (
  uid: string,
  reason: string
): Promise<void> => {
  if (!reason.trim() || reason.length > 1000) {
    throw new Error("الرجاء كتابة سبب الطلب (حتى 1000 حرف)");
  }
  await addDoc(collection(db, SOCIAL_COLLECTIONS.VERIFICATION_REQUESTS), {
    user_uid: uid,
    reason: reason.trim(),
    status: "pending",
    created_at: serverTimestamp(),
  });
};

// ==================== SUPPORT TICKETS ====================
export type TicketCategory = "technical" | "report" | "other";

export const createSupportTicket = async (
  uid: string,
  data: { category: TicketCategory; subject: string; description: string }
): Promise<string> => {
  if (!data.subject.trim() || !data.description.trim()) {
    throw new Error("الرجاء تعبئة جميع الحقول");
  }
  const ref = await addDoc(collection(db, SOCIAL_COLLECTIONS.SUPPORT_TICKETS), {
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
    collection(db, SOCIAL_COLLECTIONS.SUPPORT_TICKETS),
    where("user_uid", "==", uid),
    orderBy("created_at", "desc"),
    fbLimit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
