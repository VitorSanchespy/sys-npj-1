import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";

export default function ProcessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuthContext();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 ProcessDetailPage - Estado de autenticação:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      processId: id
    });

    if (!isAuthenticated || !token) {
      console.log('❌ Usuário não autenticado, redirecionando para login');
      navigate('/login');
      return;
    }

    const fetchProcesso = async () => {
      try {
        console.log('🔍 Buscando processo ID:', id);
        
        const response = await fetch(`http://localhost:3001/api/processos/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Processo carregado:', data);
          setProcesso(data);
          setError(null);
        } else {
          console.log('❌ Erro HTTP:', response.status);
          setError(`Erro ${response.status}: Não foi possível carregar o processo`);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar processo:', err);
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchProcesso();
  }, [id, token, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando processo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/processos')}
          >
            Voltar para Lista de Processos
          </Button>
        </div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Processo não encontrado</h2>
          <p className="text-gray-600 mb-4">ID: {id}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/processos')}
          >
            Voltar para Lista de Processos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Processo #{processo.numero || processo.id}
            </h1>
            <p className="text-gray-600">Detalhes do processo</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/processos')}
          >
            Voltar
          </Button>
        </div>

        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-gray-900">{processo.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <p className="text-gray-900">{processo.numero || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <p className="text-gray-900">{processo.titulo || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <p className="text-gray-900">{processo.status || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <p className="text-gray-900">{processo.tipo_processo || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <p className="text-gray-900">{processo.prioridade || 'Não informado'}</p>
          </div>
        </div>

        {/* Descrição */}
        {processo.descricao && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{processo.descricao}</p>
            </div>
          </div>
        )}

        {/* Responsável */}
        {processo.responsavel && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-blue-900">
                {processo.responsavel.nome} ({processo.responsavel.email})
              </p>
            </div>
          </div>
        )}

        {/* Debug info em desenvolvimento */}
        {import.meta.env.DEV && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Debug Info:</h3>
            <pre className="text-xs text-yellow-700 overflow-auto">
              {JSON.stringify(processo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

