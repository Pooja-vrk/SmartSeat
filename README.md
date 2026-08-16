# SmartSeat - Dynamic Passenger-Aware Bus Booking Platform

A modern bus-booking platform with SmartSeat technology - a dynamic passenger-aware seating system that provides real-time adjacent seat monitoring and intelligent seat recommendations.

## 🚀 Features

### SmartSeat Core Technology
- **Dynamic Adjacent Seat Monitoring**: Real-time detection when adjacent seats are booked
- **Intelligent Seat Recommendations**: AI-powered seat suggestions based on preferences
- **Privacy-First Design**: Comfort and preference-driven without unnecessary personal data exposure
- **Real-Time Notifications**: Socket.IO-powered instant alerts for seat changes
- **Flexible Seat Management**: Passengers can change seats based on recommendations

### Platform Features
- **Bus Search & Filtering**: Find buses by route, date, type, and price
- **Interactive Seat Selection**: Visual seat map with real-time availability
- **Secure Booking**: Atomic seat reservation preventing double-booking
- **Multiple Payment Options**: Payment gateway ready architecture
- **Admin Dashboard**: Complete management interface for buses, bookings, and analytics
- **Passenger Dashboard**: Booking management, notifications, and preferences

## 🏗️ Architecture

```
SmartSeat/
├── src/                          # React Frontend
│   ├── components/              # UI Components
│   ├── pages/                   # Page Components
│   ├── services/                # API Service Layer
│   ├── context/                 # State Management
│   ├── data/                    # Mock Data
│   └── ...
│
├── server/                       # Node.js Backend
│   ├── config/                  # Configuration
│   ├── controllers/             # Request Handlers
│   ├── middleware/              # Express Middleware
│   ├── models/                  # Mongoose Models
│   ├── routes/                  # API Routes
│   ├── services/                # Business Logic
│   ├── sockets/                 # Socket.IO Real-time
│   ├── utils/                   # Utilities
│   ├── validators/              # Input Validation
│   ├── seed/                    # Database Seeding
│   ├── app.js                   # Express App
│   └── server.js                # Server Entry
│
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Socket.IO
- bcryptjs
- Express Validator

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm
- MongoDB Atlas account
- Git

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SmartSeat
```

### 2. Frontend Setup
```bash
npm install
```

### 3. Backend Setup
```bash
cd server
npm install
cd ..
```

### 4. Environment Configuration

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend (server/.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartseat?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SEAT_RESERVATION_EXPIRY=15
```

### 5. MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Update `server/.env` with your `MONGODB_URI`

### 6. Database Seeding

```bash
npm run backend:seed
```

This will create:
- 1 Admin user
- 3 Passenger users
- 3 Buses
- 2 Routes
- 3 Schedules
- Seat layouts for all schedules
- SmartSeat preferences
- Sample booking (Passenger A on seat 12A)

### Development Credentials
```
Admin:
  Email: admin@smartseat.com
  Password: admin123

Passenger A (has booking on 12A):
  Email: passengera@test.com
  Password: pass123

Passenger B:
  Email: passengerb@test.com
  Password: pass123

Passenger C:
  Email: passengerc@test.com
  Password: pass123
```

## 🚀 Running the Application

### Development Mode

#### Start Frontend
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

#### Start Backend
```bash
npm run backend:dev
```
Backend runs on: http://localhost:5000

### Production Mode

#### Build Frontend
```bash
npm run build
```

#### Start Backend
```bash
npm run backend:start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Buses
- `GET /api/buses/search` - Search buses with filters
- `GET /api/buses/:id` - Get bus details
- `GET /api/buses/:id/seats` - Get seat layout
- `GET /api/buses/routes` - Get all routes
- `GET /api/schedules/:id` - Get schedule details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/change-seat` - Change seat
- `POST /api/bookings/check-availability` - Check seat availability
- `GET /api/bookings/available-seats/:scheduleId` - Get available seats
- `PATCH /api/bookings/:id/smartseat-monitoring` - Update SmartSeat monitoring

### Recommendations
- `GET /api/bookings/recommendations/seats` - Get seat recommendations
- `GET /api/bookings/recommendations/seats/:seatNumber` - Get seat details

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/buses` - Get all buses
- `POST /api/admin/buses` - Create bus
- `PATCH /api/admin/buses/:id` - Update bus
- `DELETE /api/admin/buses/:id` - Delete bus
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/passengers` - Get all passengers
- `GET /api/admin/notifications` - Get notification logs
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/settings` - Get settings
- `PATCH /api/admin/settings` - Update settings

## 🔌 Socket.IO Events

### Client → Server
- `join:booking` - Join booking-specific room
- `leave:booking` - Leave booking-specific room
- `seat:selected` - Emit seat selection update

### Server → Client
- `smartseat:adjacent-seat-booked` - Adjacent seat booking notification
- `notification:new` - New notification
- `seat:updated` - Seat status update
- `booking:updated` - Booking status update

## 🧪 SmartSeat Workflow

### Core Scenario

1. **Passenger A books seat 12A**
   - Seat 12A is marked as booked
   - Seat 12B is available
   - Passenger A has SmartSeat monitoring enabled

2. **Passenger B books seat 12B**
   - Backend validates and reserves 12B atomically
   - Booking is created for Passenger B
   - 12B is marked as booked
   - SmartSeat service detects adjacent passenger in 12A
   - Notification is created for Passenger A
   - Socket.IO event is emitted to Passenger A
   - SeatChangeHistory is recorded

3. **Passenger A receives notification**
   - "Your adjacent seat 12B has been booked"
   - Passenger A can choose to keep seat or find alternative

4. **Passenger A requests recommendations**
   - Backend evaluates available seats
   - Provides ranked recommendations based on preferences
   - Shows reasons for each recommendation

5. **Passenger A changes seat**
   - Backend validates availability atomically
   - Releases old seat (12A)
   - Reserves new seat
   - Updates booking
   - Records seat change history
   - Emits socket events

## 🔒 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Role-based authorization
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection

## 📊 Database Models

- **User** - User accounts and profiles
- **Bus** - Bus information and configuration
- **Route** - Route details and stops
- **Schedule** - Bus schedules and pricing
- **Seat** - Seat availability and status
- **Booking** - Booking records and status
- **Notification** - User notifications
- **SmartSeatPreference** - User SmartSeat preferences
- **SeatChangeHistory** - Seat change audit trail

## 🧪 Testing

### Seed Data Testing
```bash
npm run backend:seed
```

This creates test data for:
- Bus search functionality
- Seat selection
- SmartSeat adjacent seat detection
- Booking flow
- Admin dashboard

### Core Test Scenario
1. Login as Passenger A
2. Verify 12A is already booked (from seed)
3. Login as Passenger B
4. Book seat 12B
5. Verify Passenger A receives SmartSeat notification
6. Get seat recommendations for Passenger A
7. Change seat for Passenger A
8. Verify seat change history is recorded

## 🚢 Deployment

### Environment Variables Required
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend URL for CORS
- `SOCKET_CORS_ORIGIN` - Socket.IO CORS origin

### Deployment Steps
1. Set up MongoDB Atlas cluster
2. Configure environment variables
2. Build frontend: `npm run build`
3. Deploy backend to hosting platform
4. Deploy frontend to hosting platform
5. Update CORS origins in production

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Additional error details"
}
```

## 🤝 Contributing

This is a demonstration project for the SmartSeat Dynamic Passenger-Aware Seating system.

## 📄 License

ISC

## 👥 Development Team

SmartSeat Development Team
