import { Calendar, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import marbleBackground from "@assets/u60555p_1753361327799.jpg";

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="min-h-screen relative flex items-center justify-center">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 hero-gradient"></div>
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${marbleBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      ></div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Hero title */}
        <div className="mb-8">
          <h1 className="font-serif text-5xl lg:text-7xl font-bold mb-4 text-pure-black">
            BLACKSEA<br />
            <span className="text-4xl lg:text-5xl">BARBER</span>
          </h1>
        </div>
        
        <p className="text-xl lg:text-2xl mb-8 text-pure-black font-medium">
          Професионална грижа за коса и брада.<br />
          <span className="text-deep-kelp">Черноморски стил.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => scrollToSection("booking")}
            className="bg-pure-black text-light-sand hover:bg-copper transition-all duration-300 font-semibold text-lg shadow-lg rounded-full px-8 py-4"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Запази час
          </Button>
          <Button 
            onClick={() => scrollToSection("products")}
            variant="outline"
            className="border-2 border-pure-black text-pure-black hover:bg-pure-black hover:text-light-sand transition-all duration-300 font-semibold text-lg rounded-full px-8 py-4"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Онлайн магазин
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-pure-black text-2xl" />
      </div>
    </section>
  );
}
