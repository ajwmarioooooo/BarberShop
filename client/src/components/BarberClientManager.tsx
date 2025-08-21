import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Phone, Mail, Calendar, Edit, Trash2, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BarberClient } from "@shared/schema";

interface BarberClientManagerProps {
  barberId: number;
  barberName: string;
}

export default function BarberClientManager({ barberId, barberName }: BarberClientManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<BarberClient | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  // Fetch barber's clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/barbers", barberId, "clients"],
    queryFn: async () => {
      const response = await fetch(`/api/barbers/${barberId}/clients`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json() as Promise<BarberClient[]>;
    },
  });

  // Add new client mutation
  const addClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      return apiRequest("POST", `/api/barbers/${barberId}/clients`, clientData);
    },
    onSuccess: () => {
      toast({
        title: "Клиентът е добавен!",
        description: "Успешно добавихте нов клиент в базата данни.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/barbers", barberId, "clients"] });
      setIsAddingClient(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Грешка",
        description: error.message || "Неуспешно добавяне на клиент.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
    },
  });

  const resetForm = () => {
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientNotes("");
  };

  const handleAddClient = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      toast({
        title: "Грешка",
        description: "Моля въведете име и телефонен номер.",
        className: "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 text-yellow-800 shadow-lg",
      });
      return;
    }

    addClientMutation.mutate({
      name: clientName.trim(),
      phone: clientPhone.trim(),
      email: clientEmail.trim() || null,
      notes: clientNotes.trim() || null,
    });
  };

  const formatDate = (date: string | Date | null) => {
    if (!date || date === 'null' || date === '' || new Date(date).toString() === 'Invalid Date') {
      return "Няма данни";
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Няма данни";
    }
    return parsedDate.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Клиенти на {barberName}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Клиенти на {barberName}</h3>
          <Badge variant="secondary" className="ml-2 text-xs px-2 py-1">
            {(clients as BarberClient[]).length} клиента
          </Badge>
        </div>
        <Button 
          onClick={() => setIsAddingClient(true)}
          className="bg-primary hover:bg-primary/90 text-xs px-2 py-1 h-6"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Добави клиент
        </Button>
      </div>

      {(clients as BarberClient[]).length === 0 ? (
        <Card className="p-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Няма клиенти</h3>
          <p className="text-gray-500 mb-4">
            Този барбер все още няма клиенти в базата данни.
          </p>
          <Button onClick={() => setIsAddingClient(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добави първия клиент
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          {(clients as BarberClient[]).map((client: BarberClient) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900">{client.name}</h4>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                  
                  {client.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>Последно: {formatDate(client.lastVisit)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className="text-xs px-2 py-0" style={{ fontSize: '10px' }}>
                      {client.totalVisits || 0} посещения
                    </Badge>
                    <span className="text-xs text-gray-500">
                      От {formatDate(client.createdAt)}
                    </span>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {client.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
        <DialogContent className="sm:max-w-[425px] dialog-content">
          <DialogHeader>
            <DialogTitle>Добави нов клиент за {barberName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Име *</Label>
              <Input
                id="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Въведете име на клиента"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Въведете телефонен номер"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Имейл</Label>
              <Input
                id="email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Въведете имейл (по избор)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Бележки</Label>
              <Textarea
                id="notes"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Лични бележки за клиента (по избор)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddingClient(false);
                resetForm();
              }}
            >
              Отказ
            </Button>
            <Button 
              onClick={handleAddClient}
              disabled={addClientMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {addClientMutation.isPending ? "Добавяне..." : "Добави клиент"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}