import { Card, SimpleGrid, Title, Text, Image } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconFileDescription, IconUsers, IconUser, IconBuilding } from '@tabler/icons-react';

export default function Dashboard() {
  const features = [
    {
      icon: <IconFileDescription size={32} color="#25ad6a" />,
      title: "Processos Jurídicos",
      description: "Gerencie os processos do núcleo",
      link: "/processos"
    },
    {
      icon: <IconUsers size={32} color="#25ad6a" />,
      title: "Gestão de Usuários",
      description: "Administre os usuários do sistema",
      link: "/usuarios"
    },
    {
      icon: <IconUser size={32} color="#25ad6a" />,
      title: "Meu Perfil",
      description: "Atualize suas informações",
      link: "/perfil"
    },
    {
      icon: <IconBuilding size={32} color="#25ad6a" />,
      title: "Documentos",
      description: "Acesse os documentos institucionais",
      link: "/arquivos"
    }
  ];

  return (
    <div className="p-6">
      <Title order={2} mb="xl" color="ufmt-green.6">
        Painel de Controle
      </Title>
      
      <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'md', cols: 2 }]}>
        {features.map((feature, index) => (
          <Card
            key={index}
            component={Link}
            to={feature.link}
            shadow="sm"
            p="lg"
            radius="md"
            withBorder
            className="hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <Text weight={600} size="lg" mb="xs">
                {feature.title}
              </Text>
              <Text size="sm" color="dimmed">
                {feature.description}
              </Text>
            </div>
          </Card>
        ))}
      </SimpleGrid>

      <div className="mt-12">
        <Image 
          src="/npj-banner.jpg" 
          alt="NPJ UFMT" 
          radius="md"
          withPlaceholder
        />
      </div>
    </div>
  );
}