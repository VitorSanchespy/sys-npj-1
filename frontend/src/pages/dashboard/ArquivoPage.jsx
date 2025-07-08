import React, { useState } from 'react';
import API from '../../api';

function ArquivoPage() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('arquivo', file);
    await API.post('/arquivos/upload', formData);
    alert('Arquivo enviado!');
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Upload de Arquivo</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} className="ml-2 bg-blue-600 text-white px-4 py-1">Enviar</button>
    </div>
  );
}

export default ArquivoPage;
