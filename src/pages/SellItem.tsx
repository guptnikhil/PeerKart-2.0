import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_LABELS, type ListingCategory } from "@/types";
import { Upload, ImagePlus } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [category, setCategory] = useState<ListingCategory | "">("");

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
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));

      // Aspect ratio validation
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const desiredAspectRatio = 16 / 9;
        const tolerance = 0.1; // Allow for slight variations

        if (Math.abs(aspectRatio - desiredAspectRatio) > tolerance) {
          toast({
            title: "Image Aspect Ratio Warning",
            description: "For best results, please upload images with a 16:9 aspect ratio. Your image may be cropped.",
            variant: "default", // Use default for warning, not destructive
          });
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl: string | null = null;

    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExtension}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading image to Supabase Storage:", uploadError);
        toast({
          title: "Image Upload Failed",
          description: uploadError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      
      imageUrl = publicUrlData.publicUrl;
    }

    // Insert item details into Supabase database
    const { data, error: insertError } = await supabase.from("items").insert([
      {
        title,
        description,
        price: parseFloat(price as string),
        category,
        image_url: imageUrl,
        user_id: user?.id, // CRITICAL: This was missing and caused the 22P02 error
      },
    ]);

    if (insertError) {
      console.error("Error inserting item into Supabase:", insertError); // Added logging
      toast({
        title: "Listing Failed",
        description: insertError.message,
        variant: "destructive",
      });
    } else {
      console.log("Item listed successfully:", data);
      toast({
        title: "Listing submitted!",
        description: "Your item is pending AI verification and will go live shortly.",
      });
      // Clear form fields
      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setSelectedFile(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    setIsSubmitting(false);
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
            <p className="text-sm text-muted-foreground mb-2">
              Upload a clear photo of your item. A 16:9 aspect ratio is recommended, and images will be cropped to fit.
            </p>
            <div
              className="mt-2 flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-pk-blue-pale/30"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload photos</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., Engineering Mathematics Textbook" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your item's condition, usage, and any extras..." rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" placeholder="500" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} />
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

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Listing your item...
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
