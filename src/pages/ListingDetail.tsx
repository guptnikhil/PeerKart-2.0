import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/listings/WhatsAppButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/types";
import { ArrowLeft, Calendar, ShieldCheck, ChevronLeft, ChevronRight, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProxyUrl, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select(`
          *,
          profiles (
            full_name,
            college_name,
            whatsapp_number,
            avatar_url,
            whatsapp_enabled
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching listing:", error);
      } else {
        setListing(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground animate-pulse">Fetching item details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Listing not found</h1>
          <Button asChild className="mt-4">
            <Link to="/browse">Back to Browse</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const seller = listing.profiles;
  const images = listing.image_urls && listing.image_urls.length > 0 
    ? listing.image_urls 
    : [listing.image_url];

  const handleStartChat = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to chat with the seller.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user.id === listing.user_id) {
      toast({
        title: "Self Chat",
        description: "You cannot chat with yourself.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if chat room already exists
      const { data: existingRoom, error: fetchError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("seller_id", listing.user_id)
        .eq("item_id", listing.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingRoom) {
        // If room exists but has no messages, send the automated one
        const { count, error: countError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", existingRoom.id);

        if (!countError && count === 0) {
          await supabase.from("messages").insert([
            {
              room_id: existingRoom.id,
              sender_id: user.id,
              content: `I'm interested in buying your ${listing.title}!`,
            },
          ]);
        }
        navigate(`/messages?room=${existingRoom.id}`);
      } else {
        // Create new chat room
        const { data: newRoom, error: insertError } = await supabase
          .from("chat_rooms")
          .insert([
            {
              buyer_id: user.id,
              seller_id: listing.user_id,
              item_id: listing.id,
              last_message_text: `I'm interested in buying your ${listing.title}!`,
              last_message_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Send initial automated message
        await supabase.from("messages").insert([
          {
            room_id: newRoom.id,
            sender_id: user.id,
            content: `I'm interested in buying your ${listing.title}!`,
          },
        ]);

        navigate(`/messages?room=${newRoom.id}`);
      }
    } catch (err: any) {
      console.error("Error starting chat:", err);
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  const getAgeLabel = (age: string) => {
    const options: Record<string, string> = {
      "new": "Brand New (Unused)",
      "<6m": "Less than 6 Months",
      "6-12m": "6-12 Months",
      "1-2y": "1-2 Years",
      "2y+": "2+ Years"
    };
    return options[age] || age;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link to="/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {/* Image Section - Flipkart Style Carousel */}
          <div className="space-y-4">
            <div className="relative group overflow-hidden rounded-xl border border-border bg-muted/20">
              <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                  {images.map((url: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center">
                        <img
                          src={getProxyUrl(url)}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border-none shadow-md" />
                    <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border-none shadow-md" />
                  </>
                )}
              </Carousel>
              
              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-medium backdrop-blur-sm">
                  {current + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                      current === index ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={getProxyUrl(url)} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}</Badge>
                {listing.ai_score && listing.ai_score >= 85 && (
                  <Badge className="bg-pk-green text-accent-foreground gap-1">
                    <ShieldCheck className="h-3 w-3" /> AI Verified ({listing.ai_score}%)
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {listing.title}
              </h1>
              <p className="mt-3 font-display text-3xl font-bold text-primary">
                ₹{listing.price.toLocaleString("en-IN")}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground border-t border-border pt-4">
              {listing.age && (
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Item Age: {getAgeLabel(listing.age)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Listed {new Date(listing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            {/* Seller info */}
            {seller && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0">
                    {seller.avatar_url ? (
                      <img src={getProxyUrl(seller.avatar_url)} alt="Seller Avatar" className="h-full w-full rounded-full object-cover shadow-sm border border-border" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary shadow-sm border border-primary/20">
                        {seller.full_name ? seller.full_name[0].toUpperCase() : "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-card-foreground">{seller.full_name}</p>
                    <p className="text-xs text-muted-foreground">{seller.college_name}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleStartChat}
                    variant="hero" 
                    className="w-full h-12 text-base font-bold flex items-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" /> Chat with Seller
                  </Button>
                  {seller.whatsapp_enabled !== false && (
                    <WhatsAppButton
                      phoneNumber={seller.whatsapp_number}
                      itemTitle={listing.title}
                      className="w-full h-12 text-base font-bold"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ListingDetail;
