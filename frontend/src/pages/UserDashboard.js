import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/user');
      setDashboardData(response.data);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: 'Failed to fetch dashboard data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      toast({
        title: 'Error loading bookings',
        description: 'Failed to fetch your bookings.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
    fetchBookings();
  }, [fetchDashboardData, fetchBookings]);

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    onOpen();
  };

  const confirmCancelBooking = async () => {
    try {
      setCancelling(true);
      await api.put(`/bookings/${selectedBooking._id}/cancel`);
      
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been successfully cancelled.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      fetchBookings();
      fetchDashboardData();
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error.response?.data?.message || 'Failed to cancel booking.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    return status === 'confirmed' ? 'green' : 'red';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading dashboard...</Text>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box bg="brand.50" p={6} borderRadius="xl" border="2px solid" borderColor="brand.100">
          <Heading size="lg" mb={2} color="brand.700">
            Welcome back, {user?.name}!
          </Heading>
          <Text color="brand.600">
            Here's an overview of your event bookings and activity.
          </Text>
        </Box>

        {/* Stats Cards */}
        {dashboardData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Bookings</StatLabel>
                  <StatNumber>{dashboardData.summary.totalBookings}</StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Upcoming Events</StatLabel>
                  <StatNumber>{dashboardData.summary.upcomingBookings}</StatNumber>
                  <StatHelpText>Confirmed bookings</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Spent</StatLabel>
                  <StatNumber>${dashboardData.summary.totalSpent.toFixed(2)}</StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Unread Notifications</StatLabel>
                  <StatNumber>{dashboardData.summary.unreadNotifications}</StatNumber>
                  <StatHelpText>New messages</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Recent Bookings */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Your Bookings
            </Heading>
            
            {bookings.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                You haven't made any bookings yet. Browse events to get started!
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Event</Th>
                      <Th>Date</Th>
                      <Th>Tickets</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookings.map((booking) => (
                      <Tr key={booking._id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{booking.event.title}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {booking.event.location}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>{formatDate(booking.event.date)}</Td>
                        <Td>{booking.ticketsBooked}</Td>
                        <Td>${booking.totalAmount.toFixed(2)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </Td>
                        <Td>
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              Cancel
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Recent Bookings Preview */}
        {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Recent Bookings
              </Heading>
              <VStack spacing={3} align="stretch">
                {dashboardData.recentBookings.map((booking) => (
                  <HStack key={booking._id} justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{booking.event.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(booking.event.date)} at {booking.event.time}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold">${booking.totalAmount.toFixed(2)}</Text>
                      <Badge colorScheme={getStatusColor(booking.status)} size="sm">
                        {booking.status}
                      </Badge>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Cancel Booking Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Booking</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to cancel your booking for{' '}
              <strong>{selectedBooking?.event?.title}</strong>?
            </Text>
            <Text mt={2} color="gray.600">
              This action cannot be undone and your tickets will be returned to the event.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Keep Booking
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmCancelBooking}
              isLoading={cancelling}
              loadingText="Cancelling..."
            >
              Cancel Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default UserDashboard;
