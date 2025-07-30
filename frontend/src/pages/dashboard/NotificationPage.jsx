import React from "react";
import NotificationCenter from "../../components/notifications/NotificationCenter";

export default function NotificationPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#343a40'
        }}>
          🔔 Notificações
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          Visualize e gerencie suas notificações
        </p>
      </div>
      
      <NotificationCenter />
    </div>
  );
}
