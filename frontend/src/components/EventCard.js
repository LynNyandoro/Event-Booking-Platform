import React from 'react';
import {
  Box,
  Image,
  Badge,
  Text,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { CalendarIcon, TimeIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

const EventCard = ({ event, showOrganizerActions = false, onEdit, onDelete }) => {
  
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

  return (
    <Card maxW="sm" bg="white" boxShadow="lg" borderRadius="xl" overflow="hidden">
      <Box position="relative">
        <Image
          src={event.image}
          alt={event.title}
          h="200px"
          w="100%"
          objectFit="cover"
        />
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={getCategoryColor(event.category)}
          borderRadius="full"
          px={3}
          py={1}
          textTransform="capitalize"
        >
          {event.category}
        </Badge>
      </Box>

      <CardBody>
        <VStack align="stretch" spacing={3}>
          <Heading size="md" noOfLines={2}>
            {event.title}
          </Heading>

          <Text color="gray.600" noOfLines={3}>
            {event.description}
          </Text>

          <VStack spacing={2} align="stretch">
            <HStack>
              <CalendarIcon color="brand.500" />
              <Text fontSize="sm">{formatDate(event.date)}</Text>
            </HStack>
            
            <HStack>
              <TimeIcon color="brand.500" />
              <Text fontSize="sm">{event.time}</Text>
            </HStack>
            
            <Text fontSize="sm" color="gray.600" noOfLines={1}>
              📍 {event.location}
            </Text>
          </VStack>

          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              ${event.price}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {event.availableTickets} tickets left
            </Text>
          </HStack>

          {showOrganizerActions ? (
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<EditIcon />}
                onClick={() => onEdit(event)}
                flex={1}
              >
                Edit
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => onDelete(event)}
                flex={1}
              >
                Delete
              </Button>
            </HStack>
          ) : (
            <Button
              as={RouterLink}
              to={`/event/${event._id}`}
              colorScheme="brand"
              size="sm"
              isDisabled={event.availableTickets === 0}
            >
              {event.availableTickets === 0 ? 'Sold Out' : 'View Details'}
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default EventCard;
