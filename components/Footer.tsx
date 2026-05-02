import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Calendar } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top Banner */}
        <div className="text-center border-b border-white/20 pb-6">
          <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-red-500">
            Last date to register: 1 June 2026!
          </h2>
        </div>

        {/* Links and Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-base font-bold border-b border-white/20 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-2 flex flex-col items-start">
              <li>
                <Link href="/registration" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Registration
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/sports" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-base font-bold border-b border-white/20 pb-2 inline-block">Contact Info</h3>
            <div className="space-y-4 text-sm text-gray-300">
              
              <div className="flex items-start gap-3">
                <Phone className="shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-semibold text-white">Rahul Sharma</p>
                  <a href="tel:+919876543210" className="hover:text-white transition-colors block">+91 98765 43210</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-semibold text-white">Priya Patel</p>
                  <a href="tel:+918765432109" className="hover:text-white transition-colors block">+91 87654 32109</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="shrink-0 mt-0.5" size={16} />
                <p className="leading-relaxed">
                  JSS Medical College<br />
                  Sri Shivarathreeshwara Nagara<br />
                  Mysuru, Karnataka 570015
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="shrink-0 mt-0.5" size={16} />
                <p className="leading-relaxed">
                  <span className="font-semibold text-white">Festival Dates:</span><br />
                  Nov 5-8, 2026
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Branding */}
        <div className="flex flex-col items-center pt-6 border-t border-white/20 space-y-3">
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
            <Image 
              src="/logo-350kb.png" 
              alt="Tatvam Logo" 
              width={80} 
              height={80} 
              className="w-16 md:w-20 h-auto drop-shadow-xl"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-widest leading-none">TATVAM</h1>
            <p className="text-sm font-light tracking-[0.2em] mt-1 text-gray-400">2026</p>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-medium tracking-wide">
            © TATVAM 2026. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}