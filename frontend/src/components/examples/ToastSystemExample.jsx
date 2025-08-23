/**
 * EXEMPLO DE COMPONENTE USANDO O SISTEMA DE TOAST AUDITADO
 * 
 * Este exemplo demonstra todas as formas de usar o novo sistema
 * de toast audit em um componente React típico.
 */

import React, { useState } from 'react';
import { 
  useToastAudit, 
  useApiWithToast, 
  useFormValidationToast,
  useCrudToast 
} from '../hooks/useToastSystem';

const ExampleComponent = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    dataAgendamento: ''
  });
  
  // Hook básico para toast audit
  const toast = useToastAudit();
  
  // Hook para operações de API com toast automático
  const { executeApi } = useApiWithToast();
  
  // Hook para validação de formulário
  const {
    validateRequired,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateFutureDate
  } = useFormValidationToast();
  
  // Hook para operações CRUD
  const userCrud = useCrudToast('Usuário');
  const agendamentoCrud = useCrudToast('Agendamento');

  /**
   * EXEMPLO 1: Toast manual básico
   */
  const handleBasicToast = () => {
    toast.success('Operação realizada com sucesso!');
  };

  /**
   * EXEMPLO 2: Toast categorizados
   */
  const handleCategorizedToasts = () => {
    // Toast de autenticação
    toast.auth.loginSuccess('João Silva');
    
    // Toast de processo
    setTimeout(() => {
      toast.process.createSuccess('Processo de Divórcio');
    }, 1000);
    
    // Toast de agendamento com conflito
    setTimeout(() => {
      toast.schedule.conflictError();
    }, 2000);
    
    // Toast de validação
    setTimeout(() => {
      toast.validation.requiredField('Nome');
    }, 3000);
  };

  /**
   * EXEMPLO 3: Validação de formulário
   */
  const handleFormValidation = () => {
    const { nome, email, senha, confirmarSenha, dataAgendamento } = formData;
    
    // Validações com toast automático
    if (!validateRequired(nome, 'Nome')) return;
    if (!validateEmail(email)) return;
    if (!validatePassword(senha, 8)) return;
    if (!validatePasswordConfirmation(senha, confirmarSenha)) return;
    if (!validateFutureDate(dataAgendamento, 'Data do agendamento')) return;
    
    toast.success('Formulário válido!');
  };

  /**
   * EXEMPLO 4: Operação de API com toast automático
   */
  const handleApiOperation = async () => {
    try {
      await executeApi(
        () => fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }),
        {
          url: '/api/usuarios',
          method: 'POST',
          showLoading: true,
          loadingMessage: 'Criando usuário...',
          successMessage: 'Usuário criado com sucesso!',
          errorMessage: 'Erro ao criar usuário'
        }
      );
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  /**
   * EXEMPLO 5: CRUD com toast automático
   */
  const handleCrudOperations = async () => {
    try {
      // Criar usuário
      await userCrud.create(() => 
        fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      );
      
      // Atualizar usuário
      setTimeout(async () => {
        await userCrud.update(() => 
          fetch('/api/usuarios/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id: 1 })
          })
        );
      }, 2000);
      
      // Criar agendamento
      setTimeout(async () => {
        await agendamentoCrud.create(() => 
          fetch('/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              titulo: 'Consulta Jurídica',
              data: formData.dataAgendamento
            })
          })
        );
      }, 4000);
      
    } catch (error) {
      console.error('Erro nas operações CRUD:', error);
    }
  };

  /**
   * EXEMPLO 6: Toast de sistema
   */
  const handleSystemToasts = () => {
    // Simular diferentes tipos de erro de sistema
    toast.system.networkError();
    
    setTimeout(() => {
      toast.system.serverError();
    }, 1000);
    
    setTimeout(() => {
      toast.system.maintenanceMode();
    }, 2000);
  };

  /**
   * EXEMPLO 7: Gerenciamento de toast ativo
   */
  const handleToastManagement = () => {
    // Mostrar quantos toasts estão ativos
    const activeToasts = toast.getActiveToasts();
    toast.info(`Toasts ativos: ${activeToasts.length}`);
    
    // Limpar todos os toasts
    setTimeout(() => {
      toast.clear();
    }, 3000);
  };

  /**
   * Manipular mudanças no formulário
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Exemplo do Sistema de Toast Audit
      </h1>
      
      {/* Formulário de exemplo */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Formulário de Teste</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="w-full p-2 border rounded"
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-2 border rounded"
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={(e) => handleInputChange('senha', e.target.value)}
            className="w-full p-2 border rounded"
          />
          
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={formData.confirmarSenha}
            onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
            className="w-full p-2 border rounded"
          />
          
          <input
            type="datetime-local"
            placeholder="Data do Agendamento"
            value={formData.dataAgendamento}
            onChange={(e) => handleInputChange('dataAgendamento', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      {/* Botões de teste */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleBasicToast}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Toast Básico
          </button>
          
          <button
            onClick={handleCategorizedToasts}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Toasts Categorizados
          </button>
          
          <button
            onClick={handleFormValidation}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
          >
            Validar Formulário
          </button>
          
          <button
            onClick={handleApiOperation}
            className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
          >
            Operação de API
          </button>
          
          <button
            onClick={handleCrudOperations}
            className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600"
          >
            Operações CRUD
          </button>
          
          <button
            onClick={handleSystemToasts}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Toasts de Sistema
          </button>
          
          <button
            onClick={handleToastManagement}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Gerenciar Toasts
          </button>
          
          <button
            onClick={() => toast.clear()}
            className="bg-black text-white p-2 rounded hover:bg-gray-800"
          >
            Limpar Todos
          </button>
        </div>
      </div>
      
      {/* Informações do sistema */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Status do Sistema:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Sistema de Toast Audit ativo</li>
          <li>✅ Anti-duplicação configurado</li>
          <li>✅ Interceptação automática de API</li>
          <li>✅ Validação de formulário integrada</li>
          <li>✅ CRUD operations com toast</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleComponent;
