import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getProxyUrl, cn } from "@/lib/utils";
import { Send, User as UserIcon, Package, Search, ArrowLeft, MessageSquare, MoreVertical, Smile, Paperclip, Check, CheckCheck, Phone, Video, X, Bell, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  room_id: string;
}

interface ChatRoom {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  last_message_text: string;
  last_message_at: string;
  item: {
    title: string;
    image_url: string;
    price: number;
  };
  other_user: {
    full_name: string;
    avatar_url: string;
  };
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRoomId = searchParams.get("room");

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(`
          *,
          item:items(title, image_url, price),
          buyer:profiles!chat_rooms_buyer_id_fkey(full_name, avatar_url),
          seller:profiles!chat_rooms_seller_id_fkey(full_name, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const processedRooms = data.map((room: any) => ({
        ...room,
        other_user: user.id === room.buyer_id ? room.seller : room.buyer
      }));

      setRooms(processedRooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchRooms();

    const roomSubscription = supabase
      .channel("global_room_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_rooms" },
        () => fetchRooms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!activeRoomId) return;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", activeRoomId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    if (!activeRoomId || !user) return;

    fetchMessages();

    const messageSubscription = supabase
      .channel(`room_messages_${activeRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${activeRoomId}`
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
          fetchRooms();
        }
      )
      .subscribe();

    // Mark messages as read when room is opened
    const markAsRead = async () => {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("room_id", activeRoomId)
        .neq("sender_id", user.id);
    };
    markAsRead();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [activeRoomId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoomId || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const { error: messageError } = await supabase.from("messages").insert([
        {
          room_id: activeRoomId,
          sender_id: user.id,
          content: messageContent,
        },
      ]);

      if (messageError) throw messageError;

      await supabase
        .from("chat_rooms")
        .update({
          last_message_text: messageContent,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", activeRoomId);

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleSuggestMeetingPoint = async (point: string) => {
    if (!activeRoomId || !user) return;
    
    const suggestion = `Hey, let's meet at the ${point} to finalize the deal! 🤝`;
    
    try {
      const { error: messageError } = await supabase.from("messages").insert([
        {
          room_id: activeRoomId,
          sender_id: user.id,
          content: suggestion,
        },
      ]);

      if (messageError) throw messageError;

      await supabase
        .from("chat_rooms")
        .update({
          last_message_text: suggestion,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", activeRoomId);

      await fetchMessages();
    } catch (err) {
      console.error("Error suggesting meeting point:", err);
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  const meetingPoints = [
    { label: "Main Canteen", icon: "☕" },
    { label: "Central Library", icon: "📚" },
    { label: "Academic Block", icon: "🏢" },
    { label: "Hostel Gate", icon: "🏠" },
    { label: "College Grounds", icon: "⚽" },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f0f2f5] overflow-hidden fixed inset-0 z-[100]">
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col w-full md:w-[30%] lg:w-[450px] border-r border-[#e9edef] bg-white transition-all shrink-0",
        activeRoomId ? "hidden md:flex" : "flex"
      )}>
        {/* User Profile Header */}
        <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-[#54656f]" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[#54656f] rounded-full">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#54656f] rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 bg-white shrink-0">
          <div className="relative bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5">
            <Search className="h-4 w-4 text-[#54656f] mr-4" />
            <input 
              placeholder="Search or start new chat" 
              className="bg-transparent border-none outline-none text-[14px] w-full placeholder:text-[#54656f]"
            />
          </div>
        </div>

        {/* Rooms List */}
        <ScrollArea className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex gap-3 animate-pulse px-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full opacity-60">
              <p className="text-[#54656f] text-sm">No chats yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSearchParams({ room: room.id })}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#f5f6f6]",
                    activeRoomId === room.id ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"
                  )}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={getProxyUrl(room.other_user?.avatar_url)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {room.other_user?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-[16px] text-[#111b21] truncate">{room.other_user?.full_name}</span>
                      <span className="text-[12px] text-[#667781] shrink-0">
                        {room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-[13px] text-primary shrink-0 font-bold"><Package className="h-3 w-3" /></span>
                      <span className="text-[13px] text-[#667781] truncate">
                        {room.last_message_text || "Negotiation started"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col relative transition-all",
        !activeRoomId ? "hidden md:flex bg-[#f8f9fa]" : "flex bg-[#efeae2]"
      )}>
        {/* Background Doodle Overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>
        
        {activeRoomId && activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-[#54656f]" onClick={() => setSearchParams({})}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={getProxyUrl(activeRoom.other_user?.avatar_url)} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {activeRoom.other_user?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 cursor-pointer" onClick={() => navigate(`/listing/${activeRoom.item_id}`)}>
                  <h2 className="text-[16px] font-medium leading-tight text-[#111b21] truncate">{activeRoom.other_user?.full_name}</h2>
                  <p className="text-[12px] text-[#667781] truncate">
                    Negotiating for: <span className="font-bold text-primary">{activeRoom.item?.title}</span> • ₹{activeRoom.item?.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" title="View Listing" className="text-[#54656f] rounded-full" onClick={() => navigate(`/listing/${activeRoom.item_id}`)}>
                  <Package className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 z-10 relative">
               <div className="flex flex-col min-h-full px-4 py-6 lg:px-20 gap-2">
                {messages.map((msg, index) => {
                  const isMe = msg.sender_id === user?.id;
                  const showTail = index === 0 || messages[index-1].sender_id !== msg.sender_id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-full mb-0.5",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "relative max-w-[85%] lg:max-w-[60%] px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] text-[14.2px] flex flex-col",
                          isMe 
                            ? "bg-[#d9fdd3] text-[#111b21] rounded-lg" 
                            : "bg-white text-[#111b21] rounded-lg",
                          showTail && isMe && "rounded-tr-none",
                          showTail && !isMe && "rounded-tl-none"
                        )}
                      >
                        {showTail && (
                          <div className={cn(
                            "absolute top-0 w-3 h-3",
                            isMe ? "-right-2 bg-[#d9fdd3]" : "-left-2 bg-white"
                          )} style={{
                            clipPath: isMe 
                              ? 'polygon(0 0, 0 100%, 100% 0)' 
                              : 'polygon(100% 0, 100% 100%, 0 0)'
                          }}></div>
                        )}
                        <span className="whitespace-pre-wrap pr-14 leading-relaxed">{msg.content}</span>
                        <div className="flex items-center gap-1 self-end mt-[-4px] ml-auto h-[14px] z-10">
                          <span className="text-[11px] text-[#667781]">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                          </span>
                          {isMe && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} className="h-4 shrink-0" />
              </div>
            </ScrollArea>

            {/* Input Bar */}
            <div className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 z-10 shrink-0">
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg px-4 py-2.5 shadow-sm ml-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="w-full bg-transparent border-none outline-none text-[15px] placeholder:text-[#54656f]"
                    autoFocus
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim()}
                  className={cn(
                    "bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full h-11 w-11 flex-shrink-0 shadow-sm transition-all",
                    !newMessage.trim() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-[#f8f9fa] z-10 relative">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="absolute top-4 left-4 rounded-full flex items-center gap-2 text-[#54656f]">
              <ArrowLeft className="h-5 w-5" /> Exit to PeerKart
            </Button>
            <div className="max-w-md space-y-6">
              <div className="relative mx-auto w-fit">
                <img 
                  src="https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png" 
                  className="h-64 opacity-20" 
                  alt="WhatsApp Web placeholder"
                />
                <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 text-[#00a884] opacity-40" />
              </div>
              <h2 className="text-[32px] font-light text-[#41525d]">PeerKart Web</h2>
              <p className="text-[#667781] text-[14px] leading-relaxed">
                Send and receive messages without keeping your phone online.<br />
                Negotiate prices and finalize deals with campus peers instantly.
              </p>
              <div className="pt-12 flex items-center justify-center gap-1.5 text-[#8696a0] text-[14px]">
                <span className="flex items-center gap-1.5"><CheckCheck className="h-4 w-4" /> End-to-end encrypted</span>
              </div>
            </div>
            <div className="absolute bottom-10 h-[6px] w-[200px] bg-[#00a884] rounded-full opacity-60"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
