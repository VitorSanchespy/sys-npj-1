import {
  Header,
  Container,
  Group,
  Button,
  Menu,
  Avatar,
  UnstyledButton,
  Text,
  Transition,
  Paper,
  Stack,
  rem,
  createStyles,  // Ensure this import is here
} from '@mantine/core';
import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import cx from 'clsx';

const useStyles = createStyles((theme) => ({
  header: {
    zIndex: 1,
    width: '100%',
  },
  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: rem(60),
  },
  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
  dropdown: {
    position: 'absolute',
    top: rem(60),
    left: 0,
    right: 0,
    zIndex: 0,
    borderTop: `${rem(1)} solid ${theme.colors.gray[2]}`,
    backgroundColor: theme.white,

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.black,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colors.gray[0],
    },
  },
  linkActive: {
    backgroundColor: theme.colors.gray[1],
    color: theme.black,
  },
  user: {
    color: theme.black,
    padding: `${rem(6)} ${rem(10)}`,
    borderRadius: theme.radius.sm,

    '&:hover': {
      backgroundColor: theme.colors.gray[0],
    },
  },
  userActive: {
    backgroundColor: theme.colors.gray[1],
  },
}));

export function Navbar() {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const links = [
    { label: 'Início', link: '/home' },
    { label: 'Sobre', link: '/about' },
    { label: 'Serviços', link: '/services' },
    { label: 'Contato', link: '/contact' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('usuario'));

    if (token && user) {
      setIsLoggedIn(true);
      setUserData(user); 
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [localStorage.getItem('token'), localStorage.getItem('usuario')]);

  const navItems = links.map((link) => (
    <NavLink
      key={link.label}
      to={link.link}
      className={({ isActive }) =>
        cx(classes.link, { [classes.linkActive]: isActive })
      }
    >
      {link.label}
    </NavLink>
  ));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsLoggedIn(false);
    setUserData(null); 
    navigate('/login');
  };

  return (
    <Header height={60} className={classes.header} fixed>
      <Container className={classes.inner} role="navigation">
        <Text size="xl" fw={700}>
          Sistema NPJ
        </Text>

        <Group spacing={5} className={classes.links}>
          {navItems}
        </Group>

        <Group>
          {!isLoggedIn ? (
            <>
              <Button component={Link} to="/registrar" variant="default">
                Registrar
              </Button>
              <Button component={Link} to="/login" variant="filled">
                Login
              </Button>
            </>
          ) : (
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, {
                    [classes.userActive]: userMenuOpened,
                  })}
                >
                  <Group gap={7}>
                    <Avatar
                      src={userData?.image}
                      alt={userData?.name}
                      radius="xl"
                      size={20}
                    />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {userData?.name}
                    </Text>
                    <IconChevronDown size={12} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Configurações</Menu.Label>
                <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                  Conta
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} stroke={1.5} color="red" />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Container>

      <Transition transition="pop-top-right" duration={200} mounted={opened}>
        {(styles) => (
          <Paper className={classes.dropdown} withBorder style={styles}>
            <Stack spacing="xs">{navItems}</Stack>
          </Paper>
        )}
      </Transition>
    </Header>
  );
}
