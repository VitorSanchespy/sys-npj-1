import { useState } from "react";
import api from "@/api/apiService";
import { useNavigate } from "react-router-dom";
import { Paper, TextInput, PasswordInput, Button, Title, Notification, Stack, Center } from '@mantine/core';
import { IconAt, IconLock, IconX } from "@tabler/icons-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.erro || "Erro ao fazer login. Verifique seus dados."
      );
    }
    setLoading(false);
  }

  function handleInput(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <Center style={{ minHeight: "100vh" }}>
      <Paper withBorder p="xl" radius="md" style={{ minWidth: 340 }}>
        <Title order={2} ta="center" mb="xl">
          Acesso ao Sistema NPJ
        </Title>
        {error && (
          <Notification
            icon={<IconX size={18} />}
            color="red"
            mb="md"
            onClose={() => setError("")}
          >
            {error}
          </Notification>
        )}
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="E-mail"
              name="email"
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={handleInput}
              leftSection={<IconAt size={16} />}
              required
            />
            <PasswordInput
              label="Senha"
              name="senha"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleInput}
              leftSection={<IconLock size={16} />}
              required
            />
            <Button type="submit" loading={loading} fullWidth>
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}