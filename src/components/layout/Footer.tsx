import { Link } from "react-router-dom";
import logo from "@/assets/peerkart-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="PeerKart" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-display text-lg font-bold text-foreground">
                Peer<span className="text-pk-green">Kart</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Built by Students. Trusted by Students.
            </p>
          </div>

          {/* Removed Platform Section */}

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://wa.me/7388748271?text=Hello%20PeerKart%20Support%2C%20I%20need%20help%20with..." target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety Tips</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PeerKart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
