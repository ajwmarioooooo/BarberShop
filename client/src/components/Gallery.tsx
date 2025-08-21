import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import salon1 from "@assets/498937402_24366384986282550_4927484284951503052_n_1753362544672.jpg";
import salon2 from "@assets/499152040_24366385419615840_5176708792296104722_n_1753362544673.jpg";
import salon3 from "@assets/498695090_24366385009615881_3497431764273105900_n_1753362544673.jpg";
import salon4 from "@assets/499524520_24366385369615845_2782388708792740088_n_1753362544673.jpg";
import salon5 from "@assets/499152038_24366385219615860_6286751338286632680_n_1753362544673.jpg";

export default function Gallery() {
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const galleryImages = [
    {
      src: salon1,
      alt: "Празненство в салона с торта и балони"
    },
    {
      src: salon2,
      alt: "Декорация с балони и логото на Искрен Минков"
    },
    {
      src: salon3,
      alt: "Снимка на екипа в салона"
    },
    {
      src: salon4,
      alt: "Празник с гости в салона"
    },
    {
      src: salon5,
      alt: "Искрен Минков в салона си"
    },
    {
      src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Професионални инструменти"
    },
    {
      src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Класическо подстригване"
    },
    {
      src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      alt: "Модерно подстригване"
    }
  ];

  // Touch handlers for mobile slider
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide(prev => prev >= galleryImages.length - 1 ? 0 : prev + 1);
    } else if (isRightSwipe) {
      setCurrentSlide(prev => prev <= 0 ? galleryImages.length - 1 : prev - 1);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-light-sand">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 text-pure-black">
            Галерия
          </h2>
          <div className="w-24 h-0.5 bg-copper mx-auto mb-6"></div>
          <p className="text-xl text-deep-kelp max-w-2xl mx-auto">
            Атмосферата на нашия салон и примери от нашата работа
          </p>
        </div>
        
        {/* Mobile Slider */}
        {isMobile ? (
          <div className="relative max-w-sm mx-auto">
            <div 
              className="overflow-hidden rounded-xl"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {galleryImages.map((image, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-80 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentSlide ? 'bg-copper' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop Grid */
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {galleryImages.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-64 object-cover cursor-pointer hover:scale-105 transform transition-transform"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
