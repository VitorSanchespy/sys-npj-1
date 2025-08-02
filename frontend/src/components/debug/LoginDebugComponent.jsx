import React, { useState } from 'react';

const LoginDebugComponent = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testDirectFetch = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            console.log('🚀 Testando fetch direto...');
            
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@test.com',
                    senha: '123456'
                })
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Response data:', data);
            
            setResult({
                success: true,
                data: data
            });

        } catch (error) {
            console.error('❌ Erro no fetch direto:', error);
            setResult({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const testApiRequest = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            console.log('🚀 Testando apiRequest...');
            
            // Importar o apiRequest dinamicamente
            const { apiRequest } = await import('@/api/apiRequest.js');
            
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: {
                    email: 'admin@test.com',
                    senha: '123456'
                }
            });

            console.log('✅ apiRequest data:', data);
            
            setResult({
                success: true,
                data: data
            });

        } catch (error) {
            console.error('❌ Erro no apiRequest:', error);
            setResult({
                success: false,
                error: error.message || 'Erro desconhecido'
            });
        } finally {
            setLoading(false);
        }
    };

    const testAuthService = async () => {
        setLoading(true);
        setResult(null);
        
        try {
            console.log('🚀 Testando authService...');
            
            // Importar o authService dinamicamente
            const { authService } = await import('@/api/services.js');
            
            const data = await authService.login('admin@test.com', '123456');

            console.log('✅ authService data:', data);
            
            setResult({
                success: true,
                data: data
            });

        } catch (error) {
            console.error('❌ Erro no authService:', error);
            setResult({
                success: false,
                error: error.message || 'Erro desconhecido'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>🔧 Debug de Login - Sistema NPJ</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={testDirectFetch}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        margin: '5px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    🔄 Teste Fetch Direto
                </button>

                <button 
                    onClick={testApiRequest}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        margin: '5px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    🔧 Teste apiRequest
                </button>

                <button 
                    onClick={testAuthService}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        margin: '5px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    🎯 Teste authService
                </button>
            </div>

            {loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    ⏳ Testando...
                </div>
            )}

            {result && (
                <div style={{
                    padding: '15px',
                    border: `1px solid ${result.success ? '#28a745' : '#dc3545'}`,
                    borderRadius: '5px',
                    backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                    marginTop: '20px'
                }}>
                    {result.success ? (
                        <>
                            <h3>✅ Sucesso!</h3>
                            <pre style={{ overflow: 'auto', fontSize: '12px' }}>
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </>
                    ) : (
                        <>
                            <h3>❌ Erro!</h3>
                            <p>{result.error}</p>
                        </>
                    )}
                </div>
            )}

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h4>📝 Informações do Teste:</h4>
                <ul>
                    <li><strong>Backend URL:</strong> http://localhost:3001</li>
                    <li><strong>Endpoint:</strong> /auth/login</li>
                    <li><strong>Email de teste:</strong> admin@test.com</li>
                    <li><strong>Senha de teste:</strong> 123456</li>
                </ul>
            </div>
        </div>
    );
};

export default LoginDebugComponent;
