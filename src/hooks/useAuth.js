import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";

const AUTH_KEY = "dcs-admin-session";
const authApi = {
  login: makeFunctionReference("adminAuth:login"),
  logout: makeFunctionReference("adminAuth:logout")
};

export function useAuth() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    } catch (_) {
      return null;
    }
  });
  const loginMutation = useMutation(authApi.login);
  const logoutMutation = useMutation(authApi.logout);

  const login = useCallback(async (email, password) => {
    try {
      const nextSession = await loginMutation({ email, password });
      if (!nextSession.ok) {
        localStorage.removeItem(AUTH_KEY);
        setSession(null);
        return { ok: false, message: nextSession.message || "Invalid admin login." };
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return { ok: true };
    } catch (error) {
      localStorage.removeItem(AUTH_KEY);
      setSession(null);
      return { ok: false, message: error.message || "Invalid admin login." };
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    const token = session?.token;
    if (token) {
      try {
        await logoutMutation({ adminToken: token });
      } catch (_) {
        // Local logout should still complete if the server session is already gone.
      }
    }
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
  }, [logoutMutation, session?.token]);

  return { isAuthed: Boolean(session?.token), token: session?.token || "", login, logout };
}
