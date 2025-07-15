import React, { useState, useEffect } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";

export default function CreateProcessModal({ onCreated }) {
  const { token } = useAuthContext();
  const [show, setShow] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    numero_processo: "",
    descricao: "",
    status: "Aberto",
    tipo_processo: "",
    idusuario_responsavel: "",
    data_encerramento: "",
    observacoes: ""
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (show) {
      // Busca todos usuários para o select do responsável
      apiRequest("/api/usuarios", { token })
        .then(data => setUsuarios(data))
        .catch(() => setUsuarios([]));
    }
  }, [show, token]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      // Envia para o backend
      await apiRequest("/api/processos", {
        token,
        method: "POST",
        body: form
      });
      setShow(false);
      setForm({
        numero_processo: "",
        descricao: "",
        status: "Aberto",
        tipo_processo: "",
        idusuario_responsavel: "",
        data_encerramento: "",
        observacoes: ""
      });
      if (onCreated) onCreated();
    } catch (err) {
      setErro(err?.message || "Erro ao criar processo");
    }
    setLoading(false);
  }

  return (
    <div>
      <button onClick={() => setShow(true)}>Criar Processo</button>
      {show && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Novo Processo</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Número do Processo*:
                <input
                  type="text"
                  name="numero_processo"
                  value={form.numero_processo}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Descrição*:
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Status*:
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Aberto">Aberto</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Suspenso">Suspenso</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </label>
              <label>
                Tipo do Processo*:
                <input
                  type="text"
                  name="tipo_processo"
                  value={form.tipo_processo}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Responsável*:
                <select
                  name="idusuario_responsavel"
                  value={form.idusuario_responsavel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.email})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Data de Encerramento:
                <input
                  type="datetime-local"
                  name="data_encerramento"
                  value={form.data_encerramento}
                  onChange={handleChange}
                />
              </label>
              <label>
                Observações:
                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                />
              </label>
              {erro && <div className="erro">{erro}</div>}
              <button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Processo"}
              </button>
              <button type="button" onClick={() => setShow(false)} disabled={loading}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
      {/* CSS simples para modal */}
      <style>{`
        .modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;
        }
        .modal {
          background: #fff; padding: 2rem; border-radius: 8px; max-width: 420px; width: 100%;
        }
        .modal label { display: block; margin-bottom: 10px; }
        .modal input, .modal textarea, .modal select { width: 100%; margin-top: 2px; margin-bottom: 8px; }
        .erro { color: red; margin-bottom: 10px; }
        .modal button { margin-right: 0.5rem; }
      `}</style>
    </div>
  );
}