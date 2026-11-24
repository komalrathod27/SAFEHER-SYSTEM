# SafeHer – Administrator Application

The Administrator Application is the management interface of **SafeHer – Women Safety Platform**. It enables authorized administrators to manage users, monitor emergency SOS requests, review incident reports, manage safety information, and oversee platform activities.

## Overview

The Admin application is built using React and Vite and communicates with the SafeHer backend to manage platform data and operations.
It provides a centralized dashboard for monitoring and managing the Woman User and Volunteer activities.

## Features

### 1. Admin Authentication

- Dedicated Admin login.
- Secure authentication using JWT.
- Protected Admin routes.
- Admin profile management.

### 2. Admin Dashboard

- Overview of platform activities.
- Dashboard statistics.
- Centralized access to management modules.

### 3. Women Users Management

- View registered Woman Users.
- Access user information.
- Manage Woman User records.

### 4. Volunteers Management

- View registered Volunteers.
- Access volunteer information.
- Manage volunteer records.

### 5. SOS Management

- View all SOS requests.
- Monitor active SOS requests.
- View SOS request details.
- Monitor SOS history.
- Track emergency response activities.

### 6. Incident Reports Manageme

- View submitted incident reports.
- Review incident details.
- Manage report status.
- Add administrative remarks.
- Access incident report documents and PDFs.

### 7. Safety Map Management

- Manage safety-related map information.
- Maintain Safe and Caution area classifications.
- Support the platform's safety awareness features.

### 8. Safety Articles Management

- Manage safety-related articles.
- Add and maintain safety information for Woman Users.

### 9. Admin Profile

- View administrator information.
- Manage profile details.

## Technology Stack

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Leaflet
- Recharts
- SweetAlert2
- Node.js and Express.js (backend integration)
- MongoDB (database)

## Project Structure

```text
administrator/
│
├── public/
│   ├── images/
│   ├── assets/
│   ├── vendors/
│   ├── js/
│   ├── css/
│   └── fonts/
│
├── src/
│   ├── components/
│   ├── pages/
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

_Note: The structure above highlights the main application directories. Individual files may vary as the application develops._

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

The SafeHer backend and MongoDB database must also be configured and running.

### 1. Clone the Repository

```bash
git clone https://github.com/komalrathod27/SAFEHER-SYSTEM.git
```

### 2. Navigate to the Administrator Directory

```bash
cd SAFEHER-SYSTEM/administrator
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

### 5. Create a Production Build

```bash
npm run build
```

The production-ready files are generated inside the `dist/` directory.

### 6. Preview the Production Build

```bash
npm run preview
```

## Backend Integration

The Administrator Application communicates with the shared SafeHer backend.

- Admin authentication and authorization.
- User and Volunteer management.
- SOS request management.
- Incident report management.
- Safety Map data.
- Safety Articles.
- Profile operations.

Make sure the backend API is running and the frontend API configuration points to the correct backend address.

## Security

- JWT-based Admin authentication.
- Protected Admin routes.
- Role-based authorization.
- Restricted administrative operations.
- Secure backend API access.

## Related Applications

SafeHer consists of three frontend applications:

- **Administrator:** Platform management and monitoring.
- **Volunteer:** Emergency response and community assistance.
- **Woman User:** Personal safety features and emergency assistance.

All three applications communicate with the shared SafeHer backend.

## Main Repository

[SafeHer – Women Safety Platform](https://github.com/komalrathod27/SAFEHER-SYSTEM)

---

**SafeHer – Because Every Woman Deserves to Feel Safe.**
