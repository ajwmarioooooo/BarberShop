import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  const scrollToGallery = () => {
    const element = document.getElementById("gallery");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-20 bg-dark-sand">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 text-pure-black">
              За нас
            </h2>
            <div className="w-24 h-0.5 bg-copper mb-6"></div>
            <p className="text-xl text-deep-kelp mb-6 leading-relaxed">
              Родени край Черното море. Стил, техника и натурални продукти.
            </p>
            <p className="text-lg text-pure-black mb-8 leading-relaxed">
              В Blacksea Barber съчетаваме традиционните техники за подстригване с модерните тенденции. 
              Нашите майстори са обучени в най-добрите школи и работят само с висококачествени продукти.
              Всеки клиент получава индивидуално внимание и професионална консултация.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-copper">500+</div>
                <div className="text-deep-kelp">Доволни клиенти</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-copper">5+</div>
                <div className="text-deep-kelp">Години опит</div>
              </div>
            </div>
            <Button 
              onClick={scrollToGallery}
              className="bg-pure-black text-white hover:bg-copper transition-all duration-300 font-semibold rounded-full px-8 py-4"
            >
              <Images className="mr-2 h-5 w-5" />
              Виж галерията
            </Button>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Екипът на Blacksea Barber" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pure-black/30 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
