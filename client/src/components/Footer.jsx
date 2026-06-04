import React from 'react';
import { Mail, Phone, Instagram, Github, Linkedin, Twitter } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-zinc-900 mt-20 font-sans">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo Section */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h1 className="text-[#FF6B00] text-4xl font-black italic tracking-wider">PULSE</h1>
            <p className="text-[10px] font-bold text-zinc-300 tracking-widest mt-1.5 uppercase">
              POWER FROM WITHIN
            </p>
            <p className="text-zinc-500 text-xs mt-5 leading-relaxed max-w-xs font-medium">
              AI-powered fitness tracking that helps you train smarter and achieve more.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FF6B00] hover:text-[#ff802b] transition-all cursor-pointer"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FF6B00] hover:text-[#ff802b] transition-all cursor-pointer"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FF6B00] hover:text-[#ff802b] transition-all cursor-pointer"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FF6B00] hover:text-[#ff802b] transition-all cursor-pointer"
                title="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Contact & Follow Us */}
          <div className="md:col-span-3">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-5">CONTACT US</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 text-zinc-400 text-xs">
                <Mail size={15} className="text-[#FF6B00] shrink-0" />
                <a href="mailto:vedantlodhi1203@gmail.com" className="hover:text-white transition-colors">
                  vedantlodhi1203@gmail.com
                </a>
              </div>
            </div>

            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-8 mb-5">FOLLOW US</h3>
            <div className="flex items-start gap-2.5 text-zinc-400 text-xs">
              <Linkedin size={15} className="text-[#FF6B00] shrink-0 mt-0.5" />
              <a 
                href="https://www.linkedin.com/in/vedant-lodhi/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors break-all"
              >
                https://www.linkedin.com/in/vedant-lodhi/
              </a>
            </div>
          </div>

          {/* Locations */}
          <div className="md:col-span-3">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-5">OUR LOCATION</h3>
            
            <div className="space-y-5">
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-1">Chandigarh</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  Block A,<br />
                  Sector-26, 160001
                </p>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-1">Rajpura</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  Chitkara University,<br />
                  Rajpura, 140401
                </p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="md:col-span-2">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-5">OPENING HOURS</h3>
            
            <div className="space-y-5">
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-1">Monday-Friday</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  Our doors are open<br />
                  06:00 - 22:00
                </p>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wide mb-1">Weekends</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  Our doors are open<br />
                  10:00 - 21:00
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-900 mt-16 pt-8 text-center">
          <p className="text-zinc-650 text-[10px] font-bold tracking-widest uppercase">
            &copy; 2025 PULSE AI. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;