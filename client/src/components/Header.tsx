import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/95"
      } backdrop-blur-sm`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-[55px] w-auto" color="#000000" variant="image" />
          </div>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection("home")}
                className="hover:text-copper hover:bg-light-sand px-3 py-2 rounded-lg transition-all duration-200"
              >
                Начало
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="hover:text-copper hover:bg-light-sand px-3 py-2 rounded-lg transition-all duration-200"
              >
                Услуги
              </button>
              <button 
                onClick={() => scrollToSection("products")}
                className="hover:text-copper hover:bg-light-sand px-3 py-2 rounded-lg transition-all duration-200"
              >
                Продукти
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="hover:text-copper hover:bg-light-sand px-3 py-2 rounded-lg transition-all duration-200"
              >
                За нас
              </button>
              <button 
                onClick={() => scrollToSection("location")}
                className="hover:text-copper hover:bg-light-sand px-3 py-2 rounded-lg transition-all duration-200"
              >
                Местоположение
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="hover:text-copper hover:bg-light-sand px-3 py-2 rounded-lg transition-all duration-200"
              >
                Контакт
              </button>
              <Button 
                onClick={() => scrollToSection("booking")}
                className="bg-pure-black text-light-sand hover:bg-copper transition-all duration-300 font-medium rounded-full px-6 py-2"
              >
                Запази час
              </Button>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-pure-black"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
        
        {/* Mobile Navigation */}
        {isMobile && isMenuOpen && (
          <div className="mt-4 border-t border-pure-black/20 pt-4">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection("home")}
                className="py-2 text-left hover:text-copper hover:bg-light-sand px-3 rounded-lg transition-all duration-200"
              >
                Начало
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="py-2 text-left hover:text-copper hover:bg-light-sand px-3 rounded-lg transition-all duration-200"
              >
                Услуги
              </button>
              <button 
                onClick={() => scrollToSection("products")}
                className="py-2 text-left hover:text-copper hover:bg-light-sand px-3 rounded-lg transition-all duration-200"
              >
                Продукти
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="py-2 text-left hover:text-copper hover:bg-light-sand px-3 rounded-lg transition-all duration-200"
              >
                За нас
              </button>
              <button 
                onClick={() => scrollToSection("location")}
                className="py-2 text-left hover:text-copper hover:bg-light-sand px-3 rounded-lg transition-all duration-200"
              >
                Местоположение
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="py-2 text-left hover:text-copper hover:bg-light-sand px-3 rounded-lg transition-all duration-200"
              >
                Контакт
              </button>
              <Button 
                onClick={() => scrollToSection("booking")}
                className="bg-pure-black text-light-sand hover:bg-copper transition-all duration-300 font-medium rounded-full w-full mt-4"
              >
                Запази час
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
