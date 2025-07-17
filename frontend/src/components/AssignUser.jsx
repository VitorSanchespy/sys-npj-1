// Adicionar campo de pesquisa e exibir resultados
const [nome, setNome] = useState('');
const [usuarios, setUsuarios] = useState([]);

const buscarUsuarios = async () => {
    const response = await fetch(`/api/processos/buscar-usuarios?nome=${nome}`);
    const data = await response.json();
    setUsuarios(data);
};

return (
    <div>
        <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome para buscar"
        />
        <button onClick={buscarUsuarios}>Buscar</button>

        <ul>
            {usuarios.map(usuario => (
                <li key={usuario.id}>{usuario.role}: {usuario.nome}</li>
            ))}
        </ul>
    </div>
);