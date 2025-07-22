

import React, { useEffect, useState, useRef } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { userService } from "../../api/services";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import UserCreateForm from "./UserCreateForm";
import UserDrawer from "./UserDrawer";
import UserCard from "./UserCard";

export default function UserList() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'grid'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [confirm, setConfirm] = useState({ open: false, user: null, action: null });
  const { token, user } = useAuthContext();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Seleção múltipla
  const [selectedIds, setSelectedIds] = useState([]);

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }
  function selectAll() {
    if (selectedIds.length === usuarios.length) setSelectedIds([]);
    else setSelectedIds(usuarios.map(u => u.id));
  }

  async function handleSoftDelete(usuario) {
    try {
      await userService.deleteUser(usuario.id, token);
      setActionMsg(`Usuário ${usuario.nome} inativado.`);
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, ativo: false } : u));
      setTimeout(() => setActionMsg(''), 2000);
    } catch {
      setActionMsg('Erro ao inativar usuário.');
      setTimeout(() => setActionMsg(''), 2000);
    }
  }

  async function handleReactivate(usuario) {
    try {
      await userService.reactivateUser(usuario.id, token);
      setActionMsg(`Usuário ${usuario.nome} reativado.`);
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, ativo: true } : u));
      setTimeout(() => setActionMsg(''), 2000);
    } catch {
      setActionMsg('Erro ao reativar usuário.');
      setTimeout(() => setActionMsg(''), 2000);
    }
  }

  async function handleBatchAction(action) {
    for (const id of selectedIds) {
      const u = usuarios.find(u => u.id === id);
      if (!u) continue;
      if (action === 'delete' && u.ativo !== false) await handleSoftDelete(u);
      if (action === 'reactivate' && u.ativo === false) await handleReactivate(u);
    }
    setSelectedIds([]);
    setActionMsg(action === 'delete' ? 'Usuários inativados.' : 'Usuários reativados.');
    setTimeout(() => setActionMsg(''), 2000);
  }

  useEffect(() => {
    let ignore = false;
    async function fetchUsuarios() {
      setLoading(true);
      console.log('[UserList] Iniciando busca de usuários');
      console.log('[UserList] user:', user);
      console.log('[UserList] user.role_id:', user?.role_id);
      console.log('[UserList] token:', token ? 'presente' : 'ausente');
      console.log('[UserList] debouncedSearch:', debouncedSearch);
      console.log('[UserList] page:', page);
      
      try {
        let data;
        // role_id: 1 = Admin, role_id: 3 = Professor, role_id: 2 = Aluno
        if (user?.role_id === 1) {
          console.log('[UserList] Chamando getAllUsers para admin');
          data = await userService.getAllUsers(token, debouncedSearch, page);
          console.log('[UserList] Dados recebidos (admin):', data);
        } else if (user?.role_id === 3) {
          console.log('[UserList] Chamando getStudents para professor');
          data = await userService.getStudents(token, debouncedSearch, page);
          console.log('[UserList] Dados recebidos (professor):', data);
        } else {
          console.log('[UserList] Usuário sem permissão, role_id:', user?.role_id);
          setUsuarios([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        if (!ignore) {
          console.log('[UserList] Definindo usuários:', data);
          console.log('[UserList] Primeiro usuário completo:', data[0]);
          setUsuarios(data);
          setHasMore(data.length === 20); // Supondo paginação de 20
        }
      } catch (error) {
        console.error('[UserList] Erro ao buscar usuários:', error);
        if (!ignore) {
          setUsuarios([]);
          setHasMore(false);
        }
      }
      if (!ignore) setLoading(false);
    }
    fetchUsuarios();
    return () => { ignore = true; };
  }, [token, user, showCreate, debouncedSearch, page]);

  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Sempre volta para página 1 ao buscar
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    setShowSuggestions(!!value);
    if (!value) {
      setSuggestions([]);
      return;
    }
    
    // Buscar sugestões
    const searchPromise = user?.role_id === 1 
      ? userService.getAllUsers(token, value, 1)
      : user?.role_id === 3
      ? userService.getStudents(token, value, 1)
      : Promise.resolve([]);
      
    searchPromise
      .then(data => {
        if (value === search) {
          setSuggestions(Array.isArray(data) ? data : []);
        }
      })
      .catch(err => {
        if (err.message?.toLowerCase().includes('acesso negado')) {
          setSuggestions([{ id: 'no-access', nome: 'Acesso negado', email: '', role: '', ativo: false }]);
        } else {
          setSuggestions([]);
        }
      });
  }
  function nextPage() {
    if (hasMore) setPage(p => p + 1);
  }
  function prevPage() {
    if (page > 1) setPage(p => p - 1);
  }
  function nextPage() {
    if (hasMore) setPage(p => p + 1);
  }
  function prevPage() {
    if (page > 1) setPage(p => p - 1);
  }

  return (
    <div>
      <h2>Usuários</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
          {viewMode === 'table' ? 'Visualizar em Cards' : 'Visualizar em Tabela'}
        </button>
      </div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 20 }}>
        <span style={{ position: 'relative', display: 'inline-block', width: 240 }}>
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={handleSearch}
            style={{ padding: '8px 32px 8px 12px', width: '100%', borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
            onFocus={() => setShowSuggestions(!!search)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <span style={{ position: 'absolute', right: 10, top: 8, color: '#888', pointerEvents: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="9" cy="9" r="7" stroke="#888" strokeWidth="2" fill="none"/><line x1="15" y1="15" x2="19" y2="19" stroke="#888" strokeWidth="2"/></svg>
          </span>
          {showSuggestions && (
            <div style={{ position: 'absolute', top: 38, left: 0, width: '100%', background: '#fff', border: '1px solid #ccc', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxHeight: 220, overflowY: 'auto', zIndex: 99 }}>
              {suggestions.length === 0 && (
                <div style={{ padding: '8px 12px', color: '#888' }}>Nenhum usuário encontrado.</div>
              )}
              {suggestions.map(s => (
                <div
                  key={s.id}
                  style={{ padding: '8px 12px', cursor: s.id !== 'no-access' ? 'pointer' : 'not-allowed', borderBottom: '1px solid #eee', color: s.id === 'no-access' ? '#d33' : undefined }}
                  onMouseDown={() => {
                    if (s.id !== 'no-access') {
                      setSelectedUser(s);
                      setDrawerOpen(true);
                      setShowSuggestions(false);
                      setSearch(s.nome);
                    }
                  }}
                >
                  <b>{s.nome}</b> {s.email && <span style={{ color: '#888', fontSize: 13 }}>({s.email})</span>}
                </div>
              ))}
            </div>
          )}
        </span>
      </div>
      {(user.role_id === 1 || user.role_id === 3) && (
        <button style={{ marginBottom: 16 }} onClick={() => setShowCreate(v => !v)}>
          {showCreate ? "Fechar" : "Criar Usuário"}
        </button>
      )}
      {showCreate && <UserCreateForm onCreated={() => setShowCreate(false)} />}

      {/* Ações em lote */}
      {selectedIds.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => handleBatchAction('delete')}>Inativar Selecionados</button>
          <button onClick={() => handleBatchAction('reactivate')} style={{ marginLeft: 8 }}>Reativar Selecionados</button>
          <span style={{ marginLeft: 12, color: '#555' }}>{selectedIds.length} selecionado(s)</span>
        </div>
      )}

      {viewMode === 'table' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <thead style={{ background: '#f0f2f5', fontWeight: 500 }}>
            <tr>
              <th style={{ padding: '10px 6px', textAlign: 'center' }}><input type="checkbox" checked={selectedIds.length === usuarios.length && usuarios.length > 0} onChange={selectAll} /></th>
              <th style={{ padding: '10px 6px' }}>Nome</th>
              <th style={{ padding: '10px 6px' }}>Email</th>
              <th style={{ padding: '10px 6px' }}>Papel</th>
              <th style={{ padding: '10px 6px' }}>Status</th>
              <th style={{ padding: '10px 6px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 18 }}>Nenhum usuário encontrado.</td>
              </tr>
            )}
            {usuarios.map(u => (
              <tr key={u.id} style={{ background: '#fff', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#f5f7fa'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <td style={{ textAlign: 'center' }}><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                <td style={{ padding: '8px 6px' }}>{u.nome}</td>
                <td style={{ padding: '8px 6px' }}>{u.email}</td>
                <td style={{ padding: '8px 6px' }}>
                  {u.role_id === 1 ? 'Admin' : u.role_id === 2 ? 'Aluno' : u.role_id === 3 ? 'Professor' : u.role || 'N/A'}
                </td>
                <td style={{ padding: '8px 6px' }}>{u.ativo === false ? <span style={{ color: '#d33' }}>Inativo</span> : <span style={{ color: '#2a7' }}>Ativo</span>}</td>
                <td style={{ padding: '8px 6px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 15, marginRight: 6 }}
                    onClick={() => { setSelectedUser(u); setDrawerOpen(true); }}>
                    Detalhes
                  </button>
                  {(user.role_id === 1 || user.role_id === 3) && (
                    <>
                      {" | "}
                      <Link to={`/usuarios/${u.id}/editar`} style={{ color: '#007bff', textDecoration: 'underline', fontSize: 15, marginRight: 6 }}>Editar</Link>
                      {" | "}
                      <button style={{ fontSize: 15, color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setSelectedUser(u); setShowActions(u.id); }}>Gerenciar</button>
                      {showActions === u.id && selectedUser && selectedUser.id === u.id && (
                        <div style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', padding: 10, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 8 }}>
                          <button onClick={() => { setShowActions(false); setSelectedUser(null); }}>Fechar</button>
                          <div style={{ marginTop: 8 }}>
                            <Link to={`/usuarios/${u.id}/editar`} style={{ color: '#007bff', textDecoration: 'underline' }}>Editar</Link>
                          </div>
                          {u.ativo !== false ? (
                            <div>
                              <button onClick={() => setConfirm({ open: true, user: u, action: 'delete' })}>Inativar (Soft Delete)</button>
                            </div>
                          ) : (
                            <div>
                              <button onClick={() => setConfirm({ open: true, user: u, action: 'reactivate' })}>Reativar</button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'flex-start', marginTop: 16 }}>
          {usuarios.length === 0 && !loading && (
            <div style={{ color: '#888', width: '100%', textAlign: 'center' }}>Nenhum usuário encontrado.</div>
          )}
          {usuarios.map(u => (
            <div key={u.id} style={{ flex: '1 1 220px', maxWidth: 260 }}>
              <UserCard
                user={u}
                onDetails={() => { setSelectedUser(u); setDrawerOpen(true); }}
                onEdit={() => window.location.href = `/usuarios/${u.id}/editar`}
                onManage={() => { setSelectedUser(u); setShowActions(u.id); }}
              />
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button onClick={prevPage} disabled={page === 1}>Anterior</button>
        <span style={{ margin: '0 10px' }}>Página {page}</span>
        <button onClick={nextPage} disabled={!hasMore}>Próxima</button>
      </div>
      {loading && <div>Carregando...</div>}
      {actionMsg && <div style={{ color: 'green', marginTop: 8 }}>{actionMsg}</div>}
      <UserDrawer user={selectedUser} open={drawerOpen} onClose={() => setDrawerOpen(false)} onEdit={() => { setDrawerOpen(false); window.location.href = `/usuarios/${selectedUser?.id}/editar`; }} />
      {confirm.open && (
        <ConfirmDialog
          open={confirm.open}
          title={confirm.action === 'delete' ? 'Inativar usuário?' : 'Reativar usuário?'}
          message={`Tem certeza que deseja ${confirm.action === 'delete' ? 'inativar' : 'reativar'} o usuário ${confirm.user.nome}?`}
          onCancel={() => setConfirm({ open: false, user: null, action: null })}
          onConfirm={async () => {
            if (confirm.action === 'delete') await handleSoftDelete(confirm.user);
            if (confirm.action === 'reactivate') await handleReactivate(confirm.user);
            setConfirm({ open: false, user: null, action: null });
          }}
        />
      )}
    </div>
  );
}