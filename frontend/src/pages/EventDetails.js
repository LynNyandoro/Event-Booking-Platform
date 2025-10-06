import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Badge,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, TimeIcon, EditIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [tickets, setTickets] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      toast({
        title: 'Error loading event',
        description: 'Failed to fetch event details.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleBookTicket = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to book tickets.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    onOpen();
  };

  const confirmBooking = async () => {
    try {
      setBookingLoading(true);
      await api.post('/bookings', {
        eventId: event._id,
        ticketsBooked: tickets,
      });

      toast({
        title: 'Booking successful!',
        description: `You have successfully booked ${tickets} ticket(s).`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      // Refresh event data to update available tickets
      fetchEvent();
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: error.response?.data?.message || 'Failed to book tickets.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      concert: 'purple',
      conference: 'purple',
      workshop: 'purple',
      sports: 'purple',
      festival: 'purple',
      other: 'purple',
    };
    return colors[category] || 'purple';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading event details...</Text>
      </Box>
    );
  }

  if (!event) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        Event not found.
      </Alert>
    );
  }

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';
  const isEventOrganizer = event.organizer._id === user?.id;

  return (
    <Container maxW="container.lg" py={8}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Event Image */}
        <Box>
          <Image
            src={event.image}
            alt={event.title}
            borderRadius="xl"
            boxShadow="lg"
            w="100%"
            h="400px"
            objectFit="cover"
          />
        </Box>

        {/* Event Details */}
        <VStack align="stretch" spacing={6}>
          <VStack align="start" spacing={4}>
            <HStack>
              <Badge
                colorScheme={getCategoryColor(event.category)}
                borderRadius="full"
                px={3}
                py={1}
                textTransform="capitalize"
                fontSize="sm"
              >
                {event.category}
              </Badge>
              <Badge colorScheme={event.status === 'upcoming' ? 'green' : 'red'}>
                {event.status}
              </Badge>
            </HStack>

            <Heading size="xl">{event.title}</Heading>

            <VStack spacing={3} align="start" w="full">
              <HStack>
                <CalendarIcon color="brand.500" />
                <Text fontSize="lg">{formatDate(event.date)}</Text>
              </HStack>

              <HStack>
                <TimeIcon color="brand.500" />
                <Text fontSize="lg">{event.time}</Text>
              </HStack>

              <Text fontSize="lg">📍 {event.location}</Text>

              <Text fontSize="lg">
                👤 Organized by: <strong>{event.organizer.name}</strong>
              </Text>
            </VStack>

            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              ${event.price} per ticket
            </Text>

            <Text fontSize="md" color="gray.600">
              {event.availableTickets} tickets remaining
            </Text>
          </VStack>

          {/* Action Buttons */}
          <VStack spacing={3} w="full">
            {isOrganizer && isEventOrganizer && (
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                leftIcon={<EditIcon />}
                onClick={() => navigate(`/organizer-dashboard?edit=${event._id}`)}
              >
                Edit Event
              </Button>
            )}

            {event.status === 'upcoming' && event.availableTickets > 0 && (
              <Button
                colorScheme="brand"
                size="lg"
                w="full"
                onClick={handleBookTicket}
                isDisabled={!isAuthenticated}
              >
                Book Tickets
              </Button>
            )}

            {event.availableTickets === 0 && (
              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                This event is sold out!
              </Alert>
            )}
          </VStack>
        </VStack>
      </SimpleGrid>

      {/* Event Description */}
      <Box mt={8}>
        <Card>
          <CardBody>
            <Heading size="lg" mb={4}>
              About This Event
            </Heading>
            <Text fontSize="lg" lineHeight="1.6">
              {event.description}
            </Text>
          </CardBody>
        </Card>
      </Box>

      {/* Booking Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book Tickets</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                You are booking tickets for <strong>{event.title}</strong>
              </Text>
              <Text>
                Price: <strong>${event.price}</strong> per ticket
              </Text>

              <FormControl>
                <FormLabel>Number of Tickets</FormLabel>
                <NumberInput
                  value={tickets}
                  onChange={(valueString, valueNumber) => setTickets(valueNumber)}
                  min={1}
                  max={event.availableTickets}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Text fontSize="lg" fontWeight="bold">
                Total: ${(event.price * tickets).toFixed(2)}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={confirmBooking}
              isLoading={bookingLoading}
              loadingText="Booking..."
            >
              Confirm Booking
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default EventDetails;
