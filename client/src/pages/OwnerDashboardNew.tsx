import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Phone, Mail, User, DollarSign, BarChart3, CalendarDays, LogOut, Trash2, Users, TrendingUp, CheckSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminLogin } from "@/components/AdminLogin";
import { BarberCalendarManager } from "@/components/BarberCalendarManager";
import BarberClientManager from "@/components/BarberClientManager";
import type { LoyaltyCustomer, Barber } from "@shared/schema";

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

interface DashboardStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  monthRevenue: number;
}

export function OwnerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth');
    if (savedAuth) {
      setIsAuthenticated(true);
      setSessionPassword(savedAuth);
    }
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/owner/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingData[]>({
    queryKey: ["/api/owner/calendar"],
    enabled: isAuthenticated,
  });

  const { data: todayBookings, isLoading: todayLoading } = useQuery<BookingData[]>({
    queryKey: ["/api/owner/bookings/today"],
    enabled: isAuthenticated,
  });

  const { data: completedBookings, isLoading: completedLoading } = useQuery({
    queryKey: ["/api/owner/completed-bookings"],
    enabled: isAuthenticated,
  });

  const { data: customerPoints, isLoading: pointsLoading } = useQuery<LoyaltyCustomer[]>({
    queryKey: ["/api/owner/customer-points"],
    enabled: isAuthenticated,
  });

  const { data: barbers } = useQuery<Barber[]>({
    queryKey: ["/api/barbers"],
    enabled: isAuthenticated,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/owner/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/bookings/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/dashboard/stats"] });
      toast({
        title: "Статус обновен",
        description: "Статусът на резервацията беше променен успешно.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
      });
      setSelectedBookingId(null);
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Неуспешна промяна на статуса.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/owner/bookings/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/bookings/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/dashboard/stats"] });
      toast({
        title: "Резервация изтрита",
        description: "Резервацията беше изтрита успешно.",
        className: "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 text-orange-800 shadow-lg",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Неуспешно изтриване на резервацията.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
    },
  });

  const bulkOperationMutation = useMutation({
    mutationFn: async ({ bookingIds, action, status }: { bookingIds: number[]; action: string; status?: string }) => {
      const response = await fetch("/api/owner/bookings/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingIds, action, status }),
      });
      if (!response.ok) throw new Error('Failed to perform bulk operation');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner"] });
      toast({
        title: "Операцията завърши успешно",
        description: `${variables.action === 'delete' ? 'Изтрити' : 'Обновени'} ${data.deletedCount || data.updatedCount} резервации.`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Неуспешна операция.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
    },
  });

  const handleLogin = (password: string) => {
    setIsAuthenticated(true);
    setSessionPassword(password);
    sessionStorage.setItem('adminAuth', password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionPassword(null);
    sessionStorage.removeItem('adminAuth');
    toast({
      title: "Излизане",
      description: "Успешно излязохте от администраторския панел.",
      className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-800 shadow-lg",
    });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('bg-BG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md';
      case 'completed': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Потвърдена';
      case 'completed': return 'Завършена';
      case 'cancelled': return 'Отменена';
      default: return status;
    }
  };

  if (statsLoading || bookingsLoading || todayLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sand-light to-sand-dark/10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-sand-dark mb-4">BLACKSEA BARBER</h1>
            <p className="text-sand-dark/70">Зареждане на администраторския панел...</p>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-sand-dark/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-light to-sand-dark/10">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center py-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-sand-dark mb-2">
              BLACKSEA BARBER
            </h1>
            <p className="text-lg text-sand-dark/70">Администраторски панел</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-sand-dark/20 text-sand-dark hover:bg-sand-dark/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Излез
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Днес</CardTitle>
              <CalendarDays className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.today ?? 0}</div>
              <p className="text-xs text-blue-200">резервации</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Тази седмица</CardTitle>
              <BarChart3 className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.thisWeek ?? 0}</div>
              <p className="text-xs text-green-200">резервации</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Този месец</CardTitle>
              <Calendar className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.thisMonth ?? 0}</div>
              <p className="text-xs text-purple-200">резервации</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Приходи м-ц</CardTitle>
              <DollarSign className="h-5 w-5 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.monthRevenue?.toFixed(2) ?? '0.00'} лв</div>
              <p className="text-xs text-orange-200">завършени услуги</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="barber-calendars" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="today">
              <CalendarDays className="mr-2 h-4 w-4" />
              Днес
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              Предстоящи
            </TabsTrigger>
            <TabsTrigger value="barber-calendars">
              <User className="mr-2 h-4 w-4" />
              Барбери
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="mr-2 h-4 w-4" />
              Клиенти
            </TabsTrigger>
            <TabsTrigger value="completed">
              <TrendingUp className="mr-2 h-4 w-4" />
              Завършени
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="mr-2 h-4 w-4" />
              Точки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="barber-calendars">
            <BarberCalendarManager 
              barbers={barbers || []} 
              onBulkOperation={(bookingIds, action, status) => 
                bulkOperationMutation.mutate({ bookingIds, action, status })
              }
            />
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Клиентски бази на барберите
                </CardTitle>
                <CardDescription>
                  Управление на индивидуалните клиентски бази за всеки барбер
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {barbers?.map((barber) => (
                    <div key={barber.id} className="border-b pb-6 last:border-b-0">
                      <BarberClientManager 
                        barberId={barber.id} 
                        barberName={barber.name}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Днешни резервации
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayBookings && todayBookings.length > 0 ? (
                  <div className="space-y-4">
                    {todayBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{booking.customerName}</h3>
                            <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Услуга: {booking.serviceName}</div>
                          <div>Майстор: {booking.barberName}</div>
                          <div>Час: {formatTime(booking.appointmentDate)}</div>
                          <div>Цена: {booking.servicePrice} лв</div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateStatusMutation.mutate({ id: booking.id, status: value })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Потвърдена</SelectItem>
                              <SelectItem value="completed">Завършена</SelectItem>
                              <SelectItem value="cancelled">Отменена</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBookingMutation.mutate(booking.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Няма резервации за днес</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Предстоящи резервации
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{booking.customerName}</h3>
                            <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Услуга: {booking.serviceName}</div>
                          <div>Майстор: {booking.barberName}</div>
                          <div>Дата: {formatDate(booking.appointmentDate)}</div>
                          <div>Час: {formatTime(booking.appointmentDate)}</div>
                          <div>Цена: {booking.servicePrice} лв</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Няма предстоящи резервации</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Завършени резервации
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedBookings && Array.isArray(completedBookings) && completedBookings.length > 0 ? (
                  <div className="space-y-4">
                    {completedBookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{booking.customerName}</h3>
                            <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Завършена</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Услуга: {booking.serviceName}</div>
                          <div>Майстор: {booking.barberName}</div>
                          <div>Дата: {formatDate(booking.appointmentDate)}</div>
                          <div>Цена: {booking.servicePrice} лв</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Няма завършени резервации</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Лоялни клиенти
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerPoints && Array.isArray(customerPoints) && customerPoints.length > 0 ? (
                  <div className="space-y-4">
                    {(customerPoints as LoyaltyCustomer[]).map((customer: LoyaltyCustomer) => (
                      <div key={customer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{customer.totalPoints || 0}</div>
                            <div className="text-sm text-gray-500">точки • {customer.tier}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Няма лоялни клиенти</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}