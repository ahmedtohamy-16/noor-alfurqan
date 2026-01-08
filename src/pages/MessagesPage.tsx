import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  ArrowRight,
  Send,
  Search,
  Users,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { 
  COLLECTIONS, 
  firestoreQuery, 
  firestoreAdd, 
  firestoreSet,
  firestoreGet,
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp
} from "@/lib/firebase";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  other_user?: {
    uid: string;
    displayName: string;
  };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadTeachers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation.id);
      
      // Subscribe to new messages using Firestore
      const messagesRef = collection(db, COLLECTIONS.MESSAGES);
      const q = query(
        messagesRef,
        where("conversation_id", "==", selectedConversation.id),
        orderBy("created_at", "asc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(newMessages);
        scrollToBottom();
      });

      return () => unsubscribe();
    }
  }, [selectedConversation, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Query conversations where user is participant_1 or participant_2
      const convs1 = await firestoreQuery<Conversation>(
        COLLECTIONS.CONVERSATIONS,
        [{ field: "participant_1", op: "==", value: user.uid }],
        "last_message_at",
        "desc"
      );
      
      const convs2 = await firestoreQuery<Conversation>(
        COLLECTIONS.CONVERSATIONS,
        [{ field: "participant_2", op: "==", value: user.uid }],
        "last_message_at",
        "desc"
      );

      const allConversations = [...convs1, ...convs2];
      
      // Remove duplicates and sort
      const uniqueConversations = allConversations.reduce((acc, conv) => {
        if (!acc.find(c => c.id === conv.id)) {
          acc.push(conv);
        }
        return acc;
      }, [] as Conversation[]);

      // Get user info for each conversation
      const enrichedConversations = await Promise.all(
        uniqueConversations.map(async (conv) => {
          const otherUserId = conv.participant_1 === user.uid ? conv.participant_2 : conv.participant_1;
          
          // Get other user info from Firestore
          const otherUserProfile = await firestoreGet<any>(COLLECTIONS.USERS, otherUserId);

          // Get last message
          const lastMessages = await firestoreQuery<Message>(
            COLLECTIONS.MESSAGES,
            [{ field: "conversation_id", op: "==", value: conv.id }],
            "created_at",
            "desc",
            1
          );

          return {
            ...conv,
            other_user: otherUserProfile || { uid: otherUserId, displayName: "مستخدم" },
            last_message: lastMessages[0]?.content,
          };
        })
      );

      setConversations(enrichedConversations);

      // Check if we need to open a specific conversation
      const chatWith = searchParams.get("with");
      if (chatWith) {
        const existingConv = enrichedConversations.find(
          (c) => c.participant_1 === chatWith || c.participant_2 === chatWith
        );
        if (existingConv) {
          setSelectedConversation(existingConv);
        } else {
          // Create new conversation
          await startNewConversation(chatWith);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("حدث خطأ في تحميل المحادثات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const teachersData = await firestoreQuery<any>(
        COLLECTIONS.USERS,
        [{ field: "role", op: "in", value: ["teacher", "admin"] }],
        "displayName",
        "asc"
      );
      setTeachers(teachersData.filter((t) => t.uid !== user?.uid));
    } catch (error) {
      console.error("Error loading teachers:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await firestoreQuery<Message>(
        COLLECTIONS.MESSAGES,
        [{ field: "conversation_id", op: "==", value: conversationId }],
        "created_at",
        "asc"
      );

      setMessages(msgs);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const startNewConversation = async (otherUserId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const existing1 = await firestoreQuery<Conversation>(
        COLLECTIONS.CONVERSATIONS,
        [
          { field: "participant_1", op: "==", value: user.uid },
          { field: "participant_2", op: "==", value: otherUserId }
        ]
      );
      
      const existing2 = await firestoreQuery<Conversation>(
        COLLECTIONS.CONVERSATIONS,
        [
          { field: "participant_1", op: "==", value: otherUserId },
          { field: "participant_2", op: "==", value: user.uid }
        ]
      );

      const existing = existing1[0] || existing2[0];

      if (existing) {
        const otherUser = teachers.find((t) => t.uid === otherUserId);
        setSelectedConversation({
          ...existing,
          other_user: otherUser || { uid: otherUserId, displayName: "مستخدم" },
        });
        setShowNewChat(false);
        return;
      }

      // Create new conversation
      const newConvId = await firestoreAdd(COLLECTIONS.CONVERSATIONS, {
        participant_1: user.uid,
        participant_2: otherUserId,
        last_message_at: new Date().toISOString(),
      });

      const otherUser = teachers.find((t) => t.uid === otherUserId);
      setSelectedConversation({
        id: newConvId,
        participant_1: user.uid,
        participant_2: otherUserId,
        last_message_at: new Date().toISOString(),
        other_user: otherUser || { uid: otherUserId, displayName: "مستخدم" },
      });
      setShowNewChat(false);
      loadConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("حدث خطأ في إنشاء المحادثة");
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setIsSending(true);

    try {
      await firestoreAdd(COLLECTIONS.MESSAGES, {
        conversation_id: selectedConversation.id,
        sender_id: user.uid,
        content: newMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      });

      // Update last message time
      await firestoreSet(COLLECTIONS.CONVERSATIONS, selectedConversation.id, {
        last_message_at: new Date().toISOString(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("فشل في إرسال الرسالة");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "اليوم";
    if (date.toDateString() === yesterday.toDateString()) return "أمس";
    return date.toLocaleDateString("ar");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">المحادثات</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </main>
      </div>
    );
  }

  // Mobile: Show conversation list or messages
  // Desktop: Show both side by side
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (selectedConversation) {
                setSelectedConversation(null);
              } else {
                navigate(-1);
              }
            }}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            {selectedConversation
              ? selectedConversation.other_user?.displayName || "محادثة"
              : "المحادثات"}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNewChat(!showNewChat)}
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto flex h-[calc(100vh-65px)]">
        {/* Conversations List */}
        {(!selectedConversation || window.innerWidth >= 768) && (
          <div className={`${selectedConversation ? "hidden md:block md:w-1/3" : "w-full"} border-l border-border`}>
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* New Chat - Teachers List */}
            {showNewChat && (
              <div className="border-b border-border p-4 bg-muted/50">
                <h3 className="font-semibold mb-3 text-right">بدء محادثة جديدة</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teachers.map((teacher) => (
                    <button
                      key={teacher.uid}
                      onClick={() => startNewConversation(teacher.uid)}
                      className="w-full flex items-center justify-end gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="text-right">
                        <p className="font-medium">{teacher.displayName}</p>
                        <p className="text-xs text-muted-foreground">{teacher.role === "admin" ? "مسؤول" : "معلم"}</p>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{teacher.displayName?.[0] || "م"}</AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                  {teachers.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm">لا يوجد معلمون متاحون</p>
                  )}
                </div>
              </div>
            )}

            {/* Conversations */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد محادثات</p>
                  <Button className="mt-4" onClick={() => setShowNewChat(true)}>
                    بدء محادثة جديدة
                  </Button>
                </div>
              ) : (
                conversations
                  .filter(
                    (c) =>
                      !searchQuery ||
                      c.other_user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full flex items-center justify-end gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                        selectedConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="text-right flex-1 min-w-0">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conv.last_message_at)}
                          </span>
                          <p className="font-medium">{conv.other_user?.displayName || "مستخدم"}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message || "لا توجد رسائل بعد"}
                        </p>
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{conv.other_user?.displayName?.[0] || "م"}</AvatarFallback>
                      </Avatar>
                    </button>
                  ))
              )}
            </ScrollArea>
          </div>
        )}

        {/* Messages Area */}
        {selectedConversation && (
          <div className={`flex-1 flex flex-col ${selectedConversation ? "block" : "hidden md:flex"}`}>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-bl-none"
                            : "bg-muted rounded-br-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-start" : "justify-end"}`}>
                          <span className="text-[10px] opacity-70">{formatTime(msg.created_at)}</span>
                          {isMe && (
                            msg.is_read ? (
                              <CheckCheck className="w-3 h-3 opacity-70" />
                            ) : (
                              <Check className="w-3 h-3 opacity-70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="اكتب رسالتك..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-right flex-1"
                  disabled={isSending}
                />
              </form>
            </div>
          </div>
        )}

        {/* Empty State for Desktop */}
        {!selectedConversation && window.innerWidth >= 768 && (
          <div className="flex-1 hidden md:flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;