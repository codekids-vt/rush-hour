import { useEffect, useState } from "react";
import { RushHour } from "./RushHour";
import {
  AuthState,
  AuthUser,
  loadAuthState,
  saveAuthState,
  clearAuthState,
} from "../../../../shared/types";

const API_BASE = "http://localhost:3001/api";

export default function RushHourWithAuth() {
  const [auth, setAuth] = useState<AuthState>(() => loadAuthState());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveAuthState(auth);
  }, [auth]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Request failed");
      }

      const data: { token: string; user: AuthUser } = await res.json();
      setAuth({ token: data.token, user: data.user });
      setPassword("");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuth({ user: null, token: null });
    clearAuthState();
  }

  if (!auth.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Rush Hour Login</h1>

        <div className="flex gap-2">
          <button
            className={`px-3 py-1 border ${
              mode === "login" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`px-3 py-1 border ${
              mode === "register" ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <input
          className="border px-2 py-1 w-64"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border px-2 py-1 w-64"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />

        <button
          className="px-4 py-2 bg-green-600 text-white disabled:opacity-50"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
        </button>

        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    );
  }

  // Authenticated: render your existing RushHour, pass token if needed
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div>
          Logged in as <b>{auth.user.username}</b>
        </div>
        <button className="px-3 py-1 border rounded" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Your existing RushHour component */}
      <RushHour token={auth.token} user={auth.user} />
    </div>
  );
}
