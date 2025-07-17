// Garante que o caminho do arquivo sempre retorna a URL correta do backend
export function getFileUrl(caminho) {
  if (!caminho) return '';
  // Remove barras iniciais e prefixos errados
  let clean = caminho.replace(/^.*uploads[\\/]/, 'uploads/').replace(/^\\+|^\/+/, '');
  return `http://localhost:3001/${clean}`;
}
