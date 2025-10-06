import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import EventCard from '../components/EventCard';
import api from '../config/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'concert', label: 'Concert' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'sports', label: 'Sports' },
    { value: 'festival', label: 'Festival' },
    { value: 'other', label: 'Other' },
  ];

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (category !== 'all') params.append('category', category);

      const response = await api.get(`/events/public?${params}`);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast({
        title: 'Error loading events',
        description: 'Failed to fetch events. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, category, toast]);

  useEffect(() => {
    fetchEvents();
  }, [page, searchTerm, category, fetchEvents]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Hero Section */}
          <Box textAlign="center" py={12} bg="brand.50" borderRadius="xl" mb={8}>
            <Heading size="2xl" mb={4} color="brand.600">
              Discover Amazing Events
            </Heading>
            <Text fontSize="xl" color="brand.700" maxW="2xl" mx="auto">
              Find and book tickets for concerts, conferences, workshops, and more exciting events happening near you.
            </Text>
          </Box>

          {/* Search and Filter Section */}
          <Box bg="white" p={6} borderRadius="xl" boxShadow="md" border="2px solid" borderColor="brand.100">
            <VStack spacing={4}>
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
                <HStack spacing={4}>
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    flex={1}
                    size="lg"
                  />
                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    leftIcon={<SearchIcon />}
                  >
                    Search
                  </Button>
                </HStack>
              </form>

              <HStack spacing={4} w="full" justify="center">
                <Text fontWeight="medium">Filter by category:</Text>
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  maxW="200px"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>
              </HStack>
            </VStack>
          </Box>

          {/* Events Grid */}
          {loading ? (
            <Box textAlign="center" py={12}>
              <Spinner size="xl" color="brand.500" thickness="4px" />
              <Text mt={4} color="brand.600">Loading events...</Text>
            </Box>
          ) : events.length === 0 ? (
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              No events found. Try adjusting your search criteria.
            </Alert>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </SimpleGrid>

              {/* Pagination */}
              {totalPages > 1 && (
                <HStack justify="center" spacing={4} py={8}>
                  <Button
                    onClick={() => setPage(page - 1)}
                    isDisabled={page === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Text>
                    Page {page} of {totalPages}
                  </Text>
                  <Button
                    onClick={() => setPage(page + 1)}
                    isDisabled={page === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </HStack>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
