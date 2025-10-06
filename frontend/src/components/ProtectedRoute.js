import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Text fontSize="xl" color="red.500">
          Access Denied. You don't have permission to view this page.
        </Text>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
