import React, { useState, useEffect } from 'react';
import { NPJ_CONFIG } from '../../config/npjConfig';

// Componente de monitoramento de performance (apenas desenvolvimento)
export function PerformanceMonitor() {
  const [stats, setStats] = useState({
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    cacheHits: 0,
    memoryUsage: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!NPJ_CONFIG.DEV.PERFORMANCE_MONITOR) return;

    // Interceptar performance.mark para monitorar
    const originalMark = performance.mark;
    const originalMeasure = performance.measure;
    
    let requestCount = 0;
    let totalResponseTime = 0;
    let errorCount = 0;
    let cacheHitCount = 0;

    // Substituir console.log para capturar cache hits
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && args[0].includes('💾 Cache hit')) {
        cacheHitCount++;
      }
      originalLog.apply(console, args);
    };

    // Monitorar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      requestCount++;
      const start = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const end = performance.now();
        const responseTime = end - start;
        totalResponseTime += responseTime;
        
        if (!response.ok) {
          errorCount++;
        }
        
        return response;
      } catch (error) {
        errorCount++;
        const end = performance.now();
        totalResponseTime += (end - start);
        throw error;
      }
    };

    // Atualizar stats a cada 2 segundos
    const interval = setInterval(() => {
      const avgTime = requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0;
      const memUsage = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
      
      setStats({
        requests: requestCount,
        errors: errorCount,
        avgResponseTime: avgTime,
        cacheHits: cacheHitCount,
        memoryUsage: memUsage
      });
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.fetch = originalFetch;
      console.log = originalLog;
    };
  }, []);

  if (!NPJ_CONFIG.DEV.PERFORMANCE_MONITOR) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Indicador pequeno */}
      <div className="bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      {/* Painel expandido */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-xl min-w-64">
          <h3 className="text-lg font-bold mb-3 text-green-400">📊 Performance Monitor</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Requests:</span>
              <span className="font-mono text-green-400">{stats.requests}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Errors:</span>
              <span className={`font-mono ${stats.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {stats.errors}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Avg Response:</span>
              <span className={`font-mono ${stats.avgResponseTime > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                {stats.avgResponseTime}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Cache Hits:</span>
              <span className="font-mono text-blue-400">{stats.cacheHits}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className={`font-mono ${stats.memoryUsage > 100 ? 'text-yellow-400' : 'text-green-400'}`}>
                {stats.memoryUsage}MB
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              Success Rate: {stats.requests > 0 ? Math.round(((stats.requests - stats.errors) / stats.requests) * 100) : 100}%
            </div>
            <div className="text-xs text-gray-400">
              Cache Hit Rate: {stats.requests > 0 ? Math.round((stats.cacheHits / stats.requests) * 100) : 0}%
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.clearCache) window.clearCache();
              if (window.cacheStats) window.cacheStats();
            }}
            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded w-full"
          >
            Clear Cache & Show Stats
          </button>
        </div>
      )}
    </div>
  );
}

// Hook para usar o performance monitor em componentes
export function usePerformanceMonitor(componentName) {
  useEffect(() => {
    if (!NPJ_CONFIG.DEV.PERFORMANCE_MONITOR) return;
    
    const startTime = performance.now();
    performance.mark(`${componentName}-start`);
    
    return () => {
      performance.mark(`${componentName}-end`);
      performance.measure(componentName, `${componentName}-start`, `${componentName}-end`);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log se render demorar mais que 100ms
        console.warn(`⚠️ Slow render: ${componentName} took ${Math.round(renderTime)}ms`);
      }
    };
  }, [componentName]);
}

export default PerformanceMonitor;
