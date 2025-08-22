import React from 'react';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Container de Toast configurado para todo o aplicativo
 * Substitui o sistema de notificações legado
 */
export default function ToastConfig() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Slide}
      style={{
        zIndex: 9999
      }}
      toastStyle={{
        fontSize: '14px',
        borderRadius: '8px'
      }}
    />
  );
}
