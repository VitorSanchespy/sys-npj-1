import React, { useState } from 'react';
import API from '../../api';

function ResetPasswordPage() {
  const [email, setEmail] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/reset-password', { email });
      alert('Email de redefinição enviado!');
    } catch {
      alert('Erro ao enviar email.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl mb-4">Redefinir Senha</h2>
      <form onSubmit={handleReset} className="flex flex-col gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border px-4 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">Enviar</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
