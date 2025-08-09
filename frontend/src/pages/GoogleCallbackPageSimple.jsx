import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const GoogleCallbackPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1>Google Calendar Callback</h1>
        <p>Processando autorização...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
