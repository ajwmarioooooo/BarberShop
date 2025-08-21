import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Phone, User, CheckSquare, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BarberClientManager from "./BarberClientManager";
import type { Barber } from "@shared/schema";

interface BookingData {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  appointmentDate: string;
  notes: string;
  status: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number;
  barberName: string;
  createdAt: string;
}

interface BarberCalendarManagerProps {
  barbers: Barber[];
  onBulkOperation: (bookingIds: number[], action: string, status?: string) => void;
}

export function BarberCalendarManager({ barbers, onBulkOperation }: BarberCalendarManagerProps) {
  const { toast } = useToast();
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // Fetch barber-specific bookings
  const { data: barberBookings, isLoading } = useQuery<BookingData[]>({
    queryKey: ["/api/owner/barber-bookings", selectedBarber, startDate, endDate],
    queryFn: () => {
      if (!selectedBarber) return Promise.resolve([]);
      return fetch(`/api/owner/barber-bookings?barberId=${selectedBarber}&startDate=${startDate}&endDate=${endDate}`)
        .then(res => res.json());
    },
    enabled: !!selectedBarber,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300"
    };
    
    const labels = {
      pending: "Чакаща",
      confirmed: "Потвърдена",
      completed: "Завършена",
      cancelled: "Отказана"
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && barberBookings) {
      setSelectedBookings(new Set(barberBookings.map(b => b.id)));
    } else {
      setSelectedBookings(new Set());
    }
  };

  const handleSelectBooking = (bookingId: number, checked: boolean) => {
    const newSelected = new Set(selectedBookings);
    if (checked) {
      newSelected.add(bookingId);
    } else {
      newSelected.delete(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleBulkOperation = () => {
    if (selectedBookings.size === 0) {
      toast({
        title: "Няма избрани резервации",
        description: "Моля изберете поне една резервация.",
        className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 text-yellow-800 shadow-lg",
      });
      return;
    }

    if (!bulkAction) {
      toast({
        title: "Няма избрано действие",
        description: "Моля изберете действие.",
        className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 text-yellow-800 shadow-lg",
      });
      return;
    }

    if (bulkAction === "updateStatus" && !bulkStatus) {
      toast({
        title: "Няма избран статус",
        description: "Моля изберете статус за обновяване.",
        className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 text-yellow-800 shadow-lg",
      });
      return;
    }

    onBulkOperation(Array.from(selectedBookings), bulkAction, bulkStatus);
    setSelectedBookings(new Set());
    setBulkAction("");
    setBulkStatus("");
  };

  const groupBookingsByDate = (bookings: BookingData[]) => {
    const grouped: { [date: string]: BookingData[] } = {};
    bookings.forEach(booking => {
      const date = booking.appointmentDate.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });
    
    // Sort dates
    const sortedDates = Object.keys(grouped).sort();
    const result: { [date: string]: BookingData[] } = {};
    sortedDates.forEach(date => {
      result[date] = grouped[date].sort((a, b) => 
        new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
      );
    });
    
    return result;
  };

  if (!barbers || barbers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Календари на барберите
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Зареждане на барберите...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Календари на барберите
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Барбер</label>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете барбер" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id.toString()}>
                      {barber.name} - {barber.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">От дата</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">До дата</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedBarber && barberBookings && barberBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Групови операции
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedBookings.size === barberBookings.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">
                  Избери всички ({selectedBookings.size} избрани)
                </label>
              </div>
              
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Изберете действие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updateStatus">Промени статус</SelectItem>
                  <SelectItem value="delete">Изтрий резервации</SelectItem>
                </SelectContent>
              </Select>

              {bulkAction === "updateStatus" && (
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Изберете статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Потвърдена</SelectItem>
                    <SelectItem value="completed">Завършена</SelectItem>
                    <SelectItem value="cancelled">Отказана</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={handleBulkOperation}
                disabled={selectedBookings.size === 0}
                className="bg-copper hover:bg-copper/90"
              >
                {bulkAction === "delete" ? <Trash2 className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                Изпълни
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Display */}
      {selectedBarber && (
        <Card>
          <CardHeader>
            <CardTitle>
              Резервации за {barbers.find(b => b.id.toString() === selectedBarber)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500">Зареждане...</p>
            ) : !barberBookings || barberBookings.length === 0 ? (
              <p className="text-gray-500">Няма резервации за избрания период.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupBookingsByDate(barberBookings)).map(([date, bookings]) => (
                  <div key={date}>
                    <h3 className="font-semibold text-lg mb-3 text-copper">
                      {formatDate(date + 'T00:00:00')}
                    </h3>
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={selectedBookings.has(booking.id)}
                            onCheckedChange={(checked) => 
                              handleSelectBooking(booking.id, checked as boolean)
                            }
                          />
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-copper" />
                                <span className="font-medium">{formatTime(booking.appointmentDate)}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {booking.serviceName} - {booking.servicePrice} лв
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-copper" />
                                <span className="font-medium">{booking.customerName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {booking.customerPhone}
                              </div>
                            </div>
                            
                            <div>
                              {getStatusBadge(booking.status)}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              {booking.notes && (
                                <div className="truncate" title={booking.notes}>
                                  Бележки: {booking.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedBarber && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Моля изберете барбер за да видите календара.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}