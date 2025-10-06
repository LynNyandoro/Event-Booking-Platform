import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, BellIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavLink = ({ children, to }) => (
  <Link to={to}>
    <Button variant="ghost" colorScheme="brand">
      {children}
    </Button>
  </Link>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Box bg="white" px={4} boxShadow="sm">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems="center">
            <Link to="/">
              <Text fontSize="xl" fontWeight="bold" color="brand.600" bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text">
                EventBook
              </Text>
            </Link>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink to="/">Home</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  {(user?.role === 'organizer' || user?.role === 'admin') && (
                    <NavLink to="/organizer-dashboard">Organizer</NavLink>
                  )}
                  {user?.role === 'admin' && (
                    <NavLink to="/admin-dashboard">Admin</NavLink>
                  )}
                </>
              )}
            </HStack>
          </HStack>
          <Flex alignItems="center" gap={2}>
            {isAuthenticated && (
              <>
                <IconButton
                  size="md"
                  fontSize="lg"
                  aria-label="Notifications"
                  variant="ghost"
                  color="current"
                  icon={<BellIcon />}
                />
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded="full"
                    variant="link"
                    cursor="pointer"
                    minW={0}
                  >
                    <Text fontSize="sm" fontWeight="medium">
                      {user?.name}
                    </Text>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => navigate('/dashboard')}>
                      My Dashboard
                    </MenuItem>
                    {user?.role === 'organizer' && (
                      <MenuItem onClick={() => navigate('/organizer-dashboard')}>
                        Organizer Dashboard
                      </MenuItem>
                    )}
                    {user?.role === 'admin' && (
                      <MenuItem onClick={() => navigate('/admin-dashboard')}>
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              </>
            )}

            {!isAuthenticated && (
              <HStack spacing={2}>
                <Link to="/login">
                  <Button variant="ghost" colorScheme="brand">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button colorScheme="brand">Sign Up</Button>
                </Link>
              </HStack>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <VStack as="nav" spacing={4}>
              <NavLink to="/">Home</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  {(user?.role === 'organizer' || user?.role === 'admin') && (
                    <NavLink to="/organizer-dashboard">Organizer</NavLink>
                  )}
                  {user?.role === 'admin' && (
                    <NavLink to="/admin-dashboard">Admin</NavLink>
                  )}
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/login">
                    <Button variant="ghost" colorScheme="brand" width="full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button colorScheme="brand" width="full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </VStack>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default Navbar;
