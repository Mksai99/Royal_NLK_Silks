import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle, MapPin, Phone, Mail, Award, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Header Banner */}
      <section className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1590736962236-4d0092305530?q=80&w=2000&auto=format&fit=crop"
            alt="About Royal NLK Silks"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 text-center animate-fade-in">
          <h2 className="text-secondary font-bold tracking-[0.3em] uppercase mb-4 text-sm">OUR LEGACY</h2>
          <h1 className="text-white text-5xl md:text-7xl font-serif font-bold">The Story of <br /> Royal NLK Silks</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-primary text-4xl font-serif font-bold mb-8">Crafting Heritage Since Generations</h2>
            <div className="w-20 h-1 bg-secondary mb-8" />
            <div className="flex flex-col gap-6 text-muted-foreground leading-relaxed">
              <p>
                Based in the historical weaving hub of Shanthi Nagar, Dharmavaram, ROYAL NLK SILKS is a testament to the enduring beauty of Indian handloom. For years, we have been at the forefront of preserving the traditional art of silk weaving, specializing in the legendary Dharmavaram and Kanchipuram silks.
              </p>
              <p>
                Our journey began with a simple vision: to bring the authentic craftsmanship of local master weavers directly to connoisseurs who value quality and tradition. Each saree in our collection is meticulously hand-woven, taking days or even weeks of dedicated effort by skilled artisans.
              </p>
              <p>
                We believe that a saree is not just an attire; it is a piece of art that carries the soul of its weaver and the heritage of its origin. Whether it's the rich gold zari of a bridal Kanchipuram or the elegant motifs of a Dharmavaram special, we ensure every piece reflects royalty.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
            <div className="relative h-64 md:h-80 rounded-sm overflow-hidden shadow-xl mt-12">
              <Image src="https://images.unsplash.com/photo-1610030469668-93510ef2d32e?q=80&w=800" alt="Saree Detail" fill className="object-cover" />
            </div>
            <div className="relative h-64 md:h-80 rounded-sm overflow-hidden shadow-xl">
              <Image src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800" alt="Weaving Process" fill className="object-cover" />
            </div>
            <div className="relative h-64 md:h-80 rounded-sm overflow-hidden shadow-xl -mt-12">
              <Image src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800" alt="Silk Collection" fill className="object-cover" />
            </div>
            <div className="relative h-64 md:h-80 rounded-sm overflow-hidden shadow-xl">
              <Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800" alt="Store Front" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-primary text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full border-2 border-secondary flex items-center justify-center text-secondary">
              <Award size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold">Uncompromising Quality</h3>
            <p className="opacity-70 text-sm leading-relaxed">We source only the finest mulberry silk and pure gold-coated zari to ensure every saree meets the highest standards of luxury.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full border-2 border-secondary flex items-center justify-center text-secondary">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold">Artisan Empowerment</h3>
            <p className="opacity-70 text-sm leading-relaxed">We work directly with master weavers in Dharmavaram, ensuring fair trade and supporting the community that keeps this art alive.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full border-2 border-secondary flex items-center justify-center text-secondary">
              <Heart size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold">Customer Connection</h3>
            <p className="opacity-70 text-sm leading-relaxed">From personalized consultations to secure global shipping, we strive to make your shopping experience as elegant as our sarees.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-white shadow-2xl rounded-sm border border-secondary/10 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 bg-primary text-white p-12">
            <h2 className="text-3xl font-serif font-bold mb-8">Get In Touch</h2>
            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <MapPin className="text-secondary shrink-0" />
                <div>
                  <p className="font-bold">Address</p>
                  <p className="opacity-70 text-sm">Shanthi Nagar, Dharmavaram - 515671</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="text-secondary shrink-0" />
                <div>
                  <p className="font-bold">Mobile</p>
                  <p className="opacity-70 text-sm">8282824929</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail className="text-secondary shrink-0" />
                <div>
                  <p className="font-bold">Email</p>
                  <p className="opacity-70 text-sm">royalnlksilks@gmail.com</p>
                </div>
              </div>
              <div className="flex gap-6 mt-4">
                <Link href="https://www.instagram.com/royal_nlksilks_dmm" className="text-secondary hover:text-white transition-colors">
                  <Instagram size={24} />
                </Link>
                <Link href="https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ" className="text-secondary hover:text-white transition-colors">
                  <MessageCircle size={24} />
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full md:w-3/5 p-12">
            <h3 className="text-2xl font-serif font-bold text-primary mb-8">Send Us a Message</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Your Name" className="border-b border-gray-200 py-3 outline-none focus:border-secondary transition-colors" />
              <input type="email" placeholder="Your Email" className="border-b border-gray-200 py-3 outline-none focus:border-secondary transition-colors" />
              <input type="text" placeholder="Subject" className="md:col-span-2 border-b border-gray-200 py-3 outline-none focus:border-secondary transition-colors" />
              <textarea rows={4} placeholder="Your Message" className="md:col-span-2 border-b border-gray-200 py-3 outline-none focus:border-secondary transition-colors"></textarea>
              <button className="bg-secondary text-primary font-bold px-12 py-4 rounded-sm w-fit hover:bg-secondary/90 transition-all shadow-lg mt-4">
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
