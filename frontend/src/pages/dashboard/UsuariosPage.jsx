import React, { useEffect, useState } from 'react';
import API from '../../api';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);

  const fetchUsuarios = async () => {
    const res = await API.get('/users');
    setUsuarios(res.data);
  };

  const toggleAtivo = async (id, ativo) => {
    await API.put(`/users/${id}`, { ativo: !ativo });
    fetchUsuarios();
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">Usuários</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Ativo</th>
            <th className="p-2 border">Ação</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td className="p-2 border">{u.nome}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.ativo ? 'Sim' : 'Não'}</td>
              <td className="p-2 border">
                <button onClick={() => toggleAtivo(u.id, u.ativo)} className="bg-blue-500 text-white px-2 py-1">
                  {u.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosPage;
