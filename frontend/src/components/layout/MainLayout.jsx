import React from "react";
import Header from "./Header";
import Navigation from "./Navigation";
import { useAuthContext } from "../../contexts/AuthContext";

const MainLayout = ({ children, showNavigation = true }) => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Sidebar Navigation */}
      {showNavigation && (
        <aside style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e9ecef',
          boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e9ecef',
            backgroundColor: '#0066cc',
            color: 'white'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Sistema NPJ
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              opacity: 0.9
            }}>
              UFMT
            </p>
          </div>
          <Navigation />
        </aside>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: showNavigation ? '260px' : '0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Bar */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #e9ecef',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Header />
        </header>

        {/* Page Content - SEM container duplo */}
        <div style={{
          flex: 1,
          padding: '24px',
          backgroundColor: '#f8f9fa'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;