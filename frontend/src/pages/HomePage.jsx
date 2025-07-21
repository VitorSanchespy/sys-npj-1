import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(120deg, #1976d2 0%, #42a5f5 100%)",
      color: "#fff",
      fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: 48,
        boxShadow: "0 8px 32px rgba(25, 118, 210, 0.15)",
        textAlign: "center",
        maxWidth: 480
      }}>
        <img src="/favicon.ico" alt="NPJ Logo" style={{ width: 64, marginBottom: 24 }} />
        <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 12 }}>Bem-vindo ao Sistema NPJ</h1>
        <p style={{ fontSize: 20, marginBottom: 32, color: "#e3f2fd" }}>
          Gerencie processos, alunos e professores de forma simples e eficiente.<br />
          Acesse sua conta para começar!
        </p>
        <Link to="/login" style={{
          background: "#fff",
          color: "#1976d2",
          padding: "12px 36px",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 18,
          textDecoration: "none",
          boxShadow: "0 2px 8px #1976d2a0"
        }}>
          Entrar
        </Link>
      </div>
      <footer style={{ marginTop: 64, color: "#e3f2fd", fontSize: 15 }}>
        &copy; {new Date().getFullYear()} Núcleo de Prática Jurídica - UFMT
      </footer>
    </div>
  );
}
