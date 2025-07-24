import React, { useState, useRef } from "react";
import { testApiEndpoints } from "../../debug/apiTester";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useProcessos } from "@/hooks/useApi.jsx";
import { useDebounce } from "@/hooks/useDebounce";

// Helper para verificar role
const getUserRole = (user) => {
  if (!user) return null;
  
  if (typeof user.role === 'string') {
    return user.role;
  }
  
  if (user.role && typeof user.role === 'object') {
    return user.role.nome || user.role.name || null;
  }
  
  if (user.role_id === 1) return 'Admin';
  if (user.role_id === 2) return 'Aluno';
  if (user.role_id === 3) return 'Professor';
  
  return null;
};


function ProcessosTable({ processos }) {
  return (
    <div style={{ 
      overflowX: 'auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ 
            background: 'linear-gradient(135deg, #001F3F 0%, #004080 100%)',
            color: 'white'
          }}>
            <th style={{ 
              padding: '16px 20px', 
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px'
            }}>📋 Número</th>
            <th style={{ 
              padding: '16px 20px', 
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px'
            }}>📝 Descrição</th>
            <th style={{ 
              padding: '16px 20px', 
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px'
            }}>🔄 Status</th>
            <th style={{ 
              padding: '16px 20px', 
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px'
            }}>👤 Assistido</th>
            <th style={{ 
              padding: '16px 20px', 
              textAlign: 'left',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px'
            }}>📅 Última Atualização</th>
            <th style={{ 
              padding: '16px 20px', 
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              letterSpacing: '0.5px'
            }}>⚡ Ações</th>
          </tr>
        </thead>
        <tbody>
          {processos.map((proc, index) => (
            <tr 
              key={proc.id} 
              style={{ 
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e3f2fd';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <td style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
                <Link 
                  to={`/processos/${proc.id}`}
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#0056b3'}
                  onMouseLeave={(e) => e.target.style.color = '#007bff'}
                >
                  {proc.numero_processo || proc.numero || "-"}
                </Link>
              </td>
              <td style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e9ecef',
                fontSize: '0.9rem',
                color: '#495057'
              }}>
                {proc.descricao || "-"}
              </td>
              <td style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  backgroundColor: proc.status === 'Aberto' ? '#d4edda' : 
                                 proc.status === 'Em andamento' ? '#fff3cd' : '#f8d7da',
                  color: proc.status === 'Aberto' ? '#155724' : 
                         proc.status === 'Em andamento' ? '#856404' : '#721c24',
                  border: `1px solid ${proc.status === 'Aberto' ? '#c3e6cb' : 
                                      proc.status === 'Em andamento' ? '#ffeaa7' : '#f5c6cb'}`
                }}>
                  {proc.status || "-"}
                </span>
              </td>
              <td style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e9ecef',
                fontSize: '0.9rem',
                color: '#495057'
              }}>
                {proc.assistido || "-"}
              </td>
              <td style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e9ecef',
                fontSize: '0.9rem',
                color: '#6c757d'
              }}>
                {proc.updatedAt || proc.criado_em
                  ? new Date(proc.updatedAt || proc.criado_em).toLocaleDateString('pt-BR')
                  : "-"}
              </td>
              <td style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
                <Link 
                  to={`/processos/${proc.id}`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  👁️ Ver Detalhes
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
  const { user, token } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showMyProcesses, setShowMyProcesses] = useState(() => getUserRole(user) === "Aluno");
  
  // Debounce da busca para evitar muitas requisições
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Hook com cache inteligente - elimina todos os useEffect manuais!
  const { 
    data: processos = [], 
    isLoading, 
    error, 
    refetch 
  } = useProcessos(debouncedSearch, showMyProcesses);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMyProcessesToggle = () => {
    const userRole = getUserRole(user);
    if (userRole !== "Aluno") {
      setShowMyProcesses((prev) => !prev);
    }
  };

  // Função manual de refresh (opcional)
  const handleRefresh = () => {
    refetch();
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Header fixo */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#001F3F',
          padding: '15px 0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#001F3F'
            }}>
              NPJ
            </div>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              Sistema NPJ - UFMT
            </h1>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
          <div style={{ fontSize: '1.2rem', color: '#333' }}>Carregando...</div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '20px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem'
        }}>
          © 2025 Universidade Federal de Mato Grosso - NPJ
        </div>
      </div>
    );
  }
  
  if (isLoading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header fixo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001F3F',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#001F3F'
          }}>
            NPJ
          </div>
          <h1 style={{
            color: 'white',
            margin: 0,
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            Sistema NPJ - UFMT
          </h1>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🔄</div>
        <div style={{ fontSize: '1.2rem', color: '#333' }}>Carregando processos...</div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '20px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem'
      }}>
        © 2025 Universidade Federal de Mato Grosso - NPJ
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001F3F 0%, #003366 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Header fixo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001F3F',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#001F3F'
          }}>
            NPJ
          </div>
          <h1 style={{
            color: 'white',
            margin: 0,
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            Sistema NPJ - UFMT
          </h1>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '20px', color: '#dc3545' }}>⚠️</div>
        <div style={{ fontSize: '1.1rem', color: '#dc3545', marginBottom: '20px' }}>
          {error.message || "Erro ao carregar processos."}
        </div>
        <button 
          onClick={handleRefresh} 
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          🔄 Tentar novamente
        </button>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '20px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem'
      }}>
        © 2025 Universidade Federal de Mato Grosso - NPJ
      </div>
    </div>
  );

  return (
    <div>
      {/* Header fixo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001F3F',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#001F3F'
          }}>
            NPJ
          </div>
          <h1 style={{
            color: 'white',
            margin: 0,
            fontSize: '1.3rem',
            fontWeight: 'bold'
          }}>
            Sistema NPJ - UFMT
          </h1>
        </div>
      </div>

      <div style={{ paddingTop: '100px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #001F3F 0%, #004080 100%)',
          color: 'white',
          padding: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              📋 Lista de Processos
            </h1>
            <p style={{ 
              margin: '8px 0 0 0', 
              opacity: 0.9,
              fontSize: '1rem'
            }}>
              Gerencie e acompanhe todos os processos
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {(getUserRole(user) === "Professor" || getUserRole(user) === "Admin") && (
              <button
                onClick={() => navigate('/processos/novo')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#218838';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#28a745';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ➕ Novo Processo
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{
              position: 'relative',
              maxWidth: '500px'
            }}>
              <input
                type="text"
                placeholder="🔍 Pesquisar por número do processo..."
                value={searchTerm}
                onChange={handleSearch}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  border: '2px solid #e9ecef',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
          </div>
          
          {/* Filter Buttons */}
          {(getUserRole(user) === "Professor" || getUserRole(user) === "Admin") && (
            <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={handleMyProcessesToggle}
                style={{
                  padding: '10px 20px',
                  backgroundColor: showMyProcesses ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (showMyProcesses) {
                    e.target.style.backgroundColor = '#218838';
                  } else {
                    e.target.style.backgroundColor = '#5a6268';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = showMyProcesses ? '#28a745' : '#6c757d';
                }}
              >
                {showMyProcesses ? '👤 Meus Processos' : '🌐 Todos os Processos'}
              </button>
              {!showMyProcesses && getUserRole(user) === "Professor" && (
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  💡 Mostrando últimos 4 processos atualizados - dados em cache
                </span>
              )}
            </div>
          )}
          
          {/* Results */}
          {!processos.length ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                {searchTerm ? '🔍' : '📄'}
              </div>
              <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                {searchTerm ? 'Nenhum processo encontrado' : 'Nenhum processo cadastrado'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#999' }}>
                {searchTerm ? 'Tente ajustar os termos da pesquisa' : 'Comece criando um novo processo'}
              </div>
            </div>
          ) : (
            <ProcessosTable processos={processos} />
          )}
        </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '20px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem'
      }}>
        © 2025 Universidade Federal de Mato Grosso - NPJ
      </div>
    </div>
  );
}
