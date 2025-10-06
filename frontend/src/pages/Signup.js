import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );

    if (result.success) {
      toast({
        title: 'Account created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Signup failed',
        description: result.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    setLoading(false);
  };

  return (
    <Container maxW="md" py={12}>
      <Card>
        <CardBody p={8}>
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              Create Account
            </Heading>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Join us today! Create your account to get started.
            </Text>

            <Box w="full">
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email address</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Role</FormLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="user">User</option>
                      <option value="organizer">Event Organizer</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Creating account..."
                  >
                    Create Account
                  </Button>
                </VStack>
              </form>
            </Box>

            <Text fontSize="sm" textAlign="center">
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="brand.500">
                Sign in here
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Signup;
