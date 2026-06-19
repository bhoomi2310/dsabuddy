# DSABuddy 🚀

**DSABuddy** is a comprehensive, premium placement preparation and coding analysis companion platform. It is designed to streamline interview prep, trace college placement history, and analyze student coding consistency.

---

## 🌟 Key Features

### 1. Company Placement Archives (PYQs) 🏢
* **Recruitment Pipelines:** Step-by-step interview process timelines (Online Assessment ➔ Technical Interviews ➔ HR / Behavioral Rounds).
* **Detailed Eligibility Check:** Granular requirements including Degrees Allowed, Eligible Branches, Minimum CGPA cutoffs, and Backlog Policies.
* **Placement History & Statistics:** Actual college placement records showing Maximum CTC, Monthly Stipends, and popular Roles Recruited.
* **Past Year Questions Database:** A searchable, categorizable archive of real interview questions filtered by difficulty (Easy, Medium, Hard) and frequency, linked directly to source platforms.

### 2. Reddit-style Interview Forum 💬
* **Rich Interactive Composer:** A spacious post editor supporting markdown-like text decorations (Bold, Italic, Code Blocks, Lists, Quotes) and Link insertions.
* **Image Upload & Preview:** Dynamic image uploader displaying instant visual previews before submission.
* **Company & Category Tags:** Filter and post experience cards categorized by tags (e.g., *Google*, *Amazon*, *Internship*, *Full-Time*).
* **Community Feed:** Browse and search detailed peer-shared interview experiences.

### 3. Analytics & Consistency Tracker 📊
* **GitHub-Style Heatmap:** Interactive consistency tracker showing daily submission grids with color-intensity representing problem-solving volume.
* **Topic & Difficulty Breakdown:** Visual insights detailing topic-wise strengths/weaknesses and difficulty ratios.
* **Solve-Count Aggregator:** Aggregated coding metrics collected from connected third-party platforms.

### 4. Competitive Leaderboard 🏆
* **Peer Comparisons:** Live student leaderboard ranking peers based on solve counts, scores, and activity.
* **Granular Filtering:** Filter ranks by college, engineering branch, or graduation year to see where you stand.

---

## 🛠️ Technology Stack

### Frontend
- **Core:** React (Vite-powered)
- **Styling:** Tailwind CSS with a curated, premium dark mode palette (Slate/Gray base with electric cyan accents)
- **State Management:** Zustand
- **Icons:** Lucide React

### Backend
- **Core:** Node.js, Express.js
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Authentication:** JWT & Google OAuth 2.0 (Passport.js)
- **File Uploads:** Cloudinary (for forum images/avatars)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Cloudinary credentials (optional for image uploads)
- Google OAuth credentials (optional for Google login)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dsabuddy.git
   cd dsabuddy
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://user:password@localhost:5432/dsabuddy?schema=public"
   JWT_SECRET="your_jwt_secret"
   FRONTEND_URL="http://localhost:5173"
   SESSION_SECRET="your_session_secret"
   
   # OAuth
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

   Run the database migrations and seed default data:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_BASE_URL="http://localhost:5001/api"
   ```

   Start the development server:
   ```bash
   npm run dev
   ```

4. **Production Build:**
   To build the production-ready assets:
   ```bash
   npm run build
   ```