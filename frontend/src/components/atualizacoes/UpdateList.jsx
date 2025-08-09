import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { atualizacaoProcessoService, tabelaAuxiliarService as auxTablesService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import { getUserRole } from "../../hooks/useApi";
import { requestCache } from "../../utils/requestCache";
import UpdateForm from "./UpdateForm";
import { getFileUrl } from '../../utils/fileUrl';
import { FIELD_LABELS, getFieldDisplayValue } from './fieldNameMaps';


function formatDescricao(descricao, auxData) {
  // Exemplo: "fase_id: '53' → '59'" ou "materia_assunto_id: '2' → '3'"
  if (!descricao) { return ""; }
  // Regex para encontrar padrões tipo campo: 'id1' → 'id2'
  return descricao.replace(/([a-zA-Z_]+): '?([\d]+)'? *→ *'?([\d]+)'?/g, function(match, field, from, to) {
    const label = FIELD_LABELS[field] || field;
    const fromName = getFieldDisplayValue(field, from, auxData);
    const toName = getFieldDisplayValue(field, to, auxData);
    return `${label}: '${fromName}' → '${toName}'`;
  });
}

export default function UpdateList({ processoId, showDeleteButton = true }) {
  const { token, user } = useAuthContext();
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auxData, setAuxData] = useState({ materias: [], fases: [], diligencias: [], localTramitacoes: [] });

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const url = processoId ? `?processo_id=${processoId}` : '';
        const data = await atualizacaoProcessoService.listAtualizacoes(token, url);
        setUpdates(data);
      } catch {
        setUpdates([]);
      }
      setLoading(false);
    }
    fetchUpdates();
  }, [processoId, token]);

  useEffect(() => {
    async function fetchAux() {
      try {
        const [materias, fases, diligencias, localTramitacoes] = await Promise.all([
          auxTablesService.getMateriaAssunto(token),
          auxTablesService.getFase(token),
          auxTablesService.getDiligencia(token),
          auxTablesService.getLocalTramitacao(token),
        ]);
        setAuxData({ materias, fases, diligencias, localTramitacoes });
      } catch {
        setAuxData({ materias: [], fases: [], diligencias: [], localTramitacoes: [] });
      }
    }
    fetchAux();
  }, [token]);

  if (loading) return <div>Carregando atualizações...</div>;

  const userRole = getUserRole(user);

  return (
    <div>
      <ul>
        {updates.length === 0 && <li>Nenhuma atualização encontrada.</li>}
        {updates.map(upd => (
          <li key={upd.id}>
            {upd.tipo && <b>[{upd.tipo}] </b>}
            {(() => {
              // Remove conteúdo desnecessário e garante que 'Por @nome_usuario' sempre tenha o nome do usuário, se disponível
              let desc = (upd.descricao || '')
                .replace(/^.*?\)\s*/, '')
                .replace(/\{?Por:.*?\}?/gi, '')
                .replace(/\{[^}]*\}/g, '')
                .replace(/\[[^\]]*\]/g, '')
                .replace(/\n+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              // Se a descrição contém 'Por @ :', substituir por 'Por @nome_usuario :'
              // Sempre garantir que "Por @" seja seguido do nome do usuário
              if (/Por @\s*:?/i.test(desc) && upd.usuario && upd.usuario.nome) {
                desc = desc.replace(/Por @\s*:?/gi, `Por @${upd.usuario.nome} :`);
              }
              return formatDescricao(desc, auxData);
            })()}
            {upd.anexo && (
              <>
                <br />
                <a href={getFileUrl(upd.anexo)} target="_blank" rel="noopener noreferrer">Ver anexo</a>
              </>
            )}
            <br />
            <small>
              Por <b>@{upd.usuario && upd.usuario.nome ? upd.usuario.nome : (upd.usuario_nome || 'Usuário')}</b> : em {new Date(upd.data_atualizacao).toLocaleString()}
            </small>
            {userRole && ['professor', 'admin'].includes(userRole.toLowerCase()) && showDeleteButton && (
              <button
                style={{ marginLeft: 12, color: '#fff', background: '#d32f2f', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 500, cursor: 'pointer' }}
                onClick={async () => {
                  if(window.confirm('Tem certeza que deseja excluir esta atualização?')) {
                    try {
                      await atualizacaoProcessoService.deleteAtualizacao(token, upd.id);
                      requestCache.clear();
                      await queryClient.invalidateQueries({ queryKey: ['atualizacoes'] });
                      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                      setUpdates(updates.filter(u => u.id !== upd.id));
                    } catch (error) {
                      console.error('Erro ao excluir atualização:', error);
                      alert('Erro ao excluir atualização. Tente novamente.');
                    }
                  }
                }}
              >Excluir</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}