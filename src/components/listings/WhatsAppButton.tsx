import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/utils/whatsapp";

interface WhatsAppButtonProps {
  phoneNumber: string;
  itemTitle: string;
  size?: "default" | "sm" | "lg" | "xl";
  className?: string;
}

export function WhatsAppButton({ phoneNumber, itemTitle, size = "lg", className }: WhatsAppButtonProps) {
  const handleClick = () => {
    const url = generateWhatsAppUrl(phoneNumber, itemTitle);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant="whatsapp"
      size={size}
      className={className}
      onClick={handleClick}
    >
      <MessageCircle className="h-5 w-5" />
      Contact on WhatsApp
    </Button>
  );
}
