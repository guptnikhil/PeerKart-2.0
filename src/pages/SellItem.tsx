import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS, type ListingCategory } from "@/types";
import { Upload, ImagePlus, X, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const categories = Object.entries(CATEGORY_LABELS) as [ListingCategory, string][];

const SellItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Multiple images state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [category, setCategory] = useState<ListingCategory | "">("");
  const [age, setAge] = useState<string>("");

  const ageOptions = [
    { label: "Brand New (Unused)", value: "new" },
    { label: "Less than 6 Months", value: "<6m" },
    { label: "6-12 Months", value: "6-12m" },
    { label: "1-2 Years", value: "1-2y" },
    { label: "2+ Years", value: "2y+" },
  ];

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to sell an item.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const remainingSlots = 5 - selectedFiles.length;
      
      if (newFiles.length > remainingSlots) {
        toast({
          title: "Limit Reached",
          description: `You can only upload up to 5 images. Adding ${remainingSlots} more.`,
          variant: "destructive",
        });
      }

      const filesToAdd = newFiles.slice(0, remainingSlots);
      const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));

      setSelectedFiles(prev => [...prev, ...filesToAdd]);
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...imagePreviewUrls];
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setImagePreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast({
        title: "Image Required",
        description: "Please upload at least one image of your item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls: string[] = [];

      // Upload all selected images
      for (const file of selectedFiles) {
        const fileExtension = file.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        
        imageUrls.push(publicUrlData.publicUrl);
      }

      // Insert item details into Supabase database with image_urls array
      const { error: insertError } = await supabase.from("items").insert([
        {
          title,
          description,
          price: parseFloat(price as string),
          category,
          image_url: imageUrls[0], // Keep legacy support
          image_urls: imageUrls,    // Support multiple images
          age: age,
          user_id: user?.id,
          status: 'approved',
        },
      ]);

      if (insertError) throw insertError;

      toast({
        title: "Listing submitted!",
        description: "Your item is live with multiple photos.",
      });
      
      navigate("/browse");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast({
        title: "Listing Failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Sell an Item</h1>
        <p className="mt-2 text-muted-foreground">
          Showcase your item with up to 5 high-quality photos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Multiple Image upload area */}
          <div>
            <Label>Item Photos ({selectedFiles.length}/5)</Label>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {imagePreviewUrls.map((url, index) => (
                <div key={url} className="relative aspect-video group">
                  <img src={url} alt="Preview" className="h-full w-full object-cover rounded-xl border border-border shadow-sm" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                      COVER
                    </div>
                  )}
                </div>
              ))}
              
              {selectedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-video cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-all hover:border-primary hover:bg-pk-blue-pale/30"
                >
                  <div className="text-center">
                    <Plus className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-1 text-xs text-muted-foreground font-medium">Add Photo</p>
                  </div>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              multiple
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., LG TV Remote - Mint Condition" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Mention key details, usage history, and if there are any defects..." rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" placeholder="250" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select required value={category} onValueChange={(value: ListingCategory) => setCategory(value)}>
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

          <div className="space-y-2">
            <Label>Item Age</Label>
            <Select required value={age} onValueChange={(value: string) => setAge(value)}>
              <SelectTrigger>
                <SelectValue placeholder="How old is this item?" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading Photos ({selectedFiles.length})...
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> List Item
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
