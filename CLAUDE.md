# MoneyGuide Developer Reference

## Project Overview
Financial dashboard webapp for tracking net worth, passive income, investments, and expenses using Next.js, React, TypeScript and MongoDB.

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Chart.js/D3.js
- **Backend**: Next.js API routes, Node.js, TypeScript, JWT authentication
- **Database**: MongoDB Atlas
- **Deployment**: Vercel, GitHub Actions for CI/CD

## Commands
- **Setup**: `npm install`
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
- **Test**: `npm test`
- **Test Single**: `npm test -- -t "test name"`
- **Lint**: `npm run lint`
- **Format**: `npm run format`

## Code Style Guidelines
- **Formatting**: Use Prettier with 2-space indentation
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces/types
- **File Structure**: Feature-based organization with domain-driven design principles
- **Imports**: Order - third-party, absolute paths, relative paths
- **Components**: Functional components with hooks, small and reusable
- **State Management**: React Context API and hooks for global state
- **Types**: Strong TypeScript typing with explicit interfaces for all data models
- **API Routes**: RESTful patterns with consistent error handling
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Error Handling**: Try/catch with custom error classes and meaningful messages

## Environment Variables
- MONGO_URI
- JWT_SECRET
- NEXT_PUBLIC_API_URL