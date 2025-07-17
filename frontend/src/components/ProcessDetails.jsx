import { useEffect, useState } from 'react';

export default function VincularUsuario({ processoId }) {
    const [pagina, setPagina] = useState(1);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            const response = await fetch(`/api/processos/${processoId}/usuarios?pagina=${pagina}&porPagina=10`);
            const data = await response.json();
            setUsuarios(data);
        };
        fetchUsuarios();
    }, [pagina, processoId]);

    const handleVincularUsuario = (e) => {
        e.preventDefault();
        // Lógica para vincular usuário
    };

    return (
        <div>
            <form onSubmit={handleVincularUsuario}>
                <label htmlFor="usuarioId">ID do Usuário:</label>
                <input type="text" id="usuarioId" name="usuarioId" placeholder="Digite o ID do usuário" required />

                <label htmlFor="role">Role:</label>
                <select id="role" name="role" required>
                    <option value="Aluno">Aluno</option>
                    <option value="Professor">Professor</option>
                </select>

                <button type="submit">Vincular Usuário</button>
            </form>

            <h2>Usuários Vinculados</h2>
            {usuarios.map(usuario => (
                <p key={usuario.nome}>{usuario.role}: {usuario.nome}</p>
            ))}

            {/* Botões de navegação */}
            <div>
                <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>Anterior</button>
                <button onClick={() => setPagina(pagina + 1)}>Próximo</button>
            </div>
        </div>
    );
}