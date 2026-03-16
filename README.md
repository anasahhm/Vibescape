# Vibescape
### Where Music Comes Together

Vibescape is a **collaborative music platform** where friends can create virtual lounges, share Spotify tracks, vote on songs, and chat in real-time.

Think of Vibescape as your **private DJ room**, where everyone in the lounge can contribute to the playlist and decide what plays next.

---

# What is Vibescape?

Vibescape allows users to listen to music together while collaborating on the playlist.

Instead of one person controlling the music, **everyone in the lounge can search for songs, add them to the queue, and vote on what should play next.**

The platform combines **music streaming, social interaction, and real-time collaboration** into a single shared experience.

---

# Key Features

### Create or Join Lounges
Users can create their own music lounges or join an existing one using a lounge code.

### Add Songs from Spotify
Search and add songs directly from the **Spotify catalog** using the Spotify Web API.

### Vote on Songs
Songs in the queue can be voted on by participants:

- **Upvote** songs you want to hear sooner
- **Downvote** songs you want to skip

Songs with higher votes move up in the queue.

### Real-time Chat
Chat with friends while listening to music in the same lounge.

The chat updates instantly using **WebSocket communication**.

---

# How It Works

1. Login using your **Spotify account**
2. Create a **music lounge** or join one using a lounge code
3. Search for songs and add them to the queue
4. Vote on songs to control playback order
5. Chat with everyone in the lounge
6. Enjoy **collaborative music listening**

---

# Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS

## Backend
- Node.js
- Express
- MongoDB

## Real-time Communication
- Socket.io

## Music Integration
- Spotify Web API

---

# Installation

Clone the repository:

```bash
git clone https://github.com/your-username/vibescape.git
cd vibescape
```

Install dependencies for the backend:

```bash
cd server
npm install
```

Install dependencies for the frontend:

```bash
cd client
npm install
```

---

# Running the Application

Start the backend server:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The application will run locally and connect to Spotify for music playback.

---

# Contributing

Contributions are welcome.

If you'd like to improve Vibescape:

1. Fork the repository
2. Create a new branch
3. Submit a pull request
