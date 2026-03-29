# CoolRentals & Services - Frontend

A full-stack web application for AC rentals and services. This is the frontend built with React, Tailwind CSS, and Framer Motion.

## Features

- **AC Rentals**: Browse and rent ACs on monthly, quarterly, and yearly bases
- **AC Services**: Book repair and maintenance services
- **User Dashboard**: Manage rentals and service requests
- **Vendor Dashboard**: Manage AC listings and service leads
- **Responsive Design**: Fully functional on all device sizes
- **Authentication**: Secure login/signup with role-based access
- **Password Features**: Show/hide password toggle and forgot password functionality

## Tech Stack

- React.js
- Tailwind CSS
- Framer Motion (animations)
- React Context API (state management)
- Axios (for API calls - ready to use)
- Lucide React (icons)
- React Router DOM (routing)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Demo Credentials

### User Account
- Email: `user@example.com`
- Password: `password`

### Vendor Account
- Email: `vendor@example.com`
- Password: `password`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.js
│   ├── Footer.js
│   ├── ACCard.js
│   ├── PasswordInput.js
│   └── ProtectedRoute.js
├── context/            # Context API for state management
│   └── AuthContext.js
├── pages/              # Page components
│   ├── Home.js
│   ├── BrowseACs.js
│   ├── ACDetail.js
│   ├── Login.js
│   ├── Signup.js
│   ├── ForgotPassword.js
│   ├── About.js
│   ├── Contact.js
│   ├── user/           # User-specific pages
│   │   ├── UserDashboard.js
│   │   └── ServiceRequest.js
│   └── vendor/         # Vendor-specific pages
│       ├── VendorDashboard.js
│       ├── AddAC.js
│       ├── ManageACs.js
│       └── Leads.js
└── services/          # API service layer
    └── dummyData.js   # Dummy data (easy to replace with real API)
```

## Dummy Data

The application currently uses dummy data located in `src/services/dummyData.js`. This is designed to be easily replaced with actual API calls. All functions return promises to simulate API behavior.

To connect to your backend:
1. Update the `apiService` object in `src/services/dummyData.js`
2. Replace the dummy functions with actual Axios calls to your backend API
3. Update the API endpoints as needed

## Features Implemented

### Authentication
- ✅ Login/Signup with role selection
- ✅ Password show/hide toggle
- ✅ Forgot password functionality
- ✅ Protected routes based on user role
- ✅ Persistent authentication (localStorage)

### User Features
- ✅ Browse ACs with advanced filters
- ✅ View AC details
- ✅ Submit rental inquiries
- ✅ Request AC services
- ✅ View dashboard with rentals and service history

### Vendor Features
- ✅ Vendor dashboard with statistics
- ✅ Add new AC listings
- ✅ Manage AC listings (view, edit, update status)
- ✅ View and manage service leads
- ✅ Update lead status

### UI/UX
- ✅ Fully responsive design
- ✅ Smooth animations with Framer Motion
- ✅ Modern, professional design
- ✅ Accessible forms and components
- ✅ Loading states and error handling

## Color Theme

- Primary Blue: `#2563eb`
- Secondary Blue: `#60a5fa`
- Light Background: `#f0f9ff`
- Dark Text: `#1e293b`
- Light Text: `#64748b`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Notes

- All dummy data is stored in `src/services/dummyData.js` and can be easily replaced with real API calls
- The application uses localStorage for authentication persistence
- All routes are protected based on user roles
- Images use placeholder URLs from Unsplash - replace with actual image URLs in production

## Next Steps

1. Connect to your Node.js backend API
2. Replace dummy data with actual API calls
3. Add image upload functionality
4. Implement payment gateway (if needed)
5. Add email notifications
6. Deploy to production
