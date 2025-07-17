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

  // Buscar perfil atualizado do backend ao montar
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const perfilData = await apiRequest("/auth/perfil", { token });
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
      await apiRequest(`/api/usuarios/${perfil.id}`, {
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
    <div>
      <h2>Meu Perfil</h2>
      {msg && <div>{msg}</div>}
      {!edit ? (
        <div>
          <div><b>Nome:</b> {perfil.nome}</div>
          <div><b>Email:</b> {perfil.email}</div>
          <div><b>Tipo:</b> {perfil.role}</div>
          <button onClick={() => setEdit(true)}>Editar</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nome:</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} required />
          </div>
          <button type="submit">Salvar</button>
          <button type="button" onClick={() => setEdit(false)}>Cancelar</button>
        </form>
      )}

      <hr />
      <h3>Meus Arquivos Enviados</h3>
      {loadingArquivos ? (
        <div>Carregando arquivos...</div>
      ) : arquivos.length === 0 ? (
        <div>Nenhum arquivo enviado.</div>
      ) : (
        <ul>
          {arquivos.map(arquivo => (
            <li key={arquivo.id}>
              <span>{arquivo.nome}</span>
              <small> ({Math.round(arquivo.tamanho / 1024)} KB)</small>
              <button
                style={{ marginLeft: 8 }}
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