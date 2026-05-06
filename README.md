# 🎬 MovieAdmin - High-Fidelity Streaming Admin Panel

MovieAdmin is an enterprise-grade administration dashboard designed for managing a movie streaming platform. This project is a pixel-perfect implementation of a Figma design, focusing on 1:1 visual fidelity, high-performance UX, and a scalable component architecture.

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) (Ultra-fast HMR)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Design Source**: Figma (Implemented with 1:1 Visual Parity)

## ✨ Key Features

### 1. Enterprise-Grade UI/UX
- **Pixel-Perfect Implementation**: All margins, paddings, colors, and typography are mapped directly from Figma specs.
- **Adaptive Layout**: A responsive sidebar-based layout with a consistent header across all management views.
- **Bento Grid Dashboard**: High-impact visual summary featuring statistical cards and a "Top Movies" ranking system.

### 2. Interactive Flow (Figma Prototype Fidelity)
- **Dynamic Routing**: Seamless navigation between Dashboard, Movie Management, Payments, Reviews, User Overview, and System Reports.
- **Advanced Modal System**: 
  - **Add/Edit Modals**: Context-aware forms for data entry and modification.
  - **Confirmation Modals**: Safety-first deletion flow with visual warnings.
- **Action Menus**: Floating "More" menus on table rows for quick access to Edit/Delete actions.
- **Image Upload System**: Interactive drag-and-drop style upload zone with real-time image preview and change capabilities.

### 3. Scalable Architecture
- **Reusable Components**: 
  - `Layout.jsx`: Standardizes the shell of the application.
  - `Modal.jsx`: A generic wrapper for all overlay content.
  - `ConfirmModal.jsx`: Specialized component for critical destructive actions.

## 📂 Project Structure

```text
figma-ui/
├── src/
│   ├── components/       # Reusable UI building blocks
│   │   ├── Layout.jsx    # Main application shell (Sidebar + Header)
│   │   ├── Modal.jsx     # Generic overlay container
│   │   └── ConfirmModal.jsx # Safety-first confirmation dialogs
│   ├── pages/            # Feature-specific views
│   │   ├── LoginPage.jsx # Entry point & authentication UI
│   │   ├── Dashboard.jsx # Main analytics overview
│   │   ├── ManageMovies.jsx # Movie library management (with Image Upload)
│   │   ├── ManagePayments.jsx # Billing & transaction history
│   │   ├── ManageReviews.jsx # User feedback & ratings
│   │   ├── ManageUsers.jsx   # User account administration
│   │   └── SystemReport.jsx  # System health & technical metrics
│   ├── App.jsx           # Main routing configuration
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles & Tailwind directives
├── index.html            # HTML entry point
├── tailwind.config.js    # Design tokens (Colors, Fonts)
└── package.json          # Dependencies & scripts
```

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (comes with Node.js)

### Installation & Execution
1. **Clone or download** the project folder.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in development mode**:
   ```bash
   npm run dev
   ```
4. **Access the app**: Open `http://localhost:5173` in your browser.

## 🎨 Design Tokens
The project uses a custom color palette defined in `tailwind.config.js` to ensure consistency:
- `figma-dark`: `#181c1d` (Primary Text/Headers)
- `figma-blue`: `#0058be` (Primary Action/Brand)
- `figma-bg`: `#f5f6f7` (Main Application Background)

## 🗺️ Future Roadmap
- [ ] Integrate with a real Backend API for CRUD operations.
- [ ] Implement State Management (e.g., Zustand or Redux) for global data.
- [ ] Add full Form Validation using React Hook Form & Zod.
- [ ] Implement Role-Based Access Control (RBAC) for different admin levels.

---
**Developed with ⚡ for Enterprise-Grade Performance.**
