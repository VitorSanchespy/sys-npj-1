import React from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../auth/LogoutButton";

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/processos">Processos</Link></li>
        <li><Link to="/arquivos">Arquivos</Link></li>
        <li><Link to="/profile">Perfil</Link></li>
        <li>
          <LogoutButton />
        </li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;