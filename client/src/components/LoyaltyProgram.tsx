import { useState, useRef, useEffect } from "react";
import { Star, Gift, Crown, UserPlus, Phone, User, Mail, Award, History, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LoyaltyCustomer, LoyaltyReward, PointTransaction } from "@shared/schema";

export default function LoyaltyProgram() {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isLookupDialogOpen, setIsLookupDialogOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [customerData, setCustomerData] = useState<LoyaltyCustomer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch rewards
  const { data: rewards = [] } = useQuery<LoyaltyReward[]>({
    queryKey: ["/api/loyalty/rewards"],
  });

  // Fetch customer transactions when customer is loaded
  const { data: transactions = [] } = useQuery<PointTransaction[]>({
    queryKey: ["/api/loyalty/transactions", customerData?.id],
    enabled: !!customerData?.id,
  });

  // Join loyalty program mutation
  const joinMutation = useMutation({
    mutationFn: async (data: { phone: string; name: string; email?: string }): Promise<LoyaltyCustomer> => {
      const response = await apiRequest("POST", "/api/loyalty/customer", data);
      return response as unknown as LoyaltyCustomer;
    },
    onSuccess: (customer: LoyaltyCustomer) => {
      setCustomerData(customer);
      setIsJoinDialogOpen(false);
      toast({
        title: "Добре дошли!",
        description: "Успешно се регистрирахте в програмата за лоялност!",
        className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-800 shadow-lg",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Възникна проблем при регистрацията. Опитайте отново.",
        className: "bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 text-red-800 shadow-lg",
      });
    },
  });

  // Customer lookup mutation
  const lookupMutation = useMutation({
    mutationFn: async (phone: string): Promise<LoyaltyCustomer> => {
      const response = await fetch(`/api/loyalty/customer/${encodeURIComponent(phone)}`);
      if (!response.ok) {
        throw new Error('Customer not found');
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    },
    onSuccess: (customer: LoyaltyCustomer) => {
      console.log('Customer lookup successful:', customer);
      console.log('Total points:', customer.totalPoints);
      setCustomerData(customer);
      setIsLookupDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/transactions", customer.id] });
      toast({
        title: "Намерен клиент!",
        description: `Добре дошли отново, ${customer.name || 'приятелю'}! Имате ${customer.totalPoints || 0} точки.`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 shadow-lg",
      });
    },
    onError: () => {
      toast({
        title: "Не е намерен",
        description: "Клиент с този телефон не е намерен в системата.",
        className: "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 text-yellow-800 shadow-lg",
      });
    },
  });

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    joinMutation.mutate({
      phone: formData.get("phone") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string || undefined,
    });
  };

  const handleLookup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lookupPhone.trim()) {
      lookupMutation.mutate(lookupPhone.trim());
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP": return "bg-purple-500";
      case "Gold": return "bg-yellow-500";
      case "Silver": return "bg-gray-400";
      default: return "bg-amber-600";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "VIP": return <Crown className="h-4 w-4" />;
      case "Gold": return <Award className="h-4 w-4" />;
      case "Silver": return <Star className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  return (
    <section className="py-20 bg-deep-kelp text-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6">
            Програма за лоялност
          </h2>
          <div className="w-24 h-0.5 bg-copper mx-auto mb-8"></div>
          <p className="text-xl text-light-sand mb-8 leading-relaxed">
            Натрупвай точки за всяко посещение и получавай награди
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-copper text-white hover:bg-light-sand hover:text-deep-kelp transition-all duration-300 font-semibold text-lg shadow-lg rounded-full px-8 py-4">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Присъедини се
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white text-deep-kelp">
                <DialogHeader>
                  <DialogTitle>Присъединяване към програмата</DialogTitle>
                  <DialogDescription>
                    Въведете данните си за да се присъедините към програмата за лоялност
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="0888123456" />
                  </div>
                  <div>
                    <Label htmlFor="name">Име *</Label>
                    <Input id="name" name="name" required placeholder="Вашето име" />
                  </div>
                  <div>
                    <Label htmlFor="email">Имейл</Label>
                    <Input id="email" name="email" type="email" placeholder="email@example.com" />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-copper hover:bg-copper/90" 
                    disabled={joinMutation.isPending}
                  >
                    {joinMutation.isPending ? "Регистрация..." : "Регистрирай се"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isLookupDialogOpen} onOpenChange={setIsLookupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-copper text-copper hover:bg-copper hover:text-white transition-all duration-300 font-semibold text-lg rounded-full px-8 py-4">
                  <Phone className="mr-2 h-5 w-5" />
                  Проверете точките си
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white text-deep-kelp">
                <DialogHeader>
                  <DialogTitle>Проверете точките си</DialogTitle>
                  <DialogDescription>
                    Въведете телефонния си номер за да видите точките и наградите си
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLookup} className="space-y-4">
                  <div>
                    <Label htmlFor="lookup-phone">Телефон</Label>
                    <Input 
                      id="lookup-phone" 
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                      type="tel" 
                      required 
                      placeholder="0888123456" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-copper hover:bg-copper/90" 
                    disabled={lookupMutation.isPending}
                  >
                    {lookupMutation.isPending ? "Търсене..." : "Проверете"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Customer Dashboard */}
        {customerData && (
          <div className="max-w-6xl mx-auto mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-copper/30 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <User className="h-6 w-6" />
                      {customerData.name}
                    </CardTitle>
                    <CardDescription className="text-light-sand">
                      {customerData.phone} • Член от {customerData.joinedAt ? new Date(customerData.joinedAt).toLocaleDateString('bg-BG') : ''}
                    </CardDescription>
                  </div>
                  <Badge className={`${getTierColor(customerData.tier || 'Bronze')} text-white flex items-center gap-1`}>
                    {getTierIcon(customerData.tier || 'Bronze')}
                    {customerData.tier || 'Bronze'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-copper mb-2">
                      {customerData.totalPoints ?? 0}
                    </div>
                    <div className="text-light-sand">Общо точки</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-copper mb-2">
                      {(customerData.totalPoints ?? 0) - (customerData.spentPoints ?? 0)}
                    </div>
                    <div className="text-light-sand">Налични точки</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-copper mb-2">
                      {customerData.spentPoints || 0}
                    </div>
                    <div className="text-light-sand">Изразходени точки</div>
                  </div>
                </div>

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Последни транзакции
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                          <div>
                            <div className="font-medium">{transaction.reason}</div>
                            <div className="text-sm text-light-sand">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('bg-BG') : ''}
                            </div>
                          </div>
                          <div className={`font-bold ${transaction.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* How it Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-copper rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-2xl text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Натрупвай точки</h3>
            <p className="text-light-sand">1 лв = 1 точка за всяка услуга</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-copper rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="text-2xl text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Получавай награди</h3>
            <p className="text-light-sand">Обменяй точки за отстъпки и услуги</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-copper rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="text-2xl text-white" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">VIP статус</h3>
            <p className="text-light-sand">Специални оферти и приоритет</p>
          </div>
        </div>

        {/* Available Rewards */}
        {rewards.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <Gift className="h-6 w-6" />
              Налични награди
            </h3>
            
            {isMobile ? (
              <div className="relative">
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {rewards.map((reward) => (
                    <Card key={reward.id} className="bg-white/10 backdrop-blur-sm border-copper/30 text-white min-w-[280px] snap-start flex-shrink-0">
                      <CardHeader>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <CardDescription className="text-light-sand">
                          {reward.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <Badge className="bg-copper text-white">
                            {reward.pointsCost} точки
                          </Badge>
                          <Badge variant="outline" className="border-copper text-copper">
                            {reward.minTier}+
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Mobile scroll indicators */}
                <div className="flex justify-center mt-4 gap-2">
                  {rewards.map((_, index) => (
                    <div 
                      key={index}
                      className="w-2 h-2 rounded-full bg-copper/30"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="bg-white/10 backdrop-blur-sm border-copper/30 text-white">
                    <CardHeader>
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <CardDescription className="text-light-sand">
                        {reward.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-copper text-white">
                          {reward.pointsCost} точки
                        </Badge>
                        <Badge variant="outline" className="border-copper text-copper">
                          {reward.minTier}+
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
