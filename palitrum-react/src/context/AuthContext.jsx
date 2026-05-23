import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, fetchMe } from "../api/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(Boolean(accessToken));

  // ============================
  // FETCH /auth/me
  // ============================
  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchMe()
      .then((u) => {
        setUser(normalizeUser(u));
      })
      .catch((err) => {
        console.error("Ошибка fetchMe:", err);
        // Не вызываем logout(), просто сбрасываем состояние и удаляем токен
        localStorage.removeItem("accessToken");
        setUser(null);
        setAccessToken(null);
        // Не перенаправляем принудительно – пусть пользователь останется на текущей странице
      })
      .finally(() => setLoading(false));
  }, [accessToken]);


  // ============================
  // NORMALIZE USER
  // ============================
  function normalizeUser(u) {
    if (!u) return null;

    const roles = Array.isArray(u.roles)
      ? u.roles.map((r) => String(r).toUpperCase())
      : [];

    const permissions = Array.isArray(u.permissions)
      ? u.permissions.map((p) => String(p).toUpperCase())
      : [];

    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roles,
      permissions,
      raw: u,
    };
  }


  // ============================
  // SIGN IN
  // ============================
  async function signIn(email, password) {
    setLoading(true);

    try {
      console.log("🔵 login() отправка:", { email, password });

      const data = await apiLogin(email, password);

      console.log("🟢 login() ОТВЕТ:", data);

      if (!data?.accessToken) {
        console.log("🔴 НЕТ accessToken в ответе");
        return { ok: false, error: "Backend не вернул accessToken" };
      }

      localStorage.setItem("accessToken", data.accessToken);
      setAccessToken(data.accessToken);

      const userData = data.user || (await fetchMe());

      console.log("🟢 userData после login или me:", userData);

      const normalized = normalizeUser(userData);

      console.log("🟢 normalizeUser(login):", normalized);

      setUser(normalized);

      return { ok: true, user: normalized };
    } catch (e) {
      console.log("🔴 ОШИБКА login():", e);
      return {
        ok: false,
        error: e.response?.data?.error || "Ошибка авторизации",
      };
    } finally {
      setLoading(false);
    }
  }


  function logout() {
    console.log("🔵 logout()");
    localStorage.removeItem("accessToken");
    setUser(null);
    setAccessToken(null);
    navigate("/");
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
