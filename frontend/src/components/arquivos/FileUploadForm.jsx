import React, { useRef, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

export default function FileUploadForm({ processoId, onUpload }) {
  const { token } = useAuthContext();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const file = fileInput.current.files[0];
    if (!file) {
      setMsg("Selecione um arquivo.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const response = await fetch(`/api/processos/${processoId}/arquivos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Erro ao enviar arquivo.");
      setMsg("Arquivo enviado com sucesso!");
      fileInput.current.value = "";
      if (onUpload) onUpload();
    } catch (err) {
      setMsg(err.message || "Erro ao enviar arquivo.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h5>Anexar novo arquivo</h5>
      {msg && <div>{msg}</div>}
      <input type="file" ref={fileInput} required />
      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}