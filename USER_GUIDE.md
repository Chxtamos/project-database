# 👤 User Portal - Developer Guide

This document provides a comprehensive overview of the user-facing side of the MovieStream platform. The User Portal is designed to provide a seamless cinematic shopping and viewing experience while maintaining the enterprise-grade aesthetic of the Admin panel.

## 🎯 User Experience Overview

The User Portal allows customers to discover movies, manage their purchases, and interact with the community through reviews.

### Core Capabilities:
- **Movie Discovery**: Browse a curated grid of movies with high-fidelity posters and quick-add to cart functionality.
- **Shopping Flow**: Integrated Cart system allowing users to manage selected movies before a final checkout.
- **Digital Library**: A personal vault of purchased movies, serving as the entry point for viewing and playlist management.
- **Personalized Playlists**: Ability to group owned movies into custom playlists for organized viewing.
- **Social Interaction**: 
  - **Review System**: Write and publish movie reviews with star ratings.
  - **Community Moderation**: Report inappropriate reviews directly to the Admin panel for moderation.

## 🛠️ Technical Implementation

### 1. State Management (`AppContext.jsx`)
To ensure "real" functionality across the frontend, we use a **React Context API** (`AppContext`) located in `src/context/`. This acts as a client-side "single source of truth" for:
- **Cart State**: Tracks movies added for purchase.
- **Library State**: Manages the list of movie IDs owned by the user.
- **Playlist State**: Stores a mapping of playlist names to movie ID arrays.
- **Review State**: Handles the list of movie reviews and their 'reported' status.

### 2. Routing Structure
The user section is isolated under the `/user` path prefix:
- `/user/home` $ightarrow$ `Home.jsx` (Storefront)
- `/user/movie/:id` $ightarrow$ `MovieDetail.jsx` (Details & Reviews)
- `/user/cart` $ightarrow$ `Cart.jsx` (Checkout process)
- `/user/library` $ightarrow$ `Library.jsx` (Owned content)
- `/user/playlists` $ightarrow$ `Playlists.jsx` (Playlist management)

### 3. Component Architecture
- **`UserLayout.jsx`**: A specialized layout providing a top-navigation experience (Search, Cart, Profile) instead of the Admin's sidebar.
- **Shared Modals**: Utilizes the same `Modal.jsx` and `ConfirmModal.jsx` as the Admin side to ensure visual consistency.

## 📂 User Folder Structure

```text
src/
├── components/
│   └── UserLayout.jsx    # User-specific Top Nav & Shell
├── context/
│   └── AppContext.jsx    # Global State (Cart, Library, Playlists)
└── pages/
    └── user/             # User Feature Modules
        ├── Home.jsx       # Catalog & Discovery
        ├── MovieDetail.jsx # Info, Reviewing & Reporting
        ├── Cart.jsx       # Checkout Flow
        ├── Library.jsx    # Personal Movie Collection
        └── Playlists.jsx  # Playlist Organization
```

## 🚀 Developer Access & Contribution

### How to run the User Portal
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Access the user home page directly: `http://localhost:5173/user/home`

### Adding a New User Feature
1. **State**: If the feature requires data (e.g., a "Wishlist"), add the state and helper functions to `AppContext.jsx`.
2. **UI**: Create a new page in `src/pages/user/` or a component in `src/components/`.
3. **Route**: Register the new path in `App.jsx` under the User Routes section.
4. **Theme**: Use Tailwind classes `bg-figma-bg`, `text-figma-blue`, and `font-inter` to stay on-brand.

---
**Design Standard**: Pixel-Perfect $ightarrow$ Enterprise-Grade $ightarrow$ High Performance.
