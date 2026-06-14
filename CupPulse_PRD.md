# CupPulse PRD

## Executive Summary
CupPulse is a mobile-first public web application for the FIFA World Cup that delivers real-time scores, fixtures, standings, player information, match predictions, and match summaries.

## Product Vision
The heartbeat of the World Cup.

## MVP Scope

### Public Features
- Home
- Live Matches
- Match Details
- Fixtures
- Results
- Standings
- Knockout Bracket
- Teams
- Team Details
- Players
- Player Details
- Match Predictor
- Match Summaries

### Admin Features
- Data sync monitoring
- Featured content
- Announcements
- System health

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- TanStack Query
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO

### Database
- MongoDB Atlas (MongoDB Cloud)
- Mongoose

### Hosting
- Frontend: Vercel
- Backend: Heroku

### Data Provider
- Sportmonks

## Images
- Provider media URLs
- Wikimedia Commons fallback
- Avatar placeholders

## Prediction Engine
- Internal rule-based prediction engine
- No paid AI APIs

## Core Collections
- competitions
- groups
- teams
- players
- matches
- fixtures
- standings
- predictions
- summaries
- venues

## Functional Requirements
- Real-time match updates
- Live standings updates
- Team and player pages
- Match predictions
- Match summaries
- Mobile-first responsive design

## Architecture

Users
→ Vercel Frontend
→ Heroku API
→ MongoDB Atlas

Heroku API
→ Sportmonks API

## Success Criteria
- Live scores update automatically
- Fixtures and results available
- Standings update correctly
- Predictions generated
- Match summaries generated
- Mobile experience optimized
