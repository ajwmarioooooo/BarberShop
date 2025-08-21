import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationMap() {
  const address = "ул. Поп Харитон 35, 9000 Варна, България";
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dUWTgEiA_zK&q=${encodeURIComponent(address)}`;
  
  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const openDirections = () => {
    const url = `https://maps.google.com/maps/dir//${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="location" className="py-20 bg-light-sand">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 text-pure-black">
            Нашето местоположение
          </h2>
          <div className="w-24 h-0.5 bg-copper mx-auto mb-8"></div>
          <p className="text-xl text-deep-kelp mb-8 leading-relaxed">
            Намерете ни в сърцето на Варна за вашето следващо посещение
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-xl border-0">
                <div className="relative">
                  {/* Custom Map with Styling */}
                  <div className="relative w-full h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2904.8765!2d27.9158!3d43.2141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4538badb78e9b%3A0x5727e9e20231bd46!2z0YPQuy4g0J_QvtC_INCl0LDRgNC40YLQvtC9IDM1LCA5MDAwINCe0LHQu9Cw0YHRgtC4INCS0LDRgNC90LA!5e0!3m2!1sbg!2sbg!4v1674123456789!5m2!1sbg!2sbg&maptype=roadmap&markers=color:0xB27A4F%7Clabel:B%7C43.2141,27.9158`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                      title="Blacksea Barber Location"
                    />
                    
                    {/* Custom Pin Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="relative">
                        <div className="w-8 h-8 bg-copper rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                          <div className="bg-pure-black text-white px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shadow-lg">
                            BLACKSEA BARBER
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-pure-black"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Location Info */}
            <div className="space-y-6">
              {/* Address Card */}
              <Card className="bg-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-copper rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold mb-2 text-pure-black">Адрес</h3>
                      <p className="text-deep-kelp leading-relaxed">
                        ул. Поп Харитон 35<br />
                        9000 Варна<br />
                        България
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="bg-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-copper rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold mb-2 text-pure-black">Телефон</h3>
                      <p className="text-deep-kelp">
                        <a href="tel:+359881234567" className="hover:text-copper transition-colors">
                          +359 88 123 4567
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Card */}
              <Card className="bg-white shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-copper rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-white h-6 w-6" />
                    </div>
                    <div className="w-full">
                      <h3 className="font-serif text-xl font-semibold mb-3 text-pure-black">Работно време</h3>
                      <div className="space-y-2 text-deep-kelp">
                        <div className="flex justify-between">
                          <span>Понеделник - Петък</span>
                          <span className="font-semibold">09:00 - 20:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Събота</span>
                          <span className="font-semibold">09:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Неделя</span>
                          <span className="font-semibold text-gray-500">Почивен ден</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={openDirections}
                  className="w-full bg-copper text-white hover:bg-copper/90 font-semibold py-3 rounded-full shadow-lg transition-all duration-300"
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  Вземи указания
                </Button>
                <Button 
                  onClick={openInMaps}
                  variant="outline"
                  className="w-full border-copper text-copper hover:bg-copper hover:text-white font-semibold py-3 rounded-full transition-all duration-300"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Отвори в Google Maps
                </Button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
}