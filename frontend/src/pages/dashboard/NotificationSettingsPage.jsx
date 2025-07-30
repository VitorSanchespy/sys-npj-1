import React from "react";
import NotificationSettings from "../../components/notifications/NotificationSettings";

export default function NotificationSettingsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#343a40'
        }}>
          ⚙️ Configurações de Notificações
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          Configure suas preferências de notificação
        </p>
      </div>
      
      <NotificationSettings />
    </div>
  );
}
