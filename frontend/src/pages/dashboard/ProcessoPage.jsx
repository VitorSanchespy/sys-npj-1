import React, { useEffect, useState } from 'react';
import API from '../../api';

function ProcessoPage() {
  const [processos, setProcessos] = useState([]);
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    API.get('/processos').then(res => setProcessos(res.data));
  }, []);

  const handleCreate = async () => {
    await API.post('/processos', { descricao });
    const res = await API.get('/processos');
    setProcessos(res.data);
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Processos</h2>
      <input placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="border px-2 py-1" />
      <button onClick={handleCreate} className="ml-2 bg-green-600 text-white px-4 py-1">Criar</button>
      <ul className="mt-4 space-y-1">
        {processos.map((p, idx) => <li key={idx}>{p.descricao}</li>)}
      </ul>
    </div>
  );
}

export default ProcessoPage;
