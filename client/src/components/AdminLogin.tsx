import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple password check - in production this should be more secure
    const adminPassword = "blacksea2025"; // You can change this to any password you want

    if (password === adminPassword) {
      onLogin(password);
      toast({
        title: "Успешен вход",
        description: "Добре дошли в администраторския панел.",
      });
    } else {
      toast({
        title: "Грешка",
        description: "Неправилна парола. Моля опитайте отново.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-light to-sand-dark/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-sand-dark/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-sand-dark/10 rounded-full">
              <Lock className="h-8 w-8 text-sand-dark" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-sand-dark">
            BLACKSEA BARBER
          </CardTitle>
          <CardDescription>
            Администраторски панел
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sand-dark font-medium">
                Парола
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Въведете парола"
                  className="pr-10 border-sand-dark/20 focus:border-sand-dark"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-sand-dark/60" />
                  ) : (
                    <Eye className="h-4 w-4 text-sand-dark/60" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full bg-sand-dark hover:bg-sand-dark/90 text-white"
            >
              {isLoading ? "Влизане..." : "Влез"}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-sand-dark/20">
            <p className="text-xs text-center text-sand-dark/60">
              Само за упълномощени потребители
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}