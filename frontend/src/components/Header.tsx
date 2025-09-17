import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogIn, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import AuthForms from "./AuthForms";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false); // закрываем меню после поиска
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthDialog(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* --- Лого --- */}
        <Link to="/" className="text-xl font-bold text-primary">
          Моя Удмуртия
        </Link>

        {/* --- Навигация (Desktop) --- */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link
            to="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Главная
          </Link>
          <Link
            to="/attractions"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Достопримечательности
          </Link>
          <Link
            to="/tours"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Экскурсии
          </Link>
        </nav>

        {/* --- Поиск (Desktop) --- */}
        <form
          onSubmit={handleSearch}
          className="hidden md:block flex-1 max-w-md mx-4"
        >
          <div className="relative">
            <Input
              type="search"
              placeholder="Поиск экскурсий..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </form>

        {/* --- Desktop Auth/Profile --- */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Профиль</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="hidden md:flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Вход / Регистрация</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <AuthForms onAuthSuccess={handleAuthSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* --- Mobile Burger --- */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* --- Mobile Dropdown Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-lg"
          >
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                to="/attractions"
                className="text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Достопримечательности
              </Link>
              <Link
                to="/tours"
                className="text-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Экскурсии
              </Link>
            </nav>

            {/* --- Поиск для мобилы --- */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Поиск экскурсий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* --- Auth/Profile --- */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Профиль
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">Вход / Регистрация</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <AuthForms onAuthSuccess={handleAuthSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
