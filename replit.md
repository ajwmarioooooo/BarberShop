# Blacksea Barber - Barbershop Website

## Overview

This is a full-stack web application for a barbershop called "Blacksea Barber" built with React, Express, and PostgreSQL. The application features a modern barbershop website with booking functionality, product showcase, advanced loyalty program with point tracking, and a Bulgarian-themed design with warm sand and dark colors.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI components with shadcn/ui styling
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Style**: RESTful API endpoints
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Design System
The application uses a custom Bulgarian barbershop theme with:
- **Primary Colors**: Dark Sand (#C3A873), Light Sand (#E9E1D3)
- **Accent Colors**: Deep Kelp (#2F483F), Copper (#B27A4F), Soft Black (#111111)
- **Typography**: Playfair Display (serif) for headings, Inter (sans-serif) for UI text
- **Component Library**: shadcn/ui with custom theme overrides

## Key Components

### Database Schema
- **Users**: Basic user authentication system
- **Services**: Barbershop services with multilingual support (Bulgarian/English)
- **Products**: Hair care products with pricing and ratings
- **Barbers**: Staff information and availability
- **Bookings**: Appointment scheduling system with automatic loyalty point awards
- **Cart Items**: Shopping cart functionality
- **Loyalty Customers**: Customer profiles with points, tiers, and membership details
- **Point Transactions**: Complete transaction history for earned/spent points
- **Loyalty Rewards**: Available rewards with point costs and tier requirements
- **Reward Redemptions**: Customer reward redemption history and status

### API Endpoints
- `GET /api/services` - Fetch all barbershop services
- `GET /api/products` - Fetch all products for sale
- `GET /api/barbers` - Fetch barber information
- `POST /api/bookings` - Create new appointment bookings (automatically awards loyalty points)
- Cart management endpoints
- `GET /api/loyalty/customer/:phone` - Lookup loyalty customer by phone
- `POST /api/loyalty/customer` - Register new loyalty customer
- `POST /api/loyalty/points` - Add point transaction
- `GET /api/loyalty/transactions/:customerId` - Get customer transaction history
- `GET /api/loyalty/rewards` - Fetch available rewards
- `POST /api/loyalty/redeem` - Redeem reward for points
- `GET /api/loyalty/redemptions/:customerId` - Get customer redemption history

### Frontend Components
- **Header**: Fixed navigation with mobile-responsive menu
- **Hero**: Landing section with prominent booking CTA
- **Services**: Grid display of barbershop services with booking integration
- **Products**: Product showcase with ratings and purchase options
- **Booking**: Appointment scheduling form with service/barber selection
- **About**: Company information and statistics
- **Gallery**: Image showcase of the barbershop
- **Loyalty Program**: Advanced customer rewards program with:
  - Customer registration and phone-based lookup
  - Real-time point tracking and transaction history
  - Multi-tier system (Bronze, Silver, Gold, VIP)
  - Interactive rewards catalog with redemption system
  - Automatic point awards during booking process
  - Customer dashboard with transaction history
- **Footer**: Contact information and social media links

## Data Flow

1. **Service Data**: Services, products, and barber information are fetched from PostgreSQL via Drizzle ORM
2. **Booking Flow**: Users select services and barbers, then submit booking forms which are validated and stored
3. **Loyalty Integration**: Automatic point calculation and award during booking completion
4. **Point Management**: Real-time point tracking with automatic tier progression
5. **State Management**: TanStack Query handles caching, background updates, and optimistic updates
6. **Form Handling**: React Hook Form with Zod validation for type-safe form processing

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: PostgreSQL session store

### UI/UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Icons**: Additional icons (social media)
- **Embla Carousel**: Image carousel functionality

### Development Tools
- **Vite**: Build tool with HMR and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Autoprefixer

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with Express API proxy
- **Database**: Neon Database with environment-based connection strings
- **Hot Reload**: Full-stack development with automatic reloading

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Environment**: Production environment variables for database connections

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM
- **Migrations**: Generated and applied via `drizzle-kit push`
- **Connection**: WebSocket support for Neon Database serverless functions

The application is designed as a monorepo with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The Bulgarian theme and barbershop-specific functionality are deeply integrated throughout the UI components and database schema.

## Recent Changes (January 2025)

### Compact Admin Panel & Individual Booking Management (January 30, 2025 - Evening)
- **Complete UI Overhaul**: Redesigned admin panel with clean white background and modern interface
- **Burger Menu Navigation**: Added mobile-friendly burger menu for easy navigation on all devices
- **Individual Barber Workspaces**: Created separate sections for each barber (Антонио, Искрен Минков, Габриела)
- **Compact Design**: Reduced text sizes, icon sizes, and improved border spacing throughout admin panel
- **Responsive Design**: Fixed mobile layout issues with proper spacing and overflow handling
- **Enhanced Bulk Operations**: Improved bulk booking management with mobile-optimized buttons
- **Individual Booking Controls**: Added Потвърди/Завърши/Отложи buttons for each booking in both Calendar and Bookings tabs
- **Interactive Calendar Tab**: Functional calendar view with booking management capabilities
- **Fixed Header**: Added fixed header for mobile devices with proper z-index management
- **Improved Typography**: Smaller, more compact text sizing and contrast for better space utilization
- **API Integration**: Connected barber-specific bookings endpoint with proper error handling
- **Modal & Popup Backgrounds**: Added elegant overlay backgrounds to all dialogs, popups and dropdown menus
- **Barber Name Correction**: Updated barber name from "Искрен Петров" to "Искрен Минков" in admin interface

### JSX Structure & Admin Panel Fixes (January 24, 2025 - Evening)
- **Critical JSX Repair**: Resolved all JSX syntax errors and structural problems in OwnerDashboard.tsx
- **Admin Panel Stabilization**: Restored clean tabbed interface with proper component structure
- **Time Slot Restrictions**: Confirmed past hours are correctly blocked for current day bookings
- **New API Endpoints**: Added `/api/owner/completed-bookings` and `/api/owner/customer-points` endpoints
- **Database Integration**: All admin functionality now properly connected to PostgreSQL
- **Code Cleanup**: Removed duplicated JSX elements and restored proper component organization
- **Stable Application**: All PostgreSQL integrations working correctly with no syntax errors

### Fully Functional Loyalty Program (January 24, 2025)
- **Complete Database Integration**: All loyalty program features now use PostgreSQL for data persistence
- **Smart Point System**: 1 лв = 1 point awarded ONLY when admin marks booking as "Завършена" (not during initial booking)
- **Customer Management**: Phone-based registration and lookup system with real database storage
- **Point Tracking**: Complete transaction history with automatic point calculation and tier progression
- **Functional "Check Points" Button**: Working customer lookup and point display functionality
- **Colorful Notifications**: All toast notifications now have gradient backgrounds and proper styling
- **Backend Integration**: Point award system integrated into admin booking status updates
- **Error Handling**: Proper error handling for customer lookup and registration with fallback text
- **Real-time Updates**: Database queries with proper caching and invalidation
- **Fixed Booking Deletion**: Resolved foreign key constraint issues by deleting SMS notifications first

### Enhanced UI Notifications System
- **Main Site Notifications**: All booking and loyalty program notifications have colorful gradient backgrounds
- **Admin Panel Notifications**: Enhanced with colorful gradients, borders, and shadow effects
- **Consistent Styling**: All notifications follow the same design pattern with branded colors
- **Better UX**: Clear visual feedback for success, error, and informational messages

## Recent Changes (January 2025)

### Advanced Loyalty Program Implementation
- **Database Schema**: Extended with 4 new tables for comprehensive loyalty system
- **Point System**: 1 лв = 1 point with automatic calculation during bookings
- **Tier System**: Bronze (0+), Silver (200+), Gold (500+), VIP (1000+) with automatic progression
- **Customer Management**: Phone-based lookup system with registration forms
- **Rewards Catalog**: 5 reward types including discounts, free services, and products
- **Transaction History**: Complete audit trail of all point activities
- **Booking Integration**: Automatic point awards when loyalty customers make appointments
- **Mobile-Friendly UI**: Interactive dialogs and customer dashboard with real-time updates

### Contact Information Update
- **Address**: Updated to "ул. Поп Харитон 35, 9000 Варна" in footer and contact sections

### Location Map Integration
- **Interactive Map**: Google Maps embed with custom pin styling and barbershop location
- **Custom Design**: Copper-colored pin with animated pulse effect and branded tooltip
- **Contact Cards**: Address, phone, and working hours displayed in styled cards
- **Action Buttons**: Direct links to Google Maps directions and map view
- **Navigation**: Added location section to header menu for easy access
- **Simplified Layout**: Removed transportation section for cleaner design

### Mobile UI Enhancements
- **Rewards Slider**: Mobile-friendly horizontal slider for loyalty rewards with touch/swipe support
- **Responsive Design**: Desktop shows grid layout, mobile shows smooth scrolling cards
- **Hidden Scrollbars**: Clean appearance with custom CSS for seamless mobile experience
- **Touch Navigation**: Snap-to-card scrolling for better mobile interaction

### Notification System (SMS + Email)
- **Twilio Integration**: Professional SMS service for reliable message delivery
- **SendGrid Integration**: Professional email service for beautifully formatted confirmation emails
- **Automatic Reminders**: 24-hour advance SMS reminders sent daily at 10 AM with backup checks
- **Booking Confirmations**: Instant SMS + Email confirmation when appointments are booked
- **Owner Notifications**: Real-time SMS + Email alerts to barbershop owner for new reservations
- **Bulgarian Content**: Culturally appropriate messages in Bulgarian language
- **Professional Email Templates**: Rich HTML emails with barbershop branding and complete booking details
- **Database Tracking**: Complete SMS notification history with delivery status
- **Error Handling**: Failed notification attempts logged with error details for troubleshooting
- **Admin Controls**: Manual trigger endpoints for testing and emergency notifications

### Owner Management System
- **Calendar Interface**: Complete calendar view of all appointments with filtering
- **Dashboard Analytics**: Real-time statistics for daily, weekly, monthly bookings and revenue
- **Booking Management**: Update appointment status (confirmed/completed/cancelled)
- **Customer Information**: Full customer details, service info, and custom notes
- **Today's Schedule**: Special view for current day appointments
- **Status Tracking**: Visual status indicators and easy status updates