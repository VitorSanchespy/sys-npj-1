import React, { useState, useRef } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import { userService } from "@/api/services";
import { useAuthContext } from "@/contexts/AuthContext";
import { getUserRole, hasRole, renderValue } from "@/utils/commonUtils";
import UserCreateForm from "./UserCreateForm";

export default function UserList() {
  const { token, user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, user: null, action: null });
  const debounceTimeout = useRef();

  // Controle de acesso - Aluno não tem acesso
  if (user?.role_id === 2) {
    return (
      <div style={{ 
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#fff3cd',
        margin: '20px',
        borderRadius: '12px',
        border: '1px solid #ffeaa7'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚫</div>
        <h2 style={{ color: '#856404', margin: '0 0 10px 0' }}>Acesso Negado</h2>
        <p style={{ color: '#856404', margin: 0 }}>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  // Busca de usuários com debounce
  async function searchUsers(searchTerm) {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      let data = [];
      
      // Admin pode ver todos, Professor só alunos
      if (user?.role_id === 1) {
        data = await userService.getAllUsers(token, searchTerm);
      } else if (user?.role_id === 3) {
        data = await userService.getStudents(token, searchTerm);
      }
      
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(!!value);
    
    if (!value.trim()) {
      setSuggestions([]);
      setSelectedUser(null);
      return;
    }
    
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      searchUsers(value);
    }, 400);
  }

  function selectUser(usuario) {
    setSelectedUser(usuario);
    setEditingUser({ ...usuario }); // Cria cópia para edição
    setShowSuggestions(false);
    setSearch(usuario.nome);
  }

  function handleEditChange(field, value) {
    setEditingUser(prev => ({
      ...prev,
      [field]: value
    }));
  }

  async function saveUser() {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      
      // Separar a nova senha dos outros dados
      const { nova_senha, ...userData } = editingUser;
      
      // Atualizar dados do usuário
      await userService.updateUser(token, editingUser.id, userData);
      
      // Se uma nova senha foi fornecida, atualizá-la separadamente
      if (nova_senha && nova_senha.trim()) {
        try {
          await userService.updatePassword(token, editingUser.id, nova_senha);
          setActionMsg('Usuário e senha atualizados com sucesso!');
        } catch (passwordError) {
          console.error('Erro ao atualizar senha:', passwordError);
          setActionMsg('Usuário atualizado, mas houve erro ao alterar a senha.');
        }
      } else {
        setActionMsg('Usuário atualizado com sucesso!');
      }
      
      setSelectedUser({ ...userData });
      setTimeout(() => setActionMsg(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setActionMsg('Erro ao atualizar usuário.');
      setTimeout(() => setActionMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleSoftDelete(usuario) {
    try {
      setLoading(true);
      await userService.deleteUser(token, usuario.id);
      setActionMsg(`Usuário ${usuario.nome} inativado com sucesso!`);
      setSelectedUser(prev => ({ ...prev, ativo: false }));
      setEditingUser(prev => ({ ...prev, ativo: false }));
      setTimeout(() => setActionMsg(''), 3000);
    } catch (error) {
      console.error('Erro ao inativar usuário:', error);
      setActionMsg('Erro ao inativar usuário.');
      setTimeout(() => setActionMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivate(usuario) {
    try {
      setLoading(true);
      await userService.reactivateUser(token, usuario.id);
      setActionMsg(`Usuário ${usuario.nome} reativado com sucesso!`);
      setSelectedUser(prev => ({ ...prev, ativo: true }));
      setEditingUser(prev => ({ ...prev, ativo: true }));
      setTimeout(() => setActionMsg(''), 3000);
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      setActionMsg('Erro ao reativar usuário.');
      setTimeout(() => setActionMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSearch("");
    setSelectedUser(null);
    setEditingUser(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div style={{ padding: '30px' }}>
      {/* Botão Criar Usuário */}
      {hasRole(user, ['Admin', 'Professor']) && (
        <div style={{ marginBottom: '25px' }}>
          <Button
            variant={showCreate ? "danger" : "success"}
            onClick={() => setShowCreate(!showCreate)}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {showCreate ? "❌ Cancelar" : "➕ Criar Novo Usuário"}
          </Button>
        </div>
      )}

      {showCreate && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '25px', 
          backgroundColor: '#f8f9fa',
          border: '2px solid #e9ecef', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <UserCreateForm onCreated={() => setShowCreate(false)} />
        </div>
      )}

      {/* Campo de Busca */}
      <div style={{ marginBottom: '25px', position: 'relative', maxWidth: '500px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          fontWeight: 'bold',
          fontSize: '1rem',
          color: '#333'
        }}>
          🔍 Buscar {user?.role_id === 3 ? 'Aluno' : 'Usuário'}:
        </label>
        <input
          type="text"
          placeholder={`Digite o nome do ${user?.role_id === 3 ? 'aluno' : 'usuário'} para buscar...`}
          value={search}
          onChange={handleSearch}
          onFocus={() => setShowSuggestions(!!search)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          style={{
            width: '100%',
            padding: '15px 50px 15px 20px',
            border: '2px solid #e9ecef',
            borderRadius: '25px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            boxSizing: 'border-box'
          }}
          onFocusCapture={(e) => e.target.style.borderColor = '#007bff'}
          onBlurCapture={(e) => e.target.style.borderColor = '#e9ecef'}
        />
        <span style={{ 
          position: 'absolute', 
          right: '20px', 
          top: '45px', 
          color: '#999',
          fontSize: '1.2rem'
        }}>
          🔍
        </span>
        
        {/* Sugestões de busca */}
        {showSuggestions && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '2px solid #e9ecef',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}>
            {loading && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔄</span><br />
                Buscando...
              </div>
            )}
            {!loading && suggestions.length === 0 && search && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontSize: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>❌</span><br />
                Nenhum usuário encontrado
              </div>
            )}
            {!loading && suggestions.map(usuario => (
              <div
                key={usuario.id}
                onClick={() => selectUser(usuario)}
                style={{
                  padding: '15px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  color: '#333',
                  marginBottom: '4px'
                }}>{usuario.nome}</div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666',
                  marginBottom: '4px'
                }}>{usuario.email}</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>
                    {usuario.role_id === 1 ? '👑 Admin' : usuario.role_id === 2 ? '🎓 Aluno' : '👨‍🏫 Professor'}
                  </span>
                  {usuario.ativo === false && (
                    <span style={{ 
                      color: '#dc3545',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}>
                      ❌ Inativo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário de Edição */}
      {selectedUser && editingUser && (
        <div style={{
          marginTop: '30px',
          padding: '30px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          border: '2px solid #007bff',
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #e9ecef'
          }}>
            <h3 style={{ 
              margin: 0,
              color: '#001F3F',
              fontSize: '1.4rem',
              fontWeight: 'bold'
            }}>
              ✏️ Editando: {selectedUser.nome}
            </h3>
            <button 
              onClick={resetForm}
              style={{
                padding: '8px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ❌ Fechar
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px', 
            marginBottom: '25px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333',
                fontSize: '0.9rem'
              }}>👤 Nome:</label>
              <input
                type="text"
                value={editingUser.nome || ''}
                onChange={(e) => handleEditChange('nome', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333',
                fontSize: '0.9rem'
              }}>📧 Email:</label>
              <input
                type="email"
                value={editingUser.email || ''}
                onChange={(e) => handleEditChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            {user?.role_id === 1 && (
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333',
                  fontSize: '0.9rem'
                }}>🎓 Papel:</label>
                <select
                  value={editingUser.role_id || ''}
                  onChange={(e) => handleEditChange('role_id', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                >
                  <option value={1}>👑 Admin</option>
                  <option value={2}>🎓 Aluno</option>
                  <option value={3}>👨‍🏫 Professor</option>
                </select>
              </div>
            )}

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333',
                fontSize: '0.9rem'
              }}>📞 Telefone:</label>
              <input
                type="text"
                value={editingUser.telefone || ''}
                onChange={(e) => handleEditChange('telefone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                placeholder="(xx) xxxxx-xxxx"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333',
                fontSize: '0.9rem'
              }}>🔒 Nova Senha:</label>
              <input
                type="password"
                value={editingUser.nova_senha || ''}
                onChange={(e) => handleEditChange('nova_senha', e.target.value)}
                placeholder="Deixe em branco para não alterar"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333',
                fontSize: '0.9rem'
              }}>📊 Status:</label>
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: editingUser.ativo !== false ? '#d4edda' : '#f8d7da',
                color: editingUser.ativo !== false ? '#155724' : '#721c24',
                fontWeight: 'bold',
                border: `2px solid ${editingUser.ativo !== false ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: '1rem'
              }}>
                {editingUser.ativo !== false ? '✅ Ativo' : '❌ Inativo'}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            flexWrap: 'wrap',
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '2px solid #e9ecef'
          }}>
            <button
              onClick={saveUser}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#218838';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#28a745';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? '⏳ Salvando...' : '💾 Salvar Alterações'}
            </button>

            {editingUser.ativo !== false ? (
              <button
                onClick={() => setConfirm({ open: true, user: editingUser, action: 'delete' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c82333';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🚫 Inativar Usuário
              </button>
            ) : (
              <button
                onClick={() => setConfirm({ open: true, user: editingUser, action: 'reactivate' })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#138496';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#17a2b8';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ✅ Reativar Usuário
              </button>
            )}

            <button
              onClick={resetForm}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a6268';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#6c757d';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de feedback */}
      {actionMsg && (
        <div style={{
          marginTop: '25px',
          padding: '15px 20px',
          backgroundColor: actionMsg.includes('Erro') ? '#f8d7da' : '#d4edda',
          color: actionMsg.includes('Erro') ? '#721c24' : '#155724',
          border: `2px solid ${actionMsg.includes('Erro') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '1rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {actionMsg.includes('Erro') ? '❌' : '✅'} {actionMsg}
        </div>
      )}

      {/* Dialog de Confirmação */}
      {confirm.open && (
        <ConfirmDialog
          open={confirm.open}
          title={confirm.action === 'delete' ? '🚫 Inativar usuário?' : '✅ Reativar usuário?'}
          message={`Tem certeza que deseja ${confirm.action === 'delete' ? 'inativar' : 'reativar'} o usuário ${confirm.user.nome}?`}
          onCancel={() => setConfirm({ open: false, user: null, action: null })}
          onConfirm={async () => {
            if (confirm.action === 'delete') {
              await handleSoftDelete(confirm.user);
            } else if (confirm.action === 'reactivate') {
              await handleReactivate(confirm.user);
            }
            setConfirm({ open: false, user: null, action: null });
          }}
        />
      )}
    </div>
  );
}
