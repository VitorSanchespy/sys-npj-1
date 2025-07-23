import React, { useEffect, useState, useCallback, useRef } from "react";
import { apiRequest } from "@/api/apiRequest";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";


function ProcessosTable({ processos }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Número</th>
            <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Descrição</th>
            <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
            <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Assistido</th>
            <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Última Atualização</th>
            <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {processos.map((proc) => (
            <tr key={proc.id} style={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <td style={{ padding: 12, border: '1px solid #ddd' }}>
                <Link 
                  to={`/processos/${proc.id}`}
                  style={{ color: '#007bff', textDecoration: 'none' }}
                >
                  {proc.numero_processo || proc.numero || "-"}
                </Link>
              </td>
              <td style={{ padding: 12, border: '1px solid #ddd' }}>
                {proc.descricao || "-"}
              </td>
              <td style={{ padding: 12, border: '1px solid #ddd' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  backgroundColor: proc.status === 'Aberto' ? '#d4edda' : 
                                 proc.status === 'Em andamento' ? '#fff3cd' : '#f8d7da',
                  color: proc.status === 'Aberto' ? '#155724' : 
                         proc.status === 'Em andamento' ? '#856404' : '#721c24'
                }}>
                  {proc.status || "-"}
                </span>
              </td>
              <td style={{ padding: 12, border: '1px solid #ddd' }}>
                {proc.assistido || "-"}
              </td>
              <td style={{ padding: 12, border: '1px solid #ddd' }}>
                {proc.updatedAt || proc.criado_em
                  ? new Date(proc.updatedAt || proc.criado_em).toLocaleDateString('pt-BR')
                  : "-"}
              </td>
              <td style={{ padding: 12, border: '1px solid #ddd', textAlign: 'center' }}>
                <Link 
                  to={`/processos/${proc.id}`}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 4,
                    fontSize: 12
                  }}
                >
                  Ver Detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProcessListPage() {
  const navigate = useNavigate();
  const { token, user } = useAuthContext();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef();
  const [showMyProcesses, setShowMyProcesses] = useState(false);


  const fetchProcessos = useCallback(async (search = "", myProcesses = false) => {
    if (!token || !user?.role) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      let data = [];
      if (user.role === "Aluno") {
        data = await apiRequest("/api/processos/meus-processos", { token });
      } else if (user.role === "Professor") {
        if (search.trim()) {
          data = await apiRequest("/api/processos", { token });
        } else if (myProcesses) {
          data = await apiRequest("/api/processos/meus-processos", { token });
        } else {
          const allProcesses = await apiRequest("/api/processos", { token });
          data = allProcesses
            .sort((a, b) => new Date(b.updatedAt || b.criado_em) - new Date(a.updatedAt || a.criado_em))
            .slice(0, 4);
        }
      } else if (user.role === "Admin") {
        if (myProcesses) {
          data = await apiRequest("/api/processos/meus-processos", { token });
        } else {
          data = await apiRequest("/api/processos", { token });
        }
      }
      if (search.trim()) {
        data = data.filter(proc => 
          proc.numero_processo && proc.numero_processo.toLowerCase().includes(search.toLowerCase())
        );
      }
      setProcessos(data);
    } catch (err) {
      setProcessos([]);
      setError("Erro ao carregar processos.");
    }
    setLoading(false);
  }, [token, user?.role]);

  // Debounce para searchTerm
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms de delay
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  // Carregamento inicial
  useEffect(() => {
    if (user?.role && token) {
      if (user.role === "Aluno") {
        setShowMyProcesses(true);
      }
      fetchProcessos("", showMyProcesses);
    }
  }, [user?.role, token]);

  // Busca com debounce
  useEffect(() => {
    if (user?.role && token && debouncedSearch !== undefined) {
      fetchProcessos(debouncedSearch, showMyProcesses);
    }
  }, [debouncedSearch, showMyProcesses]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMyProcessesToggle = () => {
    if (user?.role !== "Aluno") {
      setShowMyProcesses((prev) => !prev);
    }
  };

  if (!token || !user) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }
  if (loading) return <div style={{ padding: 20 }}>Carregando processos...</div>;
  if (error) return <div style={{ color: "red", padding: 20 }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Processos</h2>
        {(user?.role === "Professor" || user?.role === "Admin") && (
          <button
            onClick={() => navigate('/processos/novo')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            Novo Processo
          </button>
        )}
      </div>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Pesquisar por número do processo..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: 5,
            fontSize: 16
          }}
        />
      </div>
      {(user?.role === "Professor" || user?.role === "Admin") && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={handleMyProcessesToggle}
            style={{
              padding: '8px 16px',
              backgroundColor: showMyProcesses ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}
          >
            {showMyProcesses ? 'Mostrar Todos' : 'Meus Processos'}
          </button>
          {!showMyProcesses && user?.role === "Professor" && (
            <span style={{ marginLeft: 10, fontSize: 14, color: '#666' }}>
              (Mostrando últimos 4 processos atualizados)
            </span>
          )}
        </div>
      )}
      {!processos.length ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          {searchTerm ? 'Nenhum processo encontrado para a pesquisa.' : 'Nenhum processo encontrado.'}
        </div>
      ) : (
        <ProcessosTable processos={processos} />
      )}

    </div>
  );
}
