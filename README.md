# Event Booking Platform

A complete Event Booking Platform built with the MERN stack (MongoDB, Express, React, Node.js).

## 🎯 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Event Management**: Create, edit, delete, and browse events
- **Ticket Booking**: Book tickets with real-time availability updates
- **Role-based Dashboards**: Different views for users, organizers, and admins
- **Notifications**: In-app notification system
- **Analytics**: Admin dashboard with charts and statistics
- **Responsive Design**: Modern UI built with Chakra UI

## 🏗️ Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- CORS enabled
- Role-based middleware

### Frontend
- React 18
- Chakra UI for components
- React Router for navigation
- Axios for API calls
- Recharts for analytics

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/event-booking
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
PORT=5000
```

4. Start the backend server:
```bash
npm start
# or for development
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## 📁 Project Structure

```
Event-Booking-Platform/
├── backend/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── index.js         # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── config/      # API configuration
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md
```

## 🎭 User Roles

### User
- Browse and search events
- Book tickets
- View personal dashboard
- Cancel bookings
- Receive notifications

### Organizer
- All user features
- Create and manage events
- View booking analytics
- Organizer dashboard

### Admin
- All organizer features
- Manage all users and events
- Platform analytics
- Admin dashboard with charts

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Events
- `GET /events/public` - Get public events (with filters)
- `GET /events/:id` - Get single event
- `GET /events` - Get organizer's events
- `POST /events` - Create event (organizer/admin)
- `PUT /events/:id` - Update event (organizer/admin)
- `DELETE /events/:id` - Delete event (organizer/admin)

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings
- `GET /bookings/:id` - Get single booking
- `PUT /bookings/:id/cancel` - Cancel booking

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `GET /notifications/unread-count` - Get unread count

### Dashboard
- `GET /dashboard/user` - User dashboard data
- `GET /dashboard/organizer` - Organizer dashboard data
- `GET /dashboard/summary` - Admin dashboard data

## 🌐 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set environment variable: `REACT_APP_API_URL=your-backend-url`
3. Deploy with build command: `npm run build`

## 🔒 Environment Variables

### Backend (.env)
```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=your-frontend-url
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=your-backend-url
```

## 📱 Features Overview

- **Event Browsing**: Search and filter events by category, date, location
- **Ticket Booking**: Real-time ticket availability and booking system
- **User Management**: Role-based access control
- **Event Management**: Full CRUD operations for organizers
- **Analytics**: Comprehensive dashboard with charts
- **Notifications**: In-app notification system
- **Responsive Design**: Mobile-friendly interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@eventbooking.com or create an issue in the repository.
