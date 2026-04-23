// Auth state managed in React context — no localStorage (blocked in sandbox)
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: "player" | "creator" | "admin";
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}
