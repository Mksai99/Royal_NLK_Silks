import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-wider text-secondary">ROYAL NLK SILKS</h2>
            <p className="text-xs tracking-[0.2em] mt-1 opacity-80">AUTHENTIC HANDLOOM SILKS</p>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Preserving the heritage of Dharmavaram silks with exquisite craftsmanship and timeless designs for every celebration.
          </p>
          <div className="flex gap-4">
            <Link href="https://www.instagram.com/royal_nlksilks_dmm" target="_blank" className="w-10 h-10 rounded-full border border-secondary/30 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
              <Instagram size={20} />
            </Link>
            <Link href="https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ" target="_blank" className="w-10 h-10 rounded-full border border-secondary/30 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300">
              <MessageCircle size={20} />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-serif font-bold mb-6 text-secondary underline underline-offset-8 decoration-secondary/30">Quick Links</h3>
          <ul className="flex flex-col gap-4 text-sm opacity-80">
            <li><Link href="/" className="hover:text-secondary transition-colors">Home</Link></li>
            <li><Link href="/categories" className="hover:text-secondary transition-colors">All Collections</Link></li>
            <li><Link href="/track-order" className="hover:text-secondary transition-colors">Check Order Status</Link></li>
            <li><Link href="/about" className="hover:text-secondary transition-colors">About Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-serif font-bold mb-6 text-secondary underline underline-offset-8 decoration-secondary/30">Contact Us</h3>
          <ul className="flex flex-col gap-4 text-sm opacity-80">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-secondary shrink-0" />
              <span>Shanthi Nagar, Dharmavaram - 515671</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-secondary shrink-0" />
              <span>+91 8282824929</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-secondary shrink-0" />
              <span>royalnlksilks@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter / CTA */}
        <div>
          <h3 className="text-lg font-serif font-bold mb-6 text-secondary underline underline-offset-8 decoration-secondary/30">Join Our Community</h3>
          <p className="text-sm opacity-80 mb-4">Stay updated with our latest collections and exclusive offers.</p>
          <Link 
            href="https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ" 
            target="_blank"
            className="inline-flex items-center gap-2 bg-secondary text-primary font-bold px-6 py-3 rounded-md hover:bg-secondary/90 transition-all active:scale-95 shadow-lg"
          >
            <MessageCircle size={18} />
            JOIN WHATSAPP
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-secondary/20 mt-16 pt-8 text-center text-[10px] tracking-[0.2em] opacity-60">
        © 2024 ROYAL NLK SILKS. ALL RIGHTS RESERVED. DESIGNED FOR ELEGANCE.
      </div>
    </footer>
  );
};

export default Footer;
