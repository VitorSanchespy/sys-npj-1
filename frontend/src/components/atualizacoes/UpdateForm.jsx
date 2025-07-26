import React, { useState, useEffect } from "react";
import { processUpdatesService, fileService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import { getFileUrl } from '../../utils/fileUrl';

function UpdateForm({ processoId, onSuccess }) {
  const { token, user } = useAuthContext();
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [anexoId, setAnexoId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([
    "Despacho",
    "Petição",
    "Audiência",
    "Observação"
  ]);
  const [novoTipo, setNovoTipo] = useState("");
  const [showNewTypeField, setShowNewTypeField] = useState(false);
  const [meusArquivos, setMeusArquivos] = useState([]);
  const [loadingArquivos, setLoadingArquivos] = useState(true);

  useEffect(() => {
    async function fetchArquivos() {
      try {
        setLoadingArquivos(true);
        const data = await fileService.getUserFiles(token, user.id);
        setMeusArquivos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar arquivos:", error);
        setMeusArquivos([]);
        setMsg("Erro ao carregar seus arquivos. Verifique se você tem arquivos enviados.");
      } finally {
        setLoadingArquivos(false);
      }
    }
    if (user?.id && token) {
      fetchArquivos();
    }
  }, [user, token]);

  const handleAddNewType = () => {
    if (novoTipo.trim() && !tipos.includes(novoTipo.trim())) {
      const newTypeValue = novoTipo.trim();
      setTipos([...tipos, newTypeValue]);
      setTipo(newTypeValue);
      setNovoTipo("");
      setShowNewTypeField(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    if (!tipo) {
      setMsg("Selecione ou adicione um tipo de atualização.");
      return;
    }
    if (!descricao.trim()) {
      setMsg("Descrição é obrigatória.");
      return;
    }
    if (!anexoId) {
      setMsg("Selecione um anexo já enviado.");
      return;
    }
    setLoading(true);
    try {
      // Converter para número para garantir compatibilidade
      const anexoIdNumerico = Number(anexoId);
      const arquivoSelecionado = meusArquivos.find(a => a.id === anexoIdNumerico);
      
      if (!arquivoSelecionado) {
        setMsg("Arquivo selecionado não foi encontrado. Verifique se o arquivo ainda existe ou recarregue a página.");
        setLoading(false);
        return;
      }
      await processUpdatesService.createProcessUpdate(token, {
        processo_id: processoId,
        descricao, 
        tipo_atualizacao: tipo,
        arquivos_id: anexoIdNumerico
      });
      setMsg("Atualização cadastrada!");
      setDescricao("");
      setTipo("");
      setAnexoId("");
      setShowNewTypeField(false);
      setNovoTipo("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setMsg(err.message || "Erro ao cadastrar atualização.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Nova Atualização</h4>
      {msg && <div style={{ color: msg.includes('Erro') ? 'red' : 'green', marginBottom: '10px' }}>{msg}</div>}
      
      <div style={{ marginBottom: '15px' }}>
        <label>Tipo:</label>
        <select value={tipo} onChange={e => setTipo(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: '5px' }}>
          <option value="">Selecione</option>
          {tipos.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </select>
        
        {!showNewTypeField && (
          <button 
            type="button" 
            onClick={() => setShowNewTypeField(true)}
            style={{ marginTop: '8px', backgroundColor: '#007bff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Adicionar tipo
          </button>
        )}
        
        {showNewTypeField && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nome do novo tipo"
              value={novoTipo}
              onChange={e => setNovoTipo(e.target.value)}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleAddNewType}
                style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Adicionar
              </button>
              <button 
                type="button" 
                onClick={() => { setShowNewTypeField(false); setNovoTipo(""); }}
                style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Descrição:</label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginTop: '5px', minHeight: '80px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Anexo:</label>
        {loadingArquivos ? (
          <div style={{ marginTop: '5px', color: '#666' }}>Carregando seus arquivos...</div>
        ) : (
          <>
            <select value={anexoId} onChange={e => setAnexoId(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: '5px' }}>
              <option value="">Selecione um arquivo já enviado</option>
              {meusArquivos.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
            {meusArquivos.length === 0 && (
              <div style={{ marginTop: '5px', color: '#dc3545', fontSize: '14px' }}>
                Nenhum arquivo encontrado. <a href="/arquivos" target="_blank" rel="noopener noreferrer">Envie um arquivo primeiro</a>
              </div>
            )}
          </>
        )}
        
        {anexoId && (
          (() => {
            const arquivo = meusArquivos.find(a => a.id === anexoId);
            if (!arquivo) return null;
            const url = getFileUrl(arquivo.caminho);
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '8px', display: 'inline-block', color: '#007bff' }}>
                Visualizar anexo selecionado
              </a>
            );
          })()
        )}
        
        <a href="/arquivos" target="_blank" rel="noopener noreferrer" style={{ marginTop: '8px', display: 'inline-block', color: '#007bff' }}>
          Enviar novo arquivo
        </a>
      </div>
      
      <button type="submit" disabled={loading} style={{ backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}

export default UpdateForm;
