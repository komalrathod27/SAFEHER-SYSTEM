# SafeHer – Woman User Application

The Woman User Application is the primary safety interface of **SafeHer – Women Safety Platform**. It is designed to help women access emergency assistance, connect with volunteers, report incidents, manage trusted contacts, and access safety-related information.

## Overview

The Woman User application is developed using React and Vite. It communicates with the shared SafeHer backend to provide emergency SOS functionality, location tracking, incident reporting, user account management, and other safety services.

## Features

### 1. User Authentication

- Woman User registration and login.
- Secure authentication.
- Forgot password functionality.
- OTP-based password verification and reset.
- Protected application routes.
- Session management.

### 2. Home

- User-friendly home interface.
- Access to important safety features.
- Quick access to emergency assistance.
- Information about the SafeHer platform.

### 3. Emergency SOS

- Activate an emergency SOS request.
- Share current location with the platform.
- Send SOS requests to available Volunteers.
- Track the responding Volunteer after approval.
- Receive assistance through the SOS coordination workflow.

### 4. Trusted Contacts

- Add trusted contacts.
- Store contact name and relationship.
- Save contact email and optional phone number.
- View and manage saved contacts.
- Prevent duplicate trusted contact entries.

### 5. Incident Reports

- Submit incident reports.
- Provide incident-related information.
- Track submitted reports.
- View report status.
- View administrative remarks.

### 6. Safety Map

- View safety-related map information.
- Identify Safe and Caution areas.
- Access location-based safety information.

### 7. Safety Resources

- Access safety-related articles and information.
- Learn about personal safety and emergency assistance.
- Explore useful safety resources.

### 8. AI Safety Chatbot

- AI-powered safety assistance using Google Gemini.
- Ask safety-related questions.
- Access helpful safety guidance.
- Quick access to SOS and incident reporting features.
- Information about emergency helplines in India.

### 9. Profile Management

- View personal profile information.
- Update profile details.
- Manage account information.

### 10. About and How It Works

- Learn about the SafeHer platform.
- Understand how the safety features work.

## Technology Stack

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Axios
- Leaflet and React Leaflet
- Socket.IO Client
- React Markdown
- SweetAlert2
- Node.js and Express.js (backend integration)
- MongoDB (database)
- Google Gemini API (AI chatbot)

## Project Structure

```text id="q9wy3p"
women-user/
│
├── public/assets/
│   ├── images/
│   ├── bootstrap/
│   ├── owlcarousel/
│   ├── js/
│   ├── css/
│   └── webfonts/
│   └── woocommerce/
│
├── src/
│   ├── components/
│   └── data/
│   ├── pages/
│   └── safeher-css/
│   └── utils/
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

```bash id="t0v3ka"
git clone https://github.com/komalrathod27/SAFEHER-SYSTEM.git
```

### 2. Navigate to the Woman User Directory

```bash id="q2v4zt"
cd SAFEHER-SYSTEM/women-user
```

### 3. Install Dependencies

```bash id="g7r8jk"
npm install
```

### 4. Start the Development Server

```bash id="z3w6pm"
npm run dev
```

Vite will display the local development URL in the terminal.

### 5. Create a Production Build

```bash id="a5n2xq"
npm run build
```

The production-ready files are generated inside the `dist/` directory.

### 6. Preview the Production Build

```bash id="c8k4yu"
npm run preview
```

## Backend Integration

The Woman User Application communicates with the shared SafeHer backend.

- User registration and authentication.
- Profile and trusted contact management.
- SOS request creation and tracking.
- Live location updates.
- Incident report submission and retrieval.
- Safety Map information.
- Safety articles and resources.
- AI chatbot API integration.

Make sure the backend server is running and the frontend API configuration points to the correct backend address.

## SOS Workflow

1. A logged-in Woman User activates SOS.
2. Her current location is shared with the platform.
3. Available Volunteers receive the emergency request.
4. A Volunteer can approve or reject the request.
5. Once approved, the Volunteer shares their live location.
6. The Woman User can track the responding Volunteer.
7. The SOS request can be resolved after assistance.

## Emergency Helplines in India

| Helpline                   | Number |
| -------------------------- | ------ |
| Emergency Response Support | 112    |
| Women Helpline             | 181    |
| Women Police Helpline      | 1091   |

For immediate emergencies, contact the official emergency services.

## Security

- Protected user routes.
- Backend authentication and authorization.
- Password hashing.
- OTP-based password recovery.
- Restricted access to user-specific information.
- Rate limiting for chatbot requests.
- Secure handling of authentication tokens.

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
