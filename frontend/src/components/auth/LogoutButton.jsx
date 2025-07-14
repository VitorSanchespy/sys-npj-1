import React from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuthContext();
  return (
    <button onClick={logout}>Sair</button>
  );
}