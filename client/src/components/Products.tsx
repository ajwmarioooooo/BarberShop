import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Products() {
  return (
    <section id="products" className="py-20 bg-dark-sand">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 text-white">
            Професионални продукти
          </h2>
          <div className="w-24 h-0.5 bg-copper mx-auto mb-6"></div>
          <p className="text-xl text-light-sand max-w-2xl mx-auto">
            Натурални продукти за грижа от семейната традиция
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Image Side */}
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                  alt="Професионални продукти" 
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              
              {/* Content Side */}
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="text-center md:text-left">
                  <h3 className="font-serif text-3xl font-bold mb-4 text-pure-black">
                    Скоро се завръщаме
                  </h3>
                  <div className="w-16 h-0.5 bg-copper mx-auto md:mx-0 mb-6"></div>
                  
                  <div className="space-y-4 text-deep-kelp">
                    <p className="text-lg leading-relaxed">
                      Подготвяме линия професионални продукти за коса и брада с натурални съставки 
                      и внимание към детайла.
                    </p>
                    
                    <p className="text-lg leading-relaxed font-medium text-copper">
                      Очакват ви качествени продукти, подбрани с грижа за вашия стил!
                    </p>
                  </div>
                  
                  <div className="mt-8">
                    <div className="bg-light-sand rounded-xl p-6">
                      <h4 className="font-serif text-xl font-semibold mb-3 text-pure-black">
                        Какво подготвяме:
                      </h4>
                      <ul className="space-y-2 text-deep-kelp">
                        <li className="flex items-center">
                          <Star className="w-4 h-4 text-copper mr-2" />
                          Помади за стилизиране
                        </li>
                        <li className="flex items-center">
                          <Star className="w-4 h-4 text-copper mr-2" />
                          Масла за грижа за брада
                        </li>
                        <li className="flex items-center">
                          <Star className="w-4 h-4 text-copper mr-2" />
                          Шампоани за коса и брада
                        </li>
                        <li className="flex items-center">
                          <Star className="w-4 h-4 text-copper mr-2" />
                          Продукти за бръснене
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}