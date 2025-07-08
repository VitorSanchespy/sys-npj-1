import React, { useEffect, useState } from 'react';
import API from '../api';

function PerfilPage() {
  const [user, setUser] = useState({});
  const [nome, setNome] = useState('');

  const getPerfil = async () => {
    const res = await API.get('/auth/profile');
    setUser(res.data);
    setNome(res.data.nome);
  };

  const atualizar = async () => {
    await API.put(`/users/${user.id}`, { nome });
    alert('Atualizado');
  };

  useEffect(() => {
    getPerfil();
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">Meu Perfil</h2>
      <div className="flex flex-col gap-2">
        <label>Nome:</label>
        <input value={nome} onChange={e => setNome(e.target.value)} className="border px-2 py-1" />
        <button onClick={atualizar} className="bg-green-600 text-white px-4 py-1 mt-2">Salvar</button>
      </div>
    </div>
  );
}

export default PerfilPage;
