# Orbitra AI Travel Itinerary

A MERN application for uploading travel booking documents and generating AI-powered travel itineraries.

## Features

- JWT authentication with register/login
- PDF and image document uploads
- Text extraction from PDFs and OCR-ready image handling
- AI itinerary generation using OpenAI, with a rule-based fallback for local demos
- Saved itinerary history per user
- Public share links for generated itineraries
- Responsive React UI with drag-and-drop uploads
- Review-friendly backend architecture with controllers, services, models, routes, and middleware

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express.js, MongoDB, JWT
- AI: OpenAI Chat Completions API
- Uploads: Multer, PDF parsing

## Project Structure

```text
client/   React frontend
server/   Express API, MongoDB models, auth, AI services
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create `server/.env` from `server/.env.example`:

```bash
cp server/.env.example server/.env
```

3. Add your MongoDB URL and optional OpenAI API key.

4. Run the app:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## Environment Variables

Backend:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-long-secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=optional-openai-key
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## Product Flow

1. User creates an account or logs in.
2. User uploads up to 5 travel booking files.
3. Backend extracts text from PDFs and preserves image metadata for OCR extension.
4. AI service generates a structured itinerary from extracted content and notes.
5. Generated itinerary is stored in MongoDB.
6. User can revisit itinerary history and copy a public share link.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/itineraries/generate`
- `GET /api/itineraries`
- `GET /api/itineraries/:id`
- `GET /api/share/:shareId`

## Deployment

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or AWS
- Database: MongoDB Atlas
- File storage can be upgraded to AWS S3 for production.

### Suggested Live Deployment

1. Deploy `server/` on Render or Railway.
2. Add backend environment variables.
3. Deploy `client/` on Vercel.
4. Set `VITE_API_URL` to the deployed backend API URL.
5. Set backend `CLIENT_URL` to the deployed frontend URL.

## Future Enhancements

- AWS S3 storage for uploaded files
- OCR for image bookings with Google Vision, AWS Textract, or Tesseract
- Itinerary PDF export
- Collaborative trip sharing with editable permissions
- Email delivery for share links

## Submission Notes

The app is intentionally structured for easy review: routes, controllers, middleware, models, and services are separated so the backend architecture is clear.
