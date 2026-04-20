import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16 rounded-md" />
              <Skeleton className="h-16 w-16 rounded-md" />
              <Skeleton className="h-16 w-16 rounded-md" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4 mt-4" />
            </div>
            <div className="space-y-2 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-3 pt-6 border-t border-border">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
