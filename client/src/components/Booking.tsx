import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Service, Barber, InsertBooking } from "@shared/schema";
// Import removed as we now use dynamic images from database

export default function Booking() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services", selectedBarber ? { barberId: selectedBarber } : null],
    queryFn: () => {
      const url = selectedBarber 
        ? `/api/services?barberId=${selectedBarber}`
        : '/api/services';
      return fetch(url).then(res => res.json());
    },
  });

  const { data: barbers } = useQuery<Barber[]>({
    queryKey: ["/api/barbers"],
  });

  // Get booked time slots for selected date and barber
  const { data: bookedSlots = [] } = useQuery<string[]>({
    queryKey: ["/api/bookings/booked-slots", selectedDate, selectedBarber],
    queryFn: () => {
      if (!selectedDate || !selectedBarber) return Promise.resolve([]);
      return fetch(`/api/bookings/booked-slots?date=${selectedDate}&barberId=${selectedBarber}`)
        .then(res => res.json());
    },
    enabled: !!(selectedDate && selectedBarber),
  });

  const bookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      return apiRequest("POST", "/api/bookings/enhanced", booking);
    },
    onSuccess: () => {
      toast({
        title: "Резервацията е потвърдена!",
        description: "Ще получите потвърждение на имейл и SMS.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
      });
      // Reset form
      setSelectedService("");
      setSelectedBarber("");
      setSelectedDate("");
      setSelectedTime("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Неуспешна резервация. Моля опитайте отново.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
    },
  });

  // Clear service selection when barber changes
  const handleBarberChange = (barberId: string) => {
    setSelectedBarber(barberId);
    setSelectedService(""); // Reset service when barber changes
    setSelectedTime(""); // Reset time when barber changes
  };

  // Show message if no services available for selected barber
  const hasServices = services && services.length > 0;

  const getAvailableTimeSlots = () => {
    const allTimeSlots = [
      "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];
    
    // If no date is selected, return all slots
    if (!selectedDate) return allTimeSlots;
    
    const today = new Date();
    const selectedDateOnly = selectedDate.split('T')[0];
    const todayDateOnly = today.toISOString().split('T')[0];
    
    let availableSlots = allTimeSlots;
    
    // If selected date is today, filter out past hours
    if (selectedDateOnly === todayDateOnly) {
      const currentHour = today.getHours();
      availableSlots = allTimeSlots.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        return slotHour > currentHour;
      });
    }
    
    // Filter out booked slots
    return availableSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const timeSlots = getAvailableTimeSlots();

  // Clear selected time if it becomes unavailable when slots change
  useEffect(() => {
    if (selectedTime && timeSlots.length > 0 && !timeSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedTime, timeSlots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || 
        !customerName || !customerPhone || !customerEmail) {
      toast({
        title: "Невалидни данни",
        description: "Моля попълнете всички задължителни полета.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
      return;
    }

    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const now = new Date();
    
    // Check if appointment is in the past
    if (appointmentDateTime <= now) {
      toast({
        title: "Невалидна дата/час",
        description: "Не можете да резервирате час в миналото. Моля изберете бъдеща дата и час.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
      return;
    }
    
    const booking: InsertBooking = {
      customerName,
      customerPhone,
      customerEmail,
      serviceId: parseInt(selectedService),
      barberId: parseInt(selectedBarber),
      appointmentDate: appointmentDateTime,
      notes: notes || null,
    };

    bookingMutation.mutate(booking);
  };

  return (
    <section id="booking" className="py-12 sm:py-20 bg-light-sand">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-pure-black">
            Запази час
          </h2>
          <div className="w-24 h-0.5 bg-copper mx-auto mb-4 sm:mb-6"></div>
          <p className="text-lg sm:text-xl text-deep-kelp max-w-2xl mx-auto px-4">
            Избери услуга, майстор и удобно време за теб
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-2xl shadow-xl">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Booking Form */}
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                    Детайли за резервацията
                  </h3>
                  
                  {/* Service Selection */}
                  <div className="mb-4 sm:mb-6">
                    <Label htmlFor="service" className="text-pure-black font-medium mb-2 sm:mb-3 block">
                      Услуга
                    </Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Избери услуга" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {!selectedBarber && (
                          <div className="px-2 py-1 text-sm text-gray-500">Първо изберете барбер</div>
                        )}
                        {selectedBarber && services && services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.nameBg} - {service.price} лв
                          </SelectItem>
                        ))}
                        {selectedBarber && (!services || services.length === 0) && (
                          <div className="px-2 py-1 text-sm text-gray-500">Няма налични услуги за този барбер</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Barber Selection */}
                  <div className="mb-4 sm:mb-6">
                    <Label className="text-pure-black font-medium mb-2 sm:mb-3 block">Майстор</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {barbers && barbers.map((barber) => (
                        <Card 
                          key={barber.id}
                          className={`cursor-pointer transition-colors ${
                            selectedBarber === barber.id.toString() 
                              ? "border-copper border-2" 
                              : "border-gray-300 border-2 hover:border-copper"
                          }`}
                          onClick={() => handleBarberChange(barber.id.toString())}
                        >
                          <CardContent className="p-3 sm:p-4 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 sm:mb-3 overflow-hidden">
                              {barber.imageUrl ? (
                                <img 
                                  src={barber.imageUrl} 
                                  alt={barber.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-copper to-light-sand flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">{barber.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <h4 className="font-medium text-sm sm:text-base">{barber.name}</h4>
                            <p className="text-xs sm:text-sm text-deep-kelp">{barber.title}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="name" className="text-pure-black font-medium mb-2 block text-sm sm:text-base">
                          Име
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Въведи име"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-pure-black font-medium mb-2 block text-sm sm:text-base">
                          Телефон
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+359..."
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-pure-black font-medium mb-2 block text-sm sm:text-base">
                        Имейл
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-pure-black font-medium mb-2 block text-sm sm:text-base">
                        Бележки
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Специални изисквания..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-20 sm:h-24 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Date and Time Selection */}
                <div className="pr-2 sm:pr-0">
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pr-2 sm:pr-0">
                    Избери дата и час
                  </h3>
                  
                  {/* Date Selection */}
                  <div className="mb-4 sm:mb-6 pr-2 sm:pr-0">
                    <Label htmlFor="date" className="text-pure-black font-medium mb-2 block text-sm sm:text-base">
                      Дата
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="text-sm sm:text-base"
                    />
                  </div>
                  
                  {/* Time Slots */}
                  {selectedDate && selectedBarber && (
                    <div className="pr-2 sm:pr-0">
                      <Label className="text-pure-black font-medium mb-2 sm:mb-3 block text-sm sm:text-base">
                        Налични часове за {selectedDate}
                      </Label>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`p-2 sm:p-3 text-sm sm:text-base ${
                                selectedTime === time 
                                  ? "bg-copper text-white" 
                                  : "border-gray-300 hover:bg-copper hover:text-white"
                              } transition-colors`}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Няма налични часове за избраната дата с този барбер. Моля изберете друга дата.
                        </p>
                      )}
                    </div>
                  )}
                  {selectedDate && !selectedBarber && (
                    <p className="text-gray-500 text-sm pr-2 sm:pr-0">
                      Първо изберете барбер за да видите наличните часове.
                    </p>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="lg:col-span-2 mt-6 sm:mt-8 text-center">
                  <Button 
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="w-full sm:w-auto bg-pure-black text-white hover:bg-copper transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg rounded-full px-8 sm:px-12 py-3 sm:py-4"
                  >
                    <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {bookingMutation.isPending ? "Обработва се..." : "Потвърди резервацията"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
