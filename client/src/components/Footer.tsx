import { MapPin, Phone, Mail } from "lucide-react";
import { FaInstagram, FaFacebookF, FaViber, FaWhatsapp } from "react-icons/fa";
import Logo from "./Logo";
import logoImage from "@assets/blacksea-barber-logo.png";

export default function Footer() {
  return (
    <footer id="contact" className="bg-pure-black text-light-sand py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <img 
                src={logoImage} 
                alt="Blacksea Barber Logo" 
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Професионална грижа за коса и брада с черноморски стил. 
              Натурални продукти, традиционни техники и модерен подход.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-copper rounded-full flex items-center justify-center hover:bg-light-sand hover:text-pure-black transition-colors"
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-copper rounded-full flex items-center justify-center hover:bg-light-sand hover:text-pure-black transition-colors"
              >
                <FaFacebookF />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-copper rounded-full flex items-center justify-center hover:bg-light-sand hover:text-pure-black transition-colors"
              >
                <FaViber />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-copper rounded-full flex items-center justify-center hover:bg-light-sand hover:text-pure-black transition-colors"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-copper">Контакт</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start space-x-3">
                <MapPin className="text-copper mt-1 h-5 w-5" />
                <div>
                  <div>ул. Поп Харитон 35</div>
                  <div>9000 Варна</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-copper h-5 w-5" />
                <span>+359 88 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-copper h-5 w-5" />
                <span>info@blackseabarber.bg</span>
              </div>
            </div>
          </div>
          
          {/* Working Hours */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-copper">Работно време</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Пн - Пт</span>
                <span>09:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>Събота</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Неделя</span>
                <span>Почивен ден</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              Copyright © 2024 BLACKSEA BARBER. Всички права запазени.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-copper transition-colors">
                Политика за поверителност
              </a>
              <a href="#" className="hover:text-copper transition-colors">
                Общи условия
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
