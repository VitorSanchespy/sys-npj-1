import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/api/apiRequest";
import { tabelaAuxiliarService, processService } from "../../api/services";
import { toastService } from "@/services/toastService";
import { requestCache } from "@/utils/requestCache";
import Button from "@/components/common/Button";
import CampoAuxiliarComControle from "@/components/common/CampoAuxiliarComControle";

export default function ProcessEditPage() {
  const { id } = useParams();
  const { token } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const proc = await apiRequest(`/api/processos/${id}/detalhes`, { token });
        setFormData({
          numero_processo: proc.numero_processo || '',
          titulo: proc.titulo || '',
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

  // Função para atualizar processo - com logs de desenvolvimento
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await processService.updateProcess(token, id, formData);
      
      // Limpa o cache de forma mais agressiva
      requestCache.clear(`GET:/api/processos/${id}/detalhes:`);
      requestCache.clear(`GET:/api/processos/${id}/usuarios:`);
      requestCache.clear(`GET:/api/processos:`);
      
      // Invalida o cache do React Query
      queryClient.invalidateQueries(['processo', id]);
      queryClient.invalidateQueries(['processos']);
      
      toastService.processUpdated(formData.titulo || 'Processo');
      navigate(`/processos/${id}`, { state: { updated: Date.now() } });
    } catch (err) {
      toastService.error('Erro ao atualizar processo: ' + (err?.response?.data?.erro || err.message));
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
        <label>Título*
          <input name="titulo" value={formData.titulo} onChange={handleChange} required />
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
        <CampoAuxiliarComControle
          type="materia"
          label="Matéria/Assunto"
          value={formData.materia_assunto_id}
          onChange={value => setFormData(f => ({ ...f, materia_assunto_id: value }))}
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <CampoAuxiliarComControle
            type="fase"
            label="Fase"
            value={formData.fase_id}
            onChange={value => setFormData(f => ({ ...f, fase_id: value }))}
            required
          />
          <CampoAuxiliarComControle
            type="diligencia"
            label="Diligência"
            value={formData.diligencia_id}
            onChange={value => setFormData(f => ({ ...f, diligencia_id: value }))}
            required
          />
        </div>
        <CampoAuxiliarComControle
          type="local_tramitacao"
          label="Local de Tramitação"
          value={formData.local_tramitacao_id}
          onChange={value => setFormData(f => ({ ...f, local_tramitacao_id: value }))}
          required
        />
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
