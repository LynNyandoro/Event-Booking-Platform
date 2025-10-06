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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import EventCard from '../components/EventCard';
import api from '../config/api';

const OrganizerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'other',
    image: '',
    price: 0,
    availableTickets: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/organizer');
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

  const fetchEvents = useCallback(async () => {
    try {
      setEventLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      toast({
        title: 'Error loading events',
        description: 'Failed to fetch your events.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setEventLoading(false);
    }
  }, [toast]);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      toast({
        title: 'Error loading bookings',
        description: 'Failed to fetch bookings for your events.',
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
    fetchEvents();
    fetchBookings();
  }, [fetchDashboardData, fetchEvents, fetchBookings]);

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'other',
      image: '',
      price: 0,
      availableTickets: 0,
    });
    onOpen();
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      time: event.time,
      location: event.location,
      category: event.category,
      image: event.image,
      price: event.price,
      availableTickets: event.availableTickets,
    });
    onOpen();
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await api.delete(`/events/${event._id}`);
        toast({
          title: 'Event deleted',
          description: 'Event has been successfully deleted.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchEvents();
        fetchDashboardData();
      } catch (error) {
        toast({
          title: 'Delete failed',
          description: error.response?.data?.message || 'Failed to delete event.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await api.put(`/events/${selectedEvent._id}`, formData);
        toast({
          title: 'Event updated',
          description: 'Event has been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/events', formData);
        toast({
          title: 'Event created',
          description: 'Event has been successfully created.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      fetchEvents();
      fetchDashboardData();
    } catch (error) {
      toast({
        title: selectedEvent ? 'Update failed' : 'Creation failed',
        description: error.response?.data?.message || 'Failed to save event.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
        <HStack justify="space-between">
          <Box bg="brand.50" p={6} borderRadius="xl" border="2px solid" borderColor="brand.100" flex={1} mr={4}>
            <Heading size="lg" mb={2} color="brand.700">
              Organizer Dashboard
            </Heading>
            <Text color="brand.600">
              Manage your events and track bookings.
            </Text>
          </Box>
          <Button
            colorScheme="brand"
            leftIcon={<AddIcon />}
            onClick={handleCreateEvent}
          >
            Create Event
          </Button>
        </HStack>

        {/* Stats Cards */}
        {dashboardData && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Events</StatLabel>
                  <StatNumber>{dashboardData.summary.totalEvents}</StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Upcoming Events</StatLabel>
                  <StatNumber>{dashboardData.summary.upcomingEvents}</StatNumber>
                  <StatHelpText>Active events</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

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
                  <StatLabel>Total Revenue</StatLabel>
                  <StatNumber>${dashboardData.summary.totalRevenue.toFixed(2)}</StatNumber>
                  <StatHelpText>All time</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Events Management */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Your Events
            </Heading>
            
            {eventLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="brand.500" />
                <Text mt={2}>Loading events...</Text>
              </Box>
            ) : events.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                You haven't created any events yet. Create your first event to get started!
              </Alert>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    showOrganizerActions={true}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Event Bookings
            </Heading>
            
            {bookings.length === 0 ? (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                No bookings found for your events yet.
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Event</Th>
                      <Th>Customer</Th>
                      <Th>Date</Th>
                      <Th>Tickets</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Booking Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bookings.map((booking) => (
                      <Tr key={booking._id}>
                        <Td>
                          <Text fontWeight="medium">{booking.event.title}</Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{booking.user.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {booking.user.email}
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
                        <Td>{formatDate(booking.bookingDate)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Create/Edit Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmitEvent}>
            <ModalHeader>
              {selectedEvent ? 'Edit Event' : 'Create New Event'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Event Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Time</FormLabel>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter event location"
                  />
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="concert">Concert</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="sports">Sports</option>
                      <option value="festival">Festival</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Enter image URL"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Price per Ticket ($)</FormLabel>
                    <NumberInput
                      value={formData.price}
                      onChange={(valueString, valueNumber) => setFormData({ ...formData, price: valueNumber })}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Available Tickets</FormLabel>
                    <NumberInput
                      value={formData.availableTickets}
                      onChange={(valueString, valueNumber) => setFormData({ ...formData, availableTickets: valueNumber })}
                      min={1}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="brand">
                {selectedEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default OrganizerDashboard;
