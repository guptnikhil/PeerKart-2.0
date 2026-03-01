import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  status: "pending" | "approved" | "rejected";
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const fetchPendingListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching pending listings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending listings.",
        variant: "destructive",
      });
    } else {
      setPendingListings(data || []);
    }
    setLoading(false);
  };

  const updateListingStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("items")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(`Error updating listing ${id} status to ${status}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status} listing.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Listing ${id} has been ${status}.`,
      });
      fetchPendingListings(); // Refresh the list
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Loading pending listings...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Review and moderate pending product listings.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingListings.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">No pending listings to review.</p>
          ) : (
            pendingListings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <img src={listing.image_url} alt={listing.title} className="h-48 w-full object-cover rounded-md mb-4" />
                  <CardTitle>{listing.title}</CardTitle>
                  <CardDescription>{listing.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">₹{listing.price}</p>
                  <p className="text-sm text-muted-foreground">Category: {listing.category}</p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="hero" onClick={() => updateListingStatus(listing.id, "approved")} className="flex-1">Approve</Button>
                  <Button variant="outline" onClick={() => updateListingStatus(listing.id, "rejected")} className="flex-1">Reject</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;