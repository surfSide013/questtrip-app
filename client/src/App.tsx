import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { createContext, useContext, useState, useEffect } from "react";
import type { AuthUser } from "@/lib/auth";

// Pages
import HomePage from "@/pages/home";
import CatalogPage from "@/pages/catalog";
import QuestPage from "@/pages/quest";
import PlayPage from "@/pages/play";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import CreatorPage from "@/pages/creator";
import QuestEditorPage from "@/pages/quest-editor";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

// ─── Auth Context ──────────────────────────────────────────────────────────
interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser | null, token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthCtx>({
  user: null, token: null,
  setAuth: () => {}, logout: () => {},
});

export function useAuth() { return useContext(AuthContext); }

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const setAuth = (u: AuthUser | null, t: string | null) => {
    setUser(u);
    setToken(t);
  };
  const logout = () => { setUser(null); setToken(null); };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, token, setAuth, logout }}>
        <div className="dark min-h-screen bg-background text-foreground">
          <Router hook={useHashLocation}>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/catalog" component={CatalogPage} />
              <Route path="/quest/:id" component={QuestPage} />
              <Route path="/play/:id" component={PlayPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/creator" component={CreatorPage} />
              <Route path="/creator/edit/:id" component={QuestEditorPage} />
              <Route path="/creator/new" component={QuestEditorPage} />
              <Route path="/admin" component={AdminPage} />
              <Route component={NotFound} />
            </Switch>
          </Router>
          <Toaster />
        </div>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
