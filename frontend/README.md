# Frontend - Document Q&A System

React-based frontend for the Document Q&A System.

## Features

- 🎨 Modern, responsive UI with gradient design
- 💬 Real-time question input and answer display
- 📜 Browsable question history
- 🔄 Loading states and error handling
- 📱 Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Backend server running on http://localhost:3000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Access at: http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── QuestionInput.tsx      # Question input form
│   ├── QuestionInput.css
│   ├── AnswerDisplay.tsx      # Answer and sources display
│   ├── AnswerDisplay.css
│   ├── HistoryPanel.tsx       # Q&A history sidebar
│   └── HistoryPanel.css
├── services/
│   └── api.ts                 # API service layer
├── App.tsx                     # Main application
├── App.css
├── main.tsx                    # Entry point
└── index.css                   # Global styles
```

## API Configuration

To change the backend URL, edit `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

## Components

### QuestionInput
- Text input for questions
- Submit button with loading state
- Disabled during processing

### AnswerDisplay
- Question display
- AI-generated answer
- Source chunks with metadata

### HistoryPanel
- List of recent questions
- Click to view previous Q&A
- Scrollable with custom styling

## Styling

- Uses CSS variables for theming
- Gradient backgrounds
- Smooth animations and transitions
- Custom scrollbar styling
- Responsive breakpoints at 1024px and 768px

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling with animations
