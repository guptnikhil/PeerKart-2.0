import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, UserCircle, Bell, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/peerkart-logo.png";
import { useAuth } from "@/context/AuthContext";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProxyUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { label: "Browse", path: "/browse" },
  { label: "Sell", path: "/sell" },
  { label: "Dashboard", path: "/dashboard" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnreadCount();
      
      // Subscribe to new messages for notifications
      const messageSubscription = supabase
        .channel('navbar_notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          () => fetchUnreadCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    } else {
      setProfile(null);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user?.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    // Count unread messages where user is not the sender
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: 'exact', head: true })
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false); // Close mobile menu on logout
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PeerKart" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-display text-xl font-bold text-foreground">
            Peer<span className="text-pk-green">Kart</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              asChild
              variant={location.pathname === link.path ? "default" : "ghost"}
              size="sm"
            >
              <Link to={link.path}>
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="relative mr-1" onClick={() => navigate("/messages")}>
                <Link to="/messages">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-destructive animate-pulse">
                    </span>
                  )}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="flex items-center gap-2 pr-2">
                <Link to="/profile">
                  <div className="flex items-center gap-2">
                    {profile?.avatar_url ? (
                      <img src={getProxyUrl(profile.avatar_url)} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                    <span className="max-w-[120px] truncate">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Button asChild variant="ghost" size="icon" className="relative mr-1" onClick={() => navigate("/messages")}>
              <Link to="/messages">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-destructive animate-pulse">
                  </span>
                )}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant={location.pathname === link.path ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
              >
                {link.label}
              </Button>
            ))}
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start flex items-center gap-2"
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                >
                  {profile?.avatar_url ? (
                    <img src={getProxyUrl(profile.avatar_url)} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <UserCircle className="h-5 w-5" />
                  )}
                  <span className="truncate">
                    {profile?.full_name || user.email}
                  </span>
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  Log out
                </Button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={() => {
                    navigate("/register");
                    setMobileOpen(false);
                  }}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
