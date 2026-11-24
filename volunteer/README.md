# SafeHer – Volunteer Application

The Volunteer Application is an important part of **SafeHer – Women Safety Platform**. It enables registered volunteers to respond to emergency SOS requests, provide assistance, and contribute to women's safety.

## Overview

The Volunteer application is developed using React and Vite. It communicates with the shared SafeHer backend to manage volunteer accounts, SOS requests, incident reports, activity records, and profile information.

## Features

### 1. Volunteer Authentication

- Volunteer registration and login.
- Secure authentication.
- Forgot password functionality.
- OTP-based password verification and reset.
- Protected Volunteer routes.
- Session management.

### 2. Volunteer Dashboard

- Overview of volunteer activities.
- Access to SOS requests and response information.
- Quick navigation to important modules.

### 3. SOS Requests

- View available emergency SOS requests.
- View SOS request details.
- Approve/Reject SOS requests.
- Share live location after approving an SOS.
- Support real-time emergency response coordination.

### 4. Incident Reports

- View submitted incident reports.
- Access incident details.
- View relevant report documents and PDFs.

### 5. My Responses

- View SOS requests responded to by the Volunteer.
- Track response information and statuses.

### 6. Trust Score

- View Volunteer trust score.
- Monitor contribution and response-related performance.

### 7. Activity History

- View previous Volunteer activities.
- Track response history.

### 8. My Badges

- View badges earned through Volunteer activities.
- Track achievements and contributions.

### 9. Profile Management

- View and update profile information.
- Manage profile photo.
- Update account details.

### 10. Notifications

- Receive platform-related notifications.

## Technology Stack

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Socket.IO Client
- SweetAlert2
- Node.js and Express.js (backend integration)
- MongoDB (database)

## Project Structure

```text
volunteer/
│
├── public/
│   ├── images/
│
│   ├── vendor/
│   ├── js/
│   ├── css/
│   └── fonts/
│
├── src/
│   ├── components/
|   ├── data/
│   ├── pages/
│   ├── utils/
│   └── volunteer-css/
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

_Note: This is a simplified representation of the main application structure._

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

### 2. Navigate to the Volunteer Directory

```bash
cd SAFEHER-SYSTEM/volunteer
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

The Volunteer Application communicates with the shared SafeHer backend.

- Volunteer registration and authentication.
- Volunteer profile management.
- SOS request retrieval and responses.
- Live location updates.
- Incident report access.
- Volunteer activity records.
- Trust Score and badge-related information.
- Notifications and real-time communication.

Make sure the backend server is running and the frontend API configuration points to the correct backend address.

## SOS Response Workflow

1. A Woman User sends an emergency SOS request.
2. The request becomes available to Volunteers.
3. A Volunteer reviews the request details.
4. The Volunteer can approve or reject the request.
5. After approval, the Volunteer shares their live location.
6. The Woman User can track the responding Volunteer.
7. The SOS request can be resolved after assistance.

## Security

- Protected Volunteer routes.
- Backend authentication and authorization.
- Password hashing.
- OTP-based password recovery.
- Restricted access to authorized operations.
- Secure API communication.

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
