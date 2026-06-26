# Muletr — File Upload App

A full-stack file upload application with authentication built using the **MERN stack** (MongoDB, Express, React, Node.js).

## Features

- 🔐 **User Authentication** — Register, Login, JWT token refresh
- 📤 **Avatar Upload** — Upload and manage profile pictures via Cloudinary
- 🌙 **Dark/Light Theme** — Toggle between dark and light modes
- ⭐ **Animated Background** — Floating star particle animation
- 🎨 **Minimalist Design** — Clean, modern UI with glassmorphism effects

## Tech Stack

### Frontend
- React 19 + Vite
- React Router DOM v7
- Axios (with token refresh interceptor)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication (Access + Refresh tokens)
- Cloudinary (image storage)
- Multer (file upload handling)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yunusovabdullox36-hash/multer-front.git
cd multer-front

# Install dependencies
cd client && npm install
```

### Environment Variables

The frontend connects to the backend API at:
```
https://multer-38vj.onrender.com/api
```

To change the API URL, update `client/src/services/api.js`.

### Run Development Server

```bash
cd client
npm run dev
```

### Build for Production

```bash
cd client
npm run build
```

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/upload/avatar` | Upload avatar | Yes |
| DELETE | `/api/upload/image` | Delete uploaded image | Yes |

## License

MIT
