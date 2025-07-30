import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import { useAuthContext } from '../../contexts/AuthContext';

const NotificationSettings = () => {
  const { token } = useAuthContext();
  const [settings, setSettings] = useState({
    email_lembretes: true,
    email_alertas: true,
    email_agendamentos: true,
    email_processos: true,
    email_autenticacao: true,
    push_lembretes: true,
    push_alertas: true,
    push_agendamentos: true,
    push_processos: true,
    push_autenticacao: true,
    horario_inicio: '08:00',
    horario_fim: '18:00',
    dias_antecedencia_lembrete: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Carregar configurações ao montar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotificationSettings(token);
      if (data.configuracao) {
        setSettings(prev => ({ ...prev, ...data.configuracao }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      setMessage('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      await notificationService.updateNotificationSettings(token, settings);
      setMessage('✅ Configurações salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      setMessage('❌ Erro ao salvar configurações');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          ⚙️ Configurações de Notificações
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure como e quando você deseja receber notificações
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Notificações por Email */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📧 Notificações por Email
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Lembretes de Agendamentos
                </label>
                <p className="text-sm text-gray-500">
                  Receber emails de lembrete para agendamentos próximos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.email_lembretes}
                  onChange={(e) => handleChange('email_lembretes', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full ${settings.email_lembretes ? 'bg-blue-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.email_lembretes ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Alertas de Sistema
                </label>
                <p className="text-sm text-gray-500">
                  Receber emails para alertas importantes do sistema
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.email_alertas}
                  onChange={(e) => handleChange('email_alertas', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full ${settings.email_alertas ? 'bg-blue-600' : 'bg-gray-200'} transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.email_alertas ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Agendamentos
                </label>
                <p className="text-sm text-gray-500">
                  Notificações sobre criação, alteração e cancelamento de agendamentos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.email_agendamentos}
                  onChange={(e) => handleChange('email_agendamentos', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full ${settings.email_agendamentos ? 'bg-blue-600' : 'bg-gray-200'} transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.email_agendamentos ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Processos
                </label>
                <p className="text-sm text-gray-500">
                  Notificações sobre processos jurídicos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.email_processos}
                  onChange={(e) => handleChange('email_processos', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full ${settings.email_processos ? 'bg-blue-600' : 'bg-gray-200'} transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.email_processos ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Autenticação e Segurança
                </label>
                <p className="text-sm text-gray-500">
                  Notificações sobre tentativas de login e segurança
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.email_autenticacao}
                  onChange={(e) => handleChange('email_autenticacao', e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full ${settings.email_autenticacao ? 'bg-blue-600' : 'bg-gray-200'} transition-colors`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings.email_autenticacao ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Horários de Notificação */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ⏰ Horários de Notificação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Início das notificações
              </label>
              <input
                type="time"
                value={settings.horario_inicio}
                onChange={(e) => handleChange('horario_inicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fim das notificações
              </label>
              <input
                type="time"
                value={settings.horario_fim}
                onChange={(e) => handleChange('horario_fim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Fora desse horário, as notificações serão enviadas apenas para eventos urgentes
          </p>
        </div>

        {/* Configurações Gerais */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            📋 Configurações Gerais
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antecedência para lembretes (dias)
            </label>
            <select
              value={settings.dias_antecedencia_lembrete}
              onChange={(e) => handleChange('dias_antecedencia_lembrete', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 dia antes</option>
              <option value={2}>2 dias antes</option>
              <option value={3}>3 dias antes</option>
              <option value={7}>1 semana antes</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            {message && (
              <span className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
          </div>
          <div className="space-x-3">
            <button
              onClick={loadSettings}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
