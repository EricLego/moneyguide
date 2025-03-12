# MoneyGuide

MoneyGuide is a minimalistic financial dashboard web application that helps users monitor and manage their passive income streams. The app provides an intuitive interface for manually inputting income data, visualizing trends with charts and a calendar view, and offering a centralized overview of your financial situation.

## MVP Features

- **User Authentication & Account Management:**
  - Email/Password sign-up and login
  - Google OAuth for seamless registration

- **Passive Income Dashboard:**
  - Manual entry of income sources with the following fields:
    - **Source:** Description of the income stream
    - **Amount:** The income value
    - **Frequency:** How often the income is received (e.g., weekly, monthly)
  - CRUD operations for managing income records
  - Data visualizations:
    - **Line Chart:** Displaying total passive income trends over the past 6 months
    - **Calendar View:** Visualizing income events by date

- **Future Enhancements:**
  - Linking bank data to automate income tracking (a premium feature)

## Tech Stack

- **Frontend:**  
  - Next.js, React, and TypeScript  
  - Tailwind CSS for styling  
  - Chart.js or D3.js for data visualizations

- **Backend:**  
  - Next.js API routes (serverless functions) with Node.js and TypeScript  
  - JWT for secure authentication

- **Database:**  
  - MongoDB Atlas or Firestore (choose based on preference)

- **Deployment & CI/CD:**  
  - Hosted on Vercel  
  - GitHub Actions for automated testing and deployment

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or Yarn
- A MongoDB Atlas or Firestore account for your database

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/moneyguide.git
   cd moneyguide
