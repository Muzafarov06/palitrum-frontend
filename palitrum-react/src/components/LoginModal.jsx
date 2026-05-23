import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/LoginModal.css";
import { getDashboardRoute } from "./utils";

export default function LoginModal({ isOpen, onClose }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await signIn(email, password);
    setBusy(false);

    if (!res.ok) {
      setError(res.error || "Ошибка входа");
    } else {
      onClose();
      const route = getDashboardRoute(res.user);
      navigate(route, { replace: true });
    }
  };
  // Делаем функцию глобальной, чтобы вызвать из DevTools
  window.login = async (email, password) => {
      const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);
      return data;
  };


  return (
    <div className="modal-overlay items-center">
      <div className="login-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="modal-title">Вход</h2>

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@example.com"
          />

          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Введите пароль"
          />

          {error && <div className="error">{String(error)}</div>}

          <button type="submit" disabled={busy} className="login-btn">
            {busy ? "Входим..." : "Войти"}
          </button>

          <div className="forgot-wrapper">
            <button
              type="button"
              className="forgot-btn"
              onClick={() => alert("Функция восстановления пароля еще не подключена")}
            >
              Забыли пароль?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
