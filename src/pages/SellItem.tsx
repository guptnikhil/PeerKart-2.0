import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS, type ListingCategory } from "@/types";
import { Upload, ImagePlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const categories = Object.entries(CATEGORY_LABELS) as [ListingCategory, string][];

const SellItem = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Listing submitted!",
        description: "Your item is pending AI verification and will go live shortly.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Sell an Item</h1>
        <p className="mt-2 text-muted-foreground">
          List your item and connect with buyers on your campus.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Image upload area */}
          <div>
            <Label>Item Photos</Label>
            <div className="mt-2 flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-pk-blue-pale/30">
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload photos</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., Engineering Mathematics Textbook" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your item's condition, usage, and any extras..." rows={4} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" placeholder="500" min={0} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Upload className="h-4 w-4" /> List Item
              </>
            )}
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default SellItem;
