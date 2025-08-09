import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useProcessos } from "@/hooks/useApi.jsx";
import { useDebounce } from "@/hooks/useDebounce";
import OptimizedTable from "@/components/common/OptimizedTable";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import Loader from "@/components/layout/Loader";
import { getUserRole, canCreateProcess, formatDate, renderValue } from "@/utils/commonUtils";

export default function ProcessListPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showMyProcesses, setShowMyProcesses] = useState(() => getUserRole(user) === "Aluno");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Mudei de 4 para 10 processos por página
  
  // Debounce da busca para evitar muitas requisições
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Hook com cache inteligente e paginação
  const { 
    data: processosData, 
    isLoading, 
    error, 
    refetch 
  } = useProcessos(debouncedSearch, showMyProcesses, currentPage, itemsPerPage);

  // Extrair dados da resposta paginada
  const processos = processosData?.processos || [];
  const totalPages = processosData?.totalPages || 1;
  const hasMore = processosData?.hasMore || false;
  const totalItems = processosData?.totalItems || 0;

  // Funções de navegação de página
  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset página quando mudar filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, showMyProcesses]);

  // Definir colunas da tabela otimizada
  const columns = useMemo(() => [
    {
      key: 'numero_processo',
      label: 'Número do Processo',
      render: (value, row) => (
        <button
          type="button"
          onClick={() => navigate(`/processos/${row.id}`)}
          style={{
            color: '#007bff',
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '0.95rem',
            fontWeight: 'bold',
            textDecoration: 'underline',
            boxShadow: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'color 0.2s',
            opacity: 1
          }}
        >
          {value || row.numero || "-"}
        </button>
      )
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (value) => renderValue(value)
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'assistido',
      label: 'Assistido',
      render: (value) => renderValue(value)
    },
    {
      key: 'updatedAt',
      label: 'Última Atualização',
      render: (value, row) => formatDate(value || row.criado_em)
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <Button
          variant="success"
          onClick={() => navigate(`/processos/${row.id}`)}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem'
          }}
        >
          👁️ Ver Detalhes
        </Button>
      )
    }
  ], [navigate]);

  if (!user) {
    return <Loader message="Verificando autenticação" />;
  }
  
  if (error) return <Loader error={error} />;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef',
      marginBottom: '24px'
    }}>
      <h1 style={{ 
        margin: 0, 
        fontSize: '24px', 
        fontWeight: '600',
        color: '#212529'
      }}>
        <span style={{ fontSize: '24px', marginRight: '8px', verticalAlign: 'middle' }}>📋</span>
        Lista de Processos
      </h1>
      <p style={{ 
        margin: '8px 0 0 0', 
        fontSize: '14px', 
        color: '#6c757d' 
      }}>
        Gerencie todos os processos do sistema - Mostrando {itemsPerPage} processos por página
      </p>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '20px 0' }}>
        {/* Toggle meus processos */}
        {getUserRole(user) !== "Aluno" && (
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: 'auto'
          }}>
            <input
              type="checkbox"
              checked={showMyProcesses}
              onChange={() => setShowMyProcesses(!showMyProcesses)}
              style={{ transform: 'scale(1.1)' }}
            />
            Apenas meus processos
          </label>
        )}
        
        {/* Campo de busca */}
        <input
          type="text"
          placeholder="Buscar por número ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            width: '250px'
          }}
        />
        
        {/* Botão novo processo */}
        {canCreateProcess(user) && (
          <Button
            id="btn-add-process"
            variant="success"
            onClick={() => navigate('/processos/novo')}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ➕ Novo Processo
          </Button>
        )}
      </div>

      {/* Informações de paginação */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <span>
          Total: {totalItems} processos | Página {currentPage} de {totalPages}
        </span>
      </div>
      
      {/* Tabela de processos */}
      <div style={{ marginBottom: '20px' }}>
        {isLoading ? (
          <Loader message="Carregando processos..." />
        ) : processos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {searchTerm ? 'Nenhum processo encontrado para a busca' : 'Nenhum processo encontrado'}
            </p>
          </div>
        ) : (
          <OptimizedTable
            data={processos}
            columns={columns}
            itemsPerPage={processos.length} // Mostra todos os dados recebidos, sem paginação local
            searchableColumns={['numero_processo', 'numero', 'descricao', 'assistido']}
            sortableColumns={['numero_processo', 'descricao', 'status', 'assistido', 'updatedAt']}
            onRowClick={(row) => navigate(`/processos/${row.id}`)}
            loading={isLoading}
            emptyMessage="Nenhum processo encontrado"
          />
        )}
      </div>

      {/* Controles de paginação */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px'
        }}>
          <Button
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              fontSize: '14px'
            }}
          >
            ← Anterior
          </Button>

          {/* Números das páginas */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
                    color: currentPage === pageNum ? 'white' : '#007bff',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            style={{
              padding: '8px 16px',
              fontSize: '14px'
            }}
          >
            Próxima →
          </Button>
        </div>
      )}
    </div>
  );
}
