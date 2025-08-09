import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/api/apiRequest";
import { tabelaAuxiliarService, processService } from "../../api/services";
import { requestCache } from "@/utils/requestCache";
import Button from "@/components/common/Button";

export default function ProcessEditPage() {
  const { id } = useParams();
  const { token } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [fases, setFases] = useState([]);
  const [diligencias, setDiligencias] = useState([]);
  const [localTramitacoes, setLocalTramitacoes] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const proc = await apiRequest(`/api/processos/${id}/detalhes`, { token });
        setFormData({
          numero_processo: proc.numero_processo || '',
          num_processo_sei: proc.num_processo_sei || '',
          assistido: proc.assistido || '',
          descricao: proc.descricao || '',
          status: proc.status || '',
          tipo_processo: proc.tipo_processo || '',
          sistema: proc.sistema || 'Físico',
          materia_assunto_id: proc.materiaAssunto?.id || '',
          local_tramitacao_id: proc.localTramitacao?.id || '',
          fase_id: proc.fase?.id || '',
          diligencia_id: proc.diligencia?.id || '',
          contato_assistido: proc.contato_assistido || '',
          observacoes: proc.observacoes || '',
          data_encerramento: proc.data_encerramento ? new Date(proc.data_encerramento).toISOString().slice(0, 16) : '',
          idusuario_responsavel: proc.usuario_responsavel?.id || ''
        });
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
      } catch (e) {
        setFormData(null);
      }
      setLoading(false);
    }
    fetchAll();
  }, [id, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      console.log('🔍 DEBUG: Dados do formulário antes do envio:', formData);
      console.log('🔍 DEBUG: Token sendo usado:', token);
      console.log('🔍 DEBUG: ID do processo:', id);
      
      await processService.updateProcess(token, id, formData);
      
      // Limpa o cache de forma mais agressiva
      requestCache.clear(`GET:/api/processos/${id}/detalhes:`);
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      requestCache.clear(`GET:/api/processos:`);
      
      // Invalida o cache do React Query
      queryClient.invalidateQueries(['processo', id]);
      queryClient.invalidateQueries(['processos']);
      
      alert('Processo atualizado com sucesso!');
      navigate(`/processos/${id}`, { state: { updated: Date.now() } });
    } catch (err) {
      alert('Erro ao atualizar processo: ' + (err?.response?.data?.erro || err.message));
    }
  };

  if (loading || !formData) return <div>Carregando dados do processo...</div>;
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#f3f4f6', padding: 24, borderRadius: 8 }}>
      <h2>Editar Processo</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>Número do Processo*
          <input name="numero_processo" value={formData.numero_processo} onChange={handleChange} required />
        </label>
        <label>Num/Processo/SEI
          <input name="num_processo_sei" value={formData.num_processo_sei} onChange={handleChange} />
        </label>
        <label>Assistido/a
          <input name="assistido" value={formData.assistido} onChange={handleChange} />
        </label>
        <label>Contato/Assistido
          <input name="contato_assistido" value={formData.contato_assistido} onChange={handleChange} />
        </label>
        <label>Descrição*
          <textarea name="descricao" value={formData.descricao} onChange={handleChange} required />
        </label>
        <label>Tipo do Processo
          <input name="tipo_processo" value={formData.tipo_processo} onChange={handleChange} placeholder="Ex: Cível, Criminal, Trabalhista" />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>Status*
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="">Selecione o status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Arquivado">Arquivado</option>
            </select>
          </label>
          <label>Sistema*
            <select name="sistema" value={formData.sistema} onChange={handleChange} required>
              <option value="Físico">Físico</option>
              <option value="PEA">PEA</option>
              <option value="PJE">PJE</option>
            </select>
          </label>
        </div>
        <label>Matéria/Assunto*
          <select name="materia_assunto_id" value={formData.materia_assunto_id} onChange={handleChange} required>
            <option value="">Selecione a matéria/assunto</option>
            {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>Fase*
            <select name="fase_id" value={formData.fase_id} onChange={handleChange} required>
              <option value="">Selecione a fase</option>
              {fases.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </label>
          <label>Diligência*
            <select name="diligencia_id" value={formData.diligencia_id} onChange={handleChange} required>
              <option value="">Selecione a diligência</option>
              {diligencias.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </label>
        </div>
        <label>Local de Tramitação*
          <select name="local_tramitacao_id" value={formData.local_tramitacao_id} onChange={handleChange} required>
            <option value="">Selecione o local</option>
            {localTramitacoes.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>
        </label>
        <label>Data de Encerramento
          <input type="datetime-local" name="data_encerramento" value={formData.data_encerramento} onChange={handleChange} />
        </label>
        <label>Observações
          <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} />
        </label>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Button type="submit" variant="primary">Salvar</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/processos/${id}`)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
