import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/api/apiRequest";
import { getUserRole } from "../../hooks/useApi";
import { tabelaAuxiliarService, processService } from "../../api/services";
import { toastAudit } from "../../services/toastSystemAudit";
import { requestCache } from "@/utils/requestCache";
import CampoAuxiliarComControle from "@/components/common/CampoAuxiliarComControle";
import { 
  validateProcessForm, 
  showValidationErrors, 
  validateField, 
  applyFieldMask,
  getInitialProcessFormData 
} from "../../utils/processValidation";

export default function ProcessEditPage() {
  const { id } = useParams();
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [fases, setFases] = useState([]);
  const [diligencias, setDiligencias] = useState([]);
  const [localTramitacoes, setLocalTramitacoes] = useState([]);
  const [form, setForm] = useState(getInitialProcessFormData());
  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const queryClient = useQueryClient();

  // Validação em tempo real de campo individual
  const handleFieldBlur = (fieldName, value) => {
    const error = validateField(fieldName, value, form);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar dados do processo
        const proc = await apiRequest(`/api/processos/${id}/detalhes`, { token });
        
        // Busca usuários conforme o papel
        let url = "/api/usuarios";
        if (getUserRole(user) === "Professor") url = "/api/usuarios/alunos";
        const usuariosData = await apiRequest(url, { token });
        setUsuarios(usuariosData);

        // Busca dados auxiliares
        const [materiasRes, fasesRes, diligenciasRes, localTramitacoesRes] = await Promise.all([
          tabelaAuxiliarService.getMateriaAssunto(token),
          tabelaAuxiliarService.getFase(token),
          tabelaAuxiliarService.getDiligencia(token),
          tabelaAuxiliarService.getLocalTramitacao(token),
        ]);

        setMaterias(Array.isArray(materiasRes) ? materiasRes : []);
        setFases(Array.isArray(fasesRes) ? fasesRes : []);
        setDiligencias(Array.isArray(diligenciasRes) ? diligenciasRes : []);
        setLocalTramitacoes(Array.isArray(localTramitacoesRes) ? localTramitacoesRes : []);

        // Preencher formulário com dados do processo
        setForm({
          numero_processo: proc.numero_processo || '',
          titulo: proc.titulo || '',
          descricao: proc.descricao || '',
          status: proc.status || 'Em andamento',
          tipo_processo: proc.tipo_processo || '',
          idusuario_responsavel: proc.usuario_responsavel?.id || '',
          data_encerramento: proc.data_encerramento ? new Date(proc.data_encerramento).toISOString().slice(0, 16) : '',
          observacoes: proc.observacoes || '',
          sistema: proc.sistema || 'Físico',
          materia_assunto_id: proc.materiaAssunto?.id || '',
          fase_id: proc.fase?.id || '',
          diligencia_id: proc.diligencia?.id || '',
          num_processo_sei: proc.num_processo_sei || '',
          assistido: proc.assistido || '',
          contato_assistido: proc.contato_assistido || '',
          local_tramitacao_id: proc.localTramitacao?.id || ''
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setUsuarios([]);
        setMaterias([]);
        setFases([]);
        setDiligencias([]);
        setLocalTramitacoes([]);
        toastAudit.error('Erro ao carregar dados do processo');
      }
      setLoading(false);
    }
    
    fetchData();
  }, [id, token, user]);

  function handleChange(e) {
    const { name, value } = e.target;
    
    // Aplicar máscara se necessário
    const maskedValue = applyFieldMask(name, value);
    
    setForm(prev => ({ ...prev, [name]: maskedValue }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validação completa do formulário
    const validation = validateProcessForm(form, true);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      showValidationErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    try {
      // Atualizar processo
      await processService.updateProcess(token, id, form);
      
      toastAudit.process.updateSuccess(form.titulo || form.numero_processo);
      
      // Limpa o cache de forma mais agressiva
      requestCache.clear(`GET:/api/processos/${id}/detalhes:`);
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      requestCache.clear(`GET:/api/processos:`);
      
      // Invalida o cache do React Query
      queryClient.invalidateQueries(['processo', id]);
      queryClient.invalidateQueries(['processos']);
      
      navigate(`/processos/${id}`, { state: { updated: Date.now() } });
    } catch (err) {
      toastAudit.process.updateError(err?.message || 'Erro inesperado');
    }
    setLoading(false);
  }

  if (loading) return <div>Carregando dados do processo...</div>;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 8,
          maxWidth: 700,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Editar Processo</h2>
          <button 
            onClick={() => navigate(`/processos/${id}`)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              padding: 5
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {/* Campos principais */}
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Número do Processo*:
            </label>
            <input
              type="text"
              name="numero_processo"
              value={form.numero_processo}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('numero_processo', e.target.value)}
              required
              placeholder="Ex: 0001234-56.2024.8.07.0001"
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.numero_processo ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4,
                backgroundColor: fieldErrors.numero_processo ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.numero_processo && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.numero_processo}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Título*:
            </label>
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('titulo', e.target.value)}
              required
              placeholder="Título do processo"
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.titulo ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4,
                backgroundColor: fieldErrors.titulo ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.titulo && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.titulo}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Número/Processo/SEI:
            </label>
            <input
              type="text"
              name="num_processo_sei"
              value={form.num_processo_sei}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('num_processo_sei', e.target.value)}
              placeholder="Ex: SEI-23085.012345/2025-67"
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.num_processo_sei ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4,
                backgroundColor: fieldErrors.num_processo_sei ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.num_processo_sei && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.num_processo_sei}
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Descrição*:
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('descricao', e.target.value)}
              required
              rows={3}
              placeholder="Descrição detalhada do processo"
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.descricao ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4, 
                resize: 'vertical',
                backgroundColor: fieldErrors.descricao ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.descricao && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.descricao}
              </div>
            )}
          </div>

          {/* Informações do Assistido */}
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Assistido:
            </label>
            <input
              type="text"
              name="assistido"
              value={form.assistido}
              onChange={handleChange}
              placeholder="Nome do assistido"
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Contato do Assistido:
            </label>
            <input
              type="text"
              name="contato_assistido"
              value={form.contato_assistido}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('contato_assistido', e.target.value)}
              placeholder="(11) 99999-9999 ou email@exemplo.com"
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.contato_assistido ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4,
                backgroundColor: fieldErrors.contato_assistido ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.contato_assistido && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.contato_assistido}
              </div>
            )}
          </div>
          
          {/* Campos de status e classificação */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Status*:
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
              >
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Sistema*:
              </label>
              <select
                name="sistema"
                value={form.sistema}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
              >
                <option value="Físico">Físico</option>
                <option value="PEA">PEA</option>
                <option value="PJE">PJE</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Tipo do Processo*:
            </label>
            <input
              type="text"
              name="tipo_processo"
              value={form.tipo_processo}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('tipo_processo', e.target.value)}
              placeholder="Ex: Cível, Criminal, Trabalhista"
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.tipo_processo ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4,
                backgroundColor: fieldErrors.tipo_processo ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.tipo_processo && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.tipo_processo}
              </div>
            )}
          </div>

          {/* Campos auxiliares */}
          <CampoAuxiliarComControle
            type="materia"
            label="Matéria/Assunto"
            value={form.materia_assunto_id}
            onChange={value => setForm(f => ({ ...f, materia_assunto_id: value }))}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <CampoAuxiliarComControle
              type="fase"
              label="Fase"
              value={form.fase_id}
              onChange={value => setForm(f => ({ ...f, fase_id: value }))}
              required
            />

            <CampoAuxiliarComControle
              type="diligencia"
              label="Diligência"
              value={form.diligencia_id}
              onChange={value => setForm(f => ({ ...f, diligencia_id: value }))}
              required
            />
          </div>

          <CampoAuxiliarComControle
            type="local_tramitacao"
            label="Local de Tramitação"
            value={form.local_tramitacao_id}
            onChange={value => setForm(f => ({ ...f, local_tramitacao_id: value }))}
            required
          />
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Responsável:
            </label>
            <select
              name="idusuario_responsavel"
              value={form.idusuario_responsavel}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
            >
              <option value="">Selecione um responsável</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Data de Encerramento:
            </label>
            <input
              type="datetime-local"
              name="data_encerramento"
              value={form.data_encerramento}
              onChange={handleChange}
              onBlur={(e) => handleFieldBlur('data_encerramento', e.target.value)}
              style={{ 
                width: '100%', 
                padding: 8, 
                border: `1px solid ${fieldErrors.data_encerramento ? '#dc3545' : '#ddd'}`, 
                borderRadius: 4,
                backgroundColor: fieldErrors.data_encerramento ? '#fff5f5' : '#fff'
              }}
            />
            {fieldErrors.data_encerramento && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: 4 }}>
                {fieldErrors.data_encerramento}
              </div>
            )}
            {form.status === 'Concluído' && !form.data_encerramento && (
              <div style={{ color: '#ffc107', fontSize: '0.875rem', marginTop: 4 }}>
                ⚠️ Data de encerramento é obrigatória para processos concluídos
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Observações:
            </label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Observações adicionais sobre o processo"
              style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, resize: 'vertical' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button 
              type="button" 
              onClick={() => navigate(`/processos/${id}`)} 
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Atualizando..." : "Atualizar Processo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
