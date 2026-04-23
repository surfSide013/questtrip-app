import { Link, useLocation } from "wouter";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Compass, ChevronDown, LogOut, LayoutDashboard, Shield } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    creator: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    player: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  const roleLabels: Record<string, string> = { admin: "Админ", creator: "Создатель", player: "Игрок" };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* QuestTrip logo — Q с пунктирной стрелкой-маршрутом */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-label="QuestTrip"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Угольный фон-плашка */}
            <rect width="36" height="36" rx="8" fill="hsl(74 78% 58%)" />
            {/* Буква Q — круг + разрыв снизу-справа */}
            <circle cx="16" cy="16" r="7.5" stroke="hsl(0 0% 8%)" strokeWidth="3" fill="none" />
            {/* Хвост Q переходит в пунктирную стрелку */}
            <line x1="21" y1="21" x2="23.5" y2="23.5" stroke="hsl(0 0% 8%)" strokeWidth="3" strokeLinecap="round" />
            {/* Пунктирная стрелка-маршрут от хвоста Q вправо-вниз */}
            <line
              x1="24.5" y1="24.5"
              x2="30" y2="30"
              stroke="hsl(0 0% 8%)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2 2.5"
            />
            {/* Наконечник стрелки */}
            <polyline
              points="26,30 30,30 30,26"
              stroke="hsl(0 0% 8%)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="font-bold text-lg tracking-tight text-foreground">QuestTrip</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link href="/catalog">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
              <Compass className="w-4 h-4" />
              Квесты
            </Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {user.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 hidden sm:flex ${roleColors[user.role]}`}>
                    {roleLabels[user.role]}
                  </Badge>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {(user.role === "creator" || user.role === "admin") && (
                  <DropdownMenuItem onClick={() => navigate("/creator")}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Мои квесты
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4 mr-2" />
                    Панель админа
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Войти</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90">Регистрация</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
