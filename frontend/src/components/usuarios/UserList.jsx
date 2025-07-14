import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function UserList() {
  const { token, user } = useAuthContext();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const data = await apiRequest("/api/usuarios", { token });
        setUsuarios(data);
      } catch {
        setUsuarios([]);
      }
      setLoading(false);
    }
    fetchUsuarios();
  }, [token]);

  if (loading) return <div>Carregando usuários...</div>;

  return (
    <div>
      <h2>Usuários</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Papel</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.ativo ? "Ativo" : "Inativo"}</td>
              <td>
                <Link to={`/usuarios/${u.id}`}>Detalhes</Link>
                {(user.role === "admin" || user.role === "professor") && (
                  <>
                    {" | "}
                    <Link to={`/usuarios/${u.id}/editar`}>Editar</Link>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}