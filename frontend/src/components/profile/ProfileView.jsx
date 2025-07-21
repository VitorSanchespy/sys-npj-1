import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { apiRequest } from "../../api/apiRequest";
import { getFileUrl } from '../../utils/fileUrl';

export default function ProfileView() {
  const { user, token, setUser } = useAuthContext();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "" });
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [arquivos, setArquivos] = useState([]);
  const [loadingArquivos, setLoadingArquivos] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // Removido campo de senhaAtual, não é mais necessário
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaMsg, setSenhaMsg] = useState("");
  const [inativando, setInativando] = useState(false);
  const [inativarMsg, setInativarMsg] = useState("");

  // Troca de senha
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSenhaMsg("");
    try {
      if (!novaSenha || novaSenha.length < 6) {
        setSenhaMsg("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }
      await apiRequest(`/api/usuarios/me/senha`, {
        method: "PUT",
        token,
        body: { senha: novaSenha }
      });
      setSenhaMsg("Senha alterada com sucesso!");
      setShowPasswordForm(false);
      // senhaAtual removido
      setNovaSenha("");
    } catch (err) {
      setSenhaMsg(err.message || "Erro ao alterar senha");
    }
  };

  // Inativar conta
  const handleInativarConta = async () => {
    if (!window.confirm("Tem certeza que deseja inativar sua conta? Essa ação é irreversível!")) return;
    setInativando(true);
    setInativarMsg("");
    try {
      await apiRequest(`/api/usuarios/me`, {
        method: "DELETE",
        token
      });
      setInativarMsg("Conta inativada. Você será deslogado.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setInativarMsg(err.message || "Erro ao inativar conta");
    }
    setInativando(false);
  };

  // Buscar perfil atualizado do backend ao montar
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const perfilData = await apiRequest("/api/usuarios/me", { token });
        setPerfil(perfilData);
        setUser(perfilData); // mantém contexto sincronizado
        setForm({ nome: perfilData.nome, email: perfilData.email });
      } catch (err) {
        setMsg("Erro ao carregar perfil: " + (err.message || ""));
      }
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [token, setUser]);

  // Buscar arquivos enviados pelo usuário
  useEffect(() => {
    const fetchArquivos = async () => {
      if (!perfil?.id || !token) return;
      setLoadingArquivos(true);
      try {
        const data = await apiRequest(`/api/arquivos/usuario/${perfil.id}`, { token });
        setArquivos(Array.isArray(data) ? data : []);
      } catch {
        setArquivos([]);
      }
      setLoadingArquivos(false);
    };
    fetchArquivos();
  }, [perfil?.id, token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    try {
      await apiRequest(`/api/usuarios/me`, {
        method: "PUT",
        body: { ...form, role_id: perfil.role_id },
        token
      });
      setPerfil({ ...perfil, ...form });
      setUser({ ...perfil, ...form });
      setEdit(false);
      setMsg("Perfil atualizado!");
    } catch (err) {
      setMsg(err.message || "Erro ao atualizar perfil");
    }
  };

  if (loading) return <div>Carregando perfil...</div>;
  if (!perfil) return <div>Não foi possível carregar o perfil.</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Meu Perfil</h2>
      {msg && <div className="mb-2 text-green-700">{msg}</div>}
      {/* Bloco de dados e edição */}
      {!edit ? (
        <div className="space-y-2 mb-4">
          <div><span className="font-semibold">Nome:</span> {perfil.nome}</div>
          <div><span className="font-semibold">Email:</span> {perfil.email}</div>
          <div><span className="font-semibold">Tipo:</span> {perfil.role?.nome || perfil.role || '-'} </div>
          <div className="flex gap-2 mt-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => setEdit(true)}>Editar</button>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition" onClick={() => setShowPasswordForm(v => !v)}>Trocar Senha</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={handleInativarConta} disabled={inativando}>Inativar Conta</button>
          </div>
          {inativarMsg && <div className="mt-2 text-red-700">{inativarMsg}</div>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome:</label>
            <input name="nome" value={form.nome} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input name="email" value={form.email} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Salvar</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Formulário de troca de senha */}
      {showPasswordForm && (
        <form onSubmit={handlePasswordChange} className="space-y-2 mb-4 bg-gray-50 p-4 rounded mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha:</label>
            <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required minLength={6} className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition">Salvar Nova Senha</button>
            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition" onClick={() => setShowPasswordForm(false)}>Cancelar</button>
          </div>
          {senhaMsg && <div className="text-green-700 mt-2">{senhaMsg}</div>}
        </form>
      )}

      <hr className="my-6" />
      <h3 className="text-lg font-semibold mb-2">Meus Arquivos Enviados</h3>
      {loadingArquivos ? (
        <div>Carregando arquivos...</div>
      ) : arquivos.length === 0 ? (
        <div className="text-gray-500">Nenhum arquivo enviado.</div>
      ) : (
        <ul className="space-y-2">
          {arquivos.map(arquivo => (
            <li key={arquivo.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
              <span>{arquivo.nome}</span>
              <span className="text-xs text-gray-500">({Math.round(arquivo.tamanho / 1024)} KB)</span>
              <button
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                onClick={() => window.open(getFileUrl(arquivo.caminho), '_blank', 'noopener,noreferrer')}
              >
                Abrir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}