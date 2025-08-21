import { useQuery } from "@tanstack/react-query";
import { Scissors, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Service } from "@shared/schema";
import { useState, useRef, useEffect } from "react";

export default function Services() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nextSlide = () => {
    if (sliderRef.current && servicesToShow) {
      const maxSlide = servicesToShow.length - 1;
      setCurrentSlide(prev => prev >= maxSlide ? 0 : prev + 1);
    }
  };

  const prevSlide = () => {
    if (sliderRef.current && servicesToShow) {
      const maxSlide = servicesToShow.length - 1;
      setCurrentSlide(prev => prev <= 0 ? maxSlide : prev - 1);
    }
  };

  // Minimum swipe distance (in px)
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
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (isLoading) {
    return (
      <section id="services" className="py-20 bg-light-sand">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const defaultServices = [
    {
      id: 1,
      nameBg: "Подстрижка класическа",
      descriptionBg: "Традиционно мъжко подстригване с ножици и машинка",
      price: "40.00",
      duration: 30,
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      id: 2,
      nameBg: "Fade / Skin Fade",
      descriptionBg: "Модерно преливане с постепенен преход",
      price: "50.00",
      duration: 45,
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      id: 3,
      nameBg: "Триминг брада",
      descriptionBg: "Прецизно оформяне и стилизиране на брада",
      price: "35.00",
      duration: 25,
      imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      id: 4,
      nameBg: "Гореща кърпа + бръснене",
      descriptionBg: "Традиционно бръснене с гореща кърпа и пяна",
      price: "45.00",
      duration: 40,
      imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      id: 5,
      nameBg: "Комбо пакет",
      descriptionBg: "Подстригване + триминг брада + стилизиране",
      price: "70.00",
      duration: 60,
      imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    },
    {
      id: 6,
      nameBg: "Детско подстригване",
      descriptionBg: "Специални грижи за най-малките клиенти",
      price: "25.00",
      duration: 20,
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"
    }
  ];

  const servicesToShow = services && services.length > 0 ? services : defaultServices;

  return (
    <section id="services" className="py-20 bg-light-sand">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 text-pure-black">
            Нашите услуги
          </h2>
          <div className="w-24 h-0.5 bg-copper mx-auto mb-6"></div>
          <p className="text-xl text-deep-kelp max-w-2xl mx-auto">
            Професионално подстригване и грижа за брада с натурални продукти и традиционни техники
          </p>
        </div>
        
        {/* Mobile Slider */}
        {isMobile ? (
          <div className="relative max-w-sm mx-auto">
            <div 
              ref={sliderRef}
              className="overflow-hidden rounded-xl"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {servicesToShow.map((service) => (
                  <div key={service.id} className="w-full flex-shrink-0">
                    <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <img 
                        src={service.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"} 
                        alt={service.nameBg} 
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-6">
                        <div className="flex items-center mb-3">
                          <Scissors className="text-copper text-xl mr-3" />
                          <h3 className="font-serif text-xl font-semibold">{service.nameBg}</h3>
                        </div>
                        <p className="text-deep-kelp mb-4">{service.descriptionBg}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-pure-black">{service.price} лв</span>
                          <span className="text-deep-kelp flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {service.duration} мин
                          </span>
                        </div>
                        <Button 
                          onClick={scrollToBooking}
                          className="w-full bg-pure-black text-white hover:bg-copper transition-colors duration-300 font-medium rounded-full"
                        >
                          Резервирай
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {servicesToShow.map((_, index) => (
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {servicesToShow.map((service) => (
              <Card 
                key={service.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <img 
                  src={service.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"} 
                  alt={service.nameBg} 
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Scissors className="text-copper text-xl mr-3" />
                    <h3 className="font-serif text-xl font-semibold">{service.nameBg}</h3>
                  </div>
                  <p className="text-deep-kelp mb-4">{service.descriptionBg}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-pure-black">{service.price} лв</span>
                    <span className="text-deep-kelp flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {service.duration} мин
                    </span>
                  </div>
                  <Button 
                    onClick={scrollToBooking}
                    className="w-full bg-pure-black text-white hover:bg-copper transition-colors duration-300 font-medium rounded-full"
                  >
                    Резервирай
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
