import { useEffect, useState } from "react";
import { Paper, Title, Text, Group, Loader, Button } from "@mantine/core";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/api/apiService";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/auth/perfil")
      .then(({ data }) => setProfile(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!profile) return <Text>Perfil não encontrado.</Text>;

  return (
    <Paper withBorder p="xl" radius="md">
      <Title order={2} mb="md">Meu Perfil</Title>
      <Group direction="column" spacing="xs">
        <Text><b>Nome:</b> {profile.nome}</Text>
        <Text><b>Email:</b> {profile.email}</Text>
        <Text><b>Papel:</b> {profile.role}</Text>
      </Group>
      <Button mt="lg" color="red" onClick={logout}>
        Sair
      </Button>
    </Paper>
  );
}