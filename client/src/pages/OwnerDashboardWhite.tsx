import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, X, Calendar, Clock, Users, DollarSign, 
  LogOut, BarChart3, CalendarDays, TrendingUp, 
  User, Phone, Mail, CheckSquare, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLogin } from "@/components/AdminLogin";
import BarberClientManager from "@/components/BarberClientManager";
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

interface DashboardStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  monthRevenue: number;
}

export function OwnerDashboardWhite() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'barber'>('dashboard');

  // Authentication check
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth');
    if (savedAuth) {
      setIsAuthenticated(true);
      setSessionPassword(savedAuth);
    }
  }, []);

  // Data fetching
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/owner/dashboard/stats'],
    enabled: isAuthenticated,
  });

  const { data: barbers } = useQuery({
    queryKey: ['/api/barbers'],
    enabled: isAuthenticated,
  });

  const { data: barberBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/owner/barber-bookings', selectedBarber],
    queryFn: async () => {
      if (!selectedBarber) return [];
      const response = await fetch(`/api/owner/barber-bookings?barberId=${selectedBarber}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    enabled: isAuthenticated && selectedBarber !== null,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/owner/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/barber-bookings'] });
      toast({
        title: "Успех",
        description: "Статусът на резервацията е актуализиран.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
      });
    },
  });

  const bulkOperationMutation = useMutation({
    mutationFn: async ({ bookingIds, action, status }: { bookingIds: number[]; action: string; status?: string }) => {
      const response = await fetch('/api/owner/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingIds, action, status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/barber-bookings'] });
      setSelectedBookings([]);
      toast({
        title: "Успех",
        description: "Масовата операция е извършена успешно.",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-800 shadow-lg",
      });
    },
  });

  const handleLogin = (password: string) => {
    setIsAuthenticated(true);
    setSessionPassword(password);
    sessionStorage.setItem('adminAuth', password);
    toast({
      title: "Добре дошли",
      description: "Успешно влязохте в администраторския панел.",
      className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionPassword(null);
    sessionStorage.removeItem('adminAuth');
    toast({
      title: "Излизане",
      description: "Успешно излязохте от администраторския панел.",
      className: "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-800 shadow-lg",
    });
  };

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
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedBookings.length > 0) {
      bulkOperationMutation.mutate({
        bookingIds: selectedBookings,
        action: 'update_status',
        status
      });
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const barbersList = [
    { id: 4, name: "Антонио Каров", title: "Junior Барбер", color: "bg-blue-500" },
    { id: 5, name: "Искрен Минков", title: "Master Барбер", color: "bg-purple-500" },
    { id: 6, name: "Габриела Димитрова", title: "Braider Специалист", color: "bg-pink-500" }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">BLACKSEA BARBER</h1>
            <p className="text-gray-600">Зареждане на администраторския панел...</p>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-0">
      {/* Header with Burger Menu */}
      <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-40 lg:static">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mr-3 text-gray-600 hover:text-gray-900 p-2"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              <h1 className="text-lg font-bold text-gray-900">BLACKSEA BARBER</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 hidden sm:inline">Админ панел</span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-2 py-1"
              >
                <LogOut className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline text-xs">Излез</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto`}>
          <div className="flex flex-col h-full pt-16 lg:pt-4">
            <nav className="flex-1 px-3 pb-4 space-y-1">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                className="w-full justify-start text-left text-sm py-2 px-3"
                onClick={() => {
                  setActiveView('dashboard');
                  setSelectedBarber(null);
                  setIsMobileMenuOpen(false);
                }}
              >
                <BarChart3 className="mr-2 h-3 w-3" />
                Общ преглед
              </Button>
              
              <div className="pt-3">
                <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Барбери
                </h3>
                <div className="space-y-1">
                  {barbersList.map((barber) => (
                    <Button
                      key={barber.id}
                      variant={selectedBarber === barber.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-left text-sm py-2 px-3 h-auto"
                      onClick={() => {
                        setActiveView('barber');
                        setSelectedBarber(barber.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <div className={`mr-2 h-2 w-2 rounded-full ${barber.color} flex-shrink-0`}></div>
                      <div className="text-left">
                        <div className="font-medium text-xs leading-tight">{barber.name}</div>
                        <div className="text-xs text-gray-500 leading-tight">{barber.title}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 w-full overflow-x-hidden">
          <div className="max-w-full mx-auto p-3 lg:p-4">
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Общ преглед</h2>
                  <p className="text-sm text-gray-600">Статистики и общи данни за барбершопа</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                      <CardTitle className="text-xs font-medium text-gray-600">Днес</CardTitle>
                      <CalendarDays className="h-3 w-3 text-blue-600" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="text-lg font-bold text-gray-900">{(stats as DashboardStats)?.today ?? 0}</div>
                      <p className="text-xs text-gray-500">резервации</p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                      <CardTitle className="text-xs font-medium text-gray-600">Тази седмица</CardTitle>
                      <BarChart3 className="h-3 w-3 text-green-600" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="text-lg font-bold text-gray-900">{(stats as DashboardStats)?.thisWeek ?? 0}</div>
                      <p className="text-xs text-gray-500">резервации</p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                      <CardTitle className="text-xs font-medium text-gray-600">Този месец</CardTitle>
                      <Calendar className="h-3 w-3 text-purple-600" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="text-lg font-bold text-gray-900">{(stats as DashboardStats)?.thisMonth ?? 0}</div>
                      <p className="text-xs text-gray-500">резервации</p>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                      <CardTitle className="text-xs font-medium text-gray-600">Приходи м-ц</CardTitle>
                      <DollarSign className="h-3 w-3 text-orange-600" />
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="text-lg font-bold text-gray-900">{(stats as DashboardStats)?.monthRevenue?.toFixed(2) ?? '0.00'} лв</div>
                      <p className="text-xs text-gray-500">завършени услуги</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeView === 'barber' && selectedBarber && (
              <div className="space-y-6">
                {(() => {
                  const barber = barbersList.find(b => b.id === selectedBarber);
                  return (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className={`w-3 h-3 rounded-full mr-2 ${barber?.color}`}></div>
                        <h2 className="text-lg font-bold text-gray-900">{barber?.name}</h2>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{barber?.title}</p>
                    </div>
                  );
                })()}

                <Tabs defaultValue="calendar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-auto p-1">
                    <TabsTrigger value="calendar" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 flex-col sm:flex-row p-1 text-xs">
                      <Calendar className="h-3 w-3 mb-1 sm:mb-0 sm:mr-1" />
                      <span className="text-xs">Календар</span>
                    </TabsTrigger>
                    <TabsTrigger value="clients" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 flex-col sm:flex-row p-1 text-xs">
                      <Users className="h-3 w-3 mb-1 sm:mb-0 sm:mr-1" />
                      <span className="text-xs">Клиенти</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="calendar">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-900">Календар на резервациите</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="text-xs text-gray-600 mb-3">Резервации по дни</div>
                          {barberBookings && Array.isArray(barberBookings) && barberBookings.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {barberBookings.map((booking: BookingData) => (
                                <div key={booking.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="text-xs font-medium text-gray-900">{booking.customerName}</div>
                                      <Badge className={getStatusColor(booking.status)} style={{ fontSize: '9px', padding: '1px 4px' }}>
                                        {getStatusText(booking.status)}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-600">{formatTime(booking.appointmentDate)}</div>
                                  </div>
                                  <div className="text-xs text-gray-500 mb-1">{booking.serviceName} - {booking.servicePrice} лв</div>
                                  <div className="text-xs text-gray-500 mb-2">{formatDate(booking.appointmentDate)}</div>
                                  
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 h-5 flex-1"
                                    >
                                      Потвърди
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 h-5 flex-1"
                                    >
                                      Завърши
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                                      variant="destructive"
                                      className="text-xs px-2 py-1 h-5 flex-1"
                                    >
                                      Отложи
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-6 text-xs">Няма резервации за този барбер</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="clients">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-900">Клиентска база</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <BarberClientManager 
                          barberId={selectedBarber} 
                          barberName={barbersList.find(b => b.id === selectedBarber)?.name || ''}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}