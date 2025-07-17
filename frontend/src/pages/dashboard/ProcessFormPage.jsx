import React from "react";
import FullProcessCreateForm from '../../components/FullProcessCreateForm';

export default function ProcessFormPage() {
  console.log('ProcessFormPage carregado');

  return (
    <div style={{ flex: 1, padding: '32px', boxSizing: 'border-box' }}>
      <FullProcessCreateForm />
    </div>
  );
}