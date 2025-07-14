import React from 'react';

export  class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h1>Algo deu errado</h1>
          <p>Por favor, recarregue a página ou tente novamente mais tarde.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;