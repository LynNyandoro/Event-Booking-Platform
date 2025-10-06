import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  Text,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../config/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: 'Failed to fetch admin dashboard data.',
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
  }, [fetchDashboardData]);

  const COLORS = ['#9333ea', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

  const formatChartDate = (item) => {
    return `${item._id.month}/${item._id.day}`;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4}>Loading admin dashboard...</Text>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        Failed to load dashboard data.
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box bg="brand.50" p={6} borderRadius="xl" border="2px solid" borderColor="brand.100">
          <Heading size="lg" mb={2} color="brand.700">
            Admin Dashboard
          </Heading>
          <Text color="brand.600">
            Overview of platform statistics and analytics.
          </Text>
        </Box>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Users</StatLabel>
                <StatNumber>{dashboardData.summary.totalUsers}</StatNumber>
                <StatHelpText>Registered users</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Events</StatLabel>
                <StatNumber>{dashboardData.summary.totalEvents}</StatNumber>
                <StatHelpText>All events</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Bookings</StatLabel>
                <StatNumber>{dashboardData.summary.totalBookings}</StatNumber>
                <StatHelpText>Confirmed bookings</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Revenue</StatLabel>
                <StatNumber>${dashboardData.summary.totalRevenue.toFixed(2)}</StatNumber>
                <StatHelpText>Platform revenue</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Bookings Over Time */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Bookings Over Time
              </Heading>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.charts.recentBookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={formatChartDate}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value, name) => [
                        value, 
                        name === 'count' ? 'Bookings' : 'Revenue ($)'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#9333ea" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* User Role Distribution */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                User Role Distribution
              </Heading>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.charts.userStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count }) => `${_id}: ${count}`}
                      outerRadius={80}
                      fill="#9333ea"
                      dataKey="count"
                    >
                      {dashboardData.charts.userStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* Event Category Distribution */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Events by Category
              </Heading>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.charts.eventStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>

          {/* Popular Events */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Top 5 Popular Events
              </Heading>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.charts.popularEvents.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="title" 
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="totalBookings" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Popular Events Table */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Most Popular Events
            </Heading>
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Event</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Bookings</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Tickets Sold</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.charts.popularEvents.slice(0, 10).map((event, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f7fafc' }}>
                      <td style={{ padding: '12px' }}>{event.title}</td>
                      <td style={{ padding: '12px' }}>{event.totalBookings}</td>
                      <td style={{ padding: '12px' }}>{event.totalTickets}</td>
                      <td style={{ padding: '12px' }}>${event.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default AdminDashboard;
