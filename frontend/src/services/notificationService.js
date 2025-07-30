// Serviço de notificações para o frontend
import { apiRequest } from '../api/apiRequest';

class NotificationService {
  constructor() {
    this.websocket = null;
    this.onNotificationReceived = null;
    this.isConnected = false;
    this.pollInterval = null;
  }

  // Conectar polling para notificações (temporário até WebSocket funcionar)
  connect(userId, token) {
    try {
      console.log('🔗 Conectando serviço de notificações para usuário:', userId);
      
      // Polling a cada 30 segundos para verificar novas notificações
      this.pollInterval = setInterval(() => {
        this.checkForNewNotifications(token);
      }, 30000);
      
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Erro ao conectar serviço de notificações:', error);
    }
  }

  // Verificar novas notificações
  async checkForNewNotifications(token) {
    try {
      const count = await this.getUnreadCount(token);
      // Por enquanto apenas logamos, depois podemos implementar lógica de notificação
      if (count > 0) {
        console.log(`🔔 ${count} notificações não lidas`);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar notificações:', error);
    }
  }

  // Desconectar
  disconnect() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isConnected = false;
  }

  // Configurar callback para notificações recebidas
  setNotificationHandler(callback) {
    this.onNotificationReceived = callback;
  }

  // Buscar notificações do usuário
  async getNotifications(token, limit = 50, offset = 0) {
    try {
      const response = await apiRequest('/api/notificacoes', 'GET', null, token);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      throw error;
    }
  }

  // Marcar notificação como lida
  async markAsRead(token, notificationId) {
    try {
      const response = await apiRequest(`/api/notificacoes/${notificationId}/lida`, 'PUT', null, token);
      return response;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Marcar todas como lidas
  async markAllAsRead(token) {
    try {
      const response = await apiRequest('/api/notificacoes/marcar-todas-lidas', 'PUT', null, token);
      return response;
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  // Buscar contador de notificações não lidas
  async getUnreadCount(token) {
    try {
      const response = await apiRequest('/api/notificacoes/nao-lidas/contador', 'GET', null, token);
      return response.count || 0;
    } catch (error) {
      console.error('❌ Erro ao buscar contador:', error);
      return 0;
    }
  }

  // Configurações de notificação do usuário
  async getNotificationSettings(token) {
    try {
      const response = await apiRequest('/api/notificacoes/configuracoes', 'GET', null, token);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      throw error;
    }
  }

  // Atualizar configurações de notificação
  async updateNotificationSettings(token, settings) {
    try {
      const response = await apiRequest('/api/notificacoes/configuracoes', 'PUT', settings, token);
      return response;
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
