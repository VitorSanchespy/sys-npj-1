

import React, { useEffect, useState, useRef } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import { apiRequest } from "../../api/apiRequest";
import { useAuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import UserCreateForm from "./UserCreateForm";
import UserDrawer from "./UserDrawer";

export default function UserList() {
  const [selectedUser, setSelectedUser] = useState(null);
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
      try {
        let url = "";
        if (user?.role === "admin") {
          url = `/api/usuarios?search=${encodeURIComponent(debouncedSearch)}&page=${page}`;
        } else if (user?.role === "professor") {
          url = `/api/usuarios/alunos?search=${encodeURIComponent(debouncedSearch)}&page=${page}`;
        } else {
          setUsuarios([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        const data = await apiRequest(url, { token });
        if (!ignore) {
          setUsuarios(data);
          setHasMore(data.length === 20); // Supondo paginação de 20
        }
      } catch {
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
    setSearch(e.target.value);
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
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={handleSearch}
          style={{ padding: 6, width: 220 }}
        />
      </div>
      {(user.role === "admin" || user.role === "professor") && (
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

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" checked={selectedIds.length === usuarios.length && usuarios.length > 0} onChange={selectAll} /></th>
            <th>Nome</th>
            <th>Email</th>
            <th>Papel</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>Nenhum usuário encontrado.</td>
            </tr>
          )}
          {usuarios.map(u => (
            <tr key={u.id}>
              <td><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} /></td>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.ativo === false ? "Inativo" : "Ativo"}</td>
              <td>
                <button style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setSelectedUser(u); setDrawerOpen(true); }}>
                  Detalhes
                </button>
                {(user.role === "admin" || user.role === "professor") && (
                  <>
                    {" | "}
                    <Link to={`/usuarios/${u.id}/editar`}>Editar</Link>
                    {" | "}
                    <button style={{ fontSize: 13 }} onClick={() => { setSelectedUser(u); setShowActions(u.id); }}>Gerenciar</button>
                    {showActions === u.id && selectedUser && selectedUser.id === u.id && (
                      <div style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', padding: 10, zIndex: 10 }}>
                        <button onClick={() => { setShowActions(false); setSelectedUser(null); }}>Fechar</button>
                        <div style={{ marginTop: 8 }}>
                          <Link to={`/usuarios/${u.id}/editar`}>Editar</Link>
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