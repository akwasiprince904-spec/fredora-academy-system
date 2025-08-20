# Fredora's Academy Management System (Web App)

A comprehensive school management system designed specifically for Fredora's Academy in Ghana, serving students from Nursery to JHS 3.

## 🎯 Project Overview

Fredora's Academy Management System is a web application that provides complete school management capabilities with a focus on the Ghanaian education system. The system features a modern wine and white color scheme, secure authentication, and comprehensive academic management tools.

## 🏗️ Architecture

### Frontend (React.js)
- **Framework**: React 18 with React Router DOM
- **Styling**: Styled Components with custom wine/white theme
- **Animations**: Framer Motion for smooth UI transitions
- **State Management**: React Query for server state, Context API for auth
- **UI Components**: React Icons, React Toastify, React Hook Form
- **Charts & Reports**: Chart.js, jsPDF for PDF generation

### Backend (Node.js)
- **Framework**: Express.js with RESTful API design
- **Database**: SQLite with Knex.js ORM
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Validation**: Express Validator and Joi for input validation
- **Security**: Helmet, CORS, Rate limiting, Input sanitization

### Database Schema
- **Users**: Admin and Teacher accounts with role-based access
- **Students**: Comprehensive student records with Ghanaian ID format (FA[YEAR][SEQUENTIAL_NUMBER])
- **Classes**: Ghana education system classes (Creche, KG1-2, Grade 1-6, JHS 1-3)
- **Subjects**: Academic subjects with core/elective classification
- **Attendance**: Daily attendance tracking with multiple status options
- **Fees**: Fee structures and payment management
- **Grades**: Academic grading with 60% Exam + 40% CA weighting
- **Settings**: System configuration and school information

## 🚀 Current Development Status

### ✅ Completed Components

#### Frontend Pages
1. **Login Page** (`/login`)
   - Beautiful wine/white themed login interface
   - Form validation with React Hook Form
   - Password visibility toggle
   - Demo credentials for testing

2. **Admin Dashboard** (`/admin`)
   - Overview statistics (students, teachers, revenue, attendance)
   - Quick action cards for all major functions
   - Recent activity feed
   - Responsive design with animations

3. **Teacher Dashboard** (`/teacher`)
   - Teacher-specific statistics and assigned classes
   - Quick actions for common teacher tasks
   - Class overview with student counts and next sessions
   - Role-based access control

4. **Student Management** (`/students`)
   - Comprehensive student listing with search and filters
   - Sortable columns and pagination
   - Student status management (active/inactive)
   - Action buttons for view, edit, delete operations

5. **Student Enrollment** (`/students/add`)
   - Multi-section enrollment form
   - Photo upload with preview
   - Form validation and progress tracking
   - Auto-generated student IDs

6. **Attendance Management** (`/attendance`)
   - Daily attendance tracking interface
   - Class-based attendance marking
   - Multiple attendance statuses (present, absent, late, excused)
   - Attendance reports and statistics

7. **Fee Management** (`/fees`)
   - Payment tracking and management
   - Fee structure management
   - Financial statistics and reports
   - Tabbed interface for different fee operations

#### Backend Infrastructure
1. **Database Setup**
   - Complete migration files for all tables
   - Seed data for users, classes, subjects, and settings
   - Proper foreign key relationships and constraints

2. **Authentication System**
   - JWT-based authentication with middleware
   - Role-based access control (Admin/Teacher)
   - Password hashing with bcryptjs
   - Token verification and user session management

3. **API Controllers**
   - Authentication controller (login, logout, profile management)
   - Students controller (CRUD operations, bulk import, statistics)
   - Database connection and configuration

4. **Security Middleware**
   - Token authentication middleware
   - Role and permission checking
   - Class and student access control
   - Input validation and sanitization

### 🎨 Design System

#### Color Palette
- **Primary**: Wine (#722F37)
- **Secondary**: White (#FFFFFF)
- **Accent**: Darker Wine (#8B3D47)
- **Light Wine**: (#A0525D)

#### Typography
- **Font Family**: Poppins, Inter, sans-serif
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and micro-interactions

#### Components
- **Cards**: Consistent styling with hover effects
- **Buttons**: Multiple variants (primary, secondary, success, danger)
- **Forms**: Validated inputs with error states
- **Tables**: Sortable, filterable, and paginated
- **Modals**: Overlay dialogs for actions
- **Alerts**: Toast notifications for user feedback

## 🔧 Technical Features

### Ghana Education System Integration
- **Class Structure**: Creche, KG1-2, Grade 1-6, JHS 1-3
- **Student IDs**: Auto-generated FA[YEAR][SEQUENTIAL_NUMBER] format
- **Grading System**: 60% Final Exam + 40% Continuous Assessment
- **Academic Terms**: First Term, Second Term, Third Term
- **Currency**: Ghanaian Cedi (GHS)

### Security Features
- **Authentication**: JWT tokens with secure storage
- **Authorization**: Role-based access control
- **Input Validation**: Server-side validation with error handling
- **Rate Limiting**: API protection against abuse
- **Password Security**: Bcrypt hashing with salt rounds

### Performance Optimizations
- **React Query**: Efficient data fetching and caching
- **Lazy Loading**: Code splitting for better performance
- **Optimized Images**: Sharp for image processing
- **Database Indexing**: Proper indexes for fast queries

## 📱 User Experience

### Admin Features
- **Dashboard**: Overview of school statistics and recent activities
- **Student Management**: Complete student lifecycle management
- **Fee Management**: Financial tracking and reporting
- **System Settings**: Configuration and customization
- **Reports**: Academic and financial reporting

### Teacher Features
- **Class Management**: View assigned classes and students
- **Attendance**: Mark and track daily attendance
- **Grades**: Enter and manage student grades
- **Reports**: Generate class-specific reports

### Responsive Design
- **Mobile**: Optimized for mobile devices
- **Tablet**: Touch-friendly interface
- **Desktop**: Full-featured desktop experience
- **Print**: Print-optimized styles for reports

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fredora-academy-system
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd web-app/frontend
   npm install

   # Backend dependencies
   cd ../backend
   npm install
   ```

3. **Database setup**
   ```bash
   # Run migrations
   npm run migrate

   # Seed initial data
   npm run seed
   ```

4. **Start development servers**
   ```bash
   # Backend (from backend directory)
   npm run dev

   # Frontend (from frontend directory)
   npm start
   ```

### Demo Credentials
- **Admin**: admin@fredora.com / admin123
- **Teacher**: teacher@fredora.com / teacher123

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `students` - Student records and information
- `classes` - Academic classes and levels
- `subjects` - Academic subjects and courses
- `attendance` - Daily attendance records
- `fees` - Fee structures and amounts
- `payments` - Student fee payments
- `grades` - Academic grades and assessments
- `settings` - System configuration

## 🔮 Future Development

### Planned Features
1. **Advanced Reporting**: Custom report builder
2. **Communication Module**: SMS/Email notifications
3. **Library Management**: Book tracking and borrowing
4. **Transport Management**: Bus routes and tracking
5. **Inventory Management**: School supplies and equipment
6. **Parent Portal**: Parent access to student information

### Technical Enhancements
1. **Real-time Updates**: WebSocket integration
2. **File Upload**: Document and image management
3. **API Documentation**: Swagger/OpenAPI specs
4. **Testing**: Unit and integration tests
5. **CI/CD**: Automated deployment pipeline
6. **Monitoring**: Application performance monitoring

## 🤝 Contributing

This project is developed for Fredora's Academy. For contributions or questions, please contact the development team.

## 📄 License

This project is proprietary software developed for Fredora's Academy. All rights reserved.

---

**Fredora's Academy Management System** - Excellence in Education Management
