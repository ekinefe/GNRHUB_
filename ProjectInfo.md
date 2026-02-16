# **GNRHUB [v2] - Master Project Documentation**

**Goal:** Create an "Ultimate Portfolio" that showcases technical skills while hosting real SaaS products.
**Constraint:** Zero Budget (Student Project).
**Live URL:** `https://gnrhub.pages.dev/` (Previous Version)
**Projetc source:** https://github.com/ekinefe/GNRHUB_

**!!This is a stundet project so I am going with NO BUDGET for now!!**

---

## **The Projects (SaaS)**

| Project | Description | Tech Stack |
| :--- | :--- | :--- |
| **Brand Book Generator** | Users input brand details; system generates a PDF style guide with logos/colors. | React (Frontend) + Cloudflare Functions (Email) |
| **Gym Tracker** | Mobile-first app to track workouts, sets, and reps. | React + Supabase (Direct DB connection) |
| **Auto Mail Sender** | Bulk send personalized emails from Excel/CSV files. | **GitHub Actions** (Runs in background, no timeout) |
| **CV Maker** | Professional LaTeX-based CV generator. Users fill a form; server compiles `.tex` to PDF. | **Render** (Docker Microservice) |

---

## **Architecture Strategy (The "Hybrid" Stack)**

To keep costs at **$0** while handling heavy tasks, we use a hybrid approach:
* **Frontend & Light Backend:** **Cloudflare Pages**. Instant speed, handles UI and quick API calls (Auth, Data fetching).
* **Heavy Backend:** **Render**. Hosts the Docker container for LaTeX generation. Selected because it allows custom Docker containers for free.
    * *Cold Start Mitigation:* The frontend triggers a "Wake Up" ping as soon as the user enters the form to minimize the ~50s delay.
* **Background Tasks:** **GitHub Actions**. Handles long-running tasks like sending 1,000 emails or backing up the database.
* **Database:** **Supabase**. Free PostgreSQL database with built-in Authentication.

---

## **Directory Structure**

```text
GNRHUB_v2/
├── .gitignore               # Global gitignore (node_modules, .env, dist, etc.)
├── README.md                # Project documentation and setup guide
├── ProjectInfo.md           # Your personal notes
├── .github/                 # GITHUB ACTIONS (Automation)
│   └── workflows/
│       ├── gatekeeper.yml   # CI/CD: Runs tests before allowing deploy
│       ├── bulk-mail.yml    # Cron Job: Handles the Auto Mail Sender
│       └── db-backup.yml    # Cron Job: Backs up Supabase to GDrive
│
├── database/                # SQL MANAGEMENT
│   ├── schema.sql           # Database tables (Users, GymLogs, etc.)
│   ├── seeds.sql            # Dummy data for testing
│   ├── triggers.sql         # Added: Automatic "Free User" role assignment
│   ├── rpc.sql              # RPC Functions for safe JSON updates
│   └── policies.sql         # RLS Policies (Security Rules)
│
├── frontend/                # MAIN APP (Host: Cloudflare Pages)
│   ├── .env.local           # Secrets (SUPABASE_URL, RESEND_KEY)
│   ├── functions/           # CLOUDFLARE BACKEND (Serverless)
│   │   ├── api/
│   │   │   ├── gym/         # Light logic for gym stats
│   │   │   └── mail/        # Proxy for Resend API (Transactional)
│   │   └── _middleware.js   # Auth checks
│   │
│   └── src/                 # REACT FRONTEND
│       ├── lib/             # Supabase Client setup
│       ├── services/        # API calls (Auth, Render, Cloudflare)
│       ├── context/         # AuthContext (User Session)
│       ├── pages/           # Home, Dashboard, Gym, Tools
│       └── components/      # Reusable UI elements
│           ├── animations/     # React Bits (FuzzyText, Cubes, etc.)
│           └── ui/             # Shadcn / Standard Atoms
│
└── microservices/           # HEAVY BACKEND (Host: Render)
    └── cv-generator/        # Express + LaTeX App
        ├── Dockerfile       # Optimized Minimal Linux + TeXLive
        ├── server.js        # API Endpoint (POST /generate-cv)
        ├── templates/       # .tex source files (Classic, Modern)
        └── utils/           # Logic to compile LaTeX -> PDF
        
```

## **Technical Details**

### **Frontend (Cloudflare Pages)**
* **Hosting:** Cloudflare Pages (connected to GitHub).
* **Styling:** TailwindCSS.
* **Framework:** React + Vite.
    * **list of React componnets:**
        * **Text Type** - https://www.reactbits.dev/text-animations/text-type
            
            For tittles in each page.
        * **Fuzzy Text** - https://www.reactbits.dev/text-animations/fuzzy-text
            
            For [404 NOT FOUND] page
        * **Decrypted Text** - https://www.reactbits.dev/text-animations/decrypted-text
            
            in some of the text, sub ittles...
        * **Ascii Text** - https://www.reactbits.dev/text-animations/ascii-text
            
            Maybe for some part [NOT SURE YET]
        * **Electric Border** - https://www.reactbits.dev/animations/electric-border
            
            Could be use full to for some of the primarry bttons to get attention.
        * **Target Cursor** - https://www.reactbits.dev/animations/target-cursor?parallaxOn=false
            
            For buttons.
        * **Cubes** - https://www.reactbits.dev/animations/cubes
            
            in main page to feel the possibel gap on the right hand side. [ONLY FOR WIDE DESKTOP PAGE, NO FOR MOBILE VIEW]
        * **Animated List** - https://www.reactbits.dev/components/animated-list
            
            for listed cards
        * **Pixel Card** - https://www.reactbits.dev/components/pixel-card
            
            looks fancy ut I am not sure yet.
        * **Stepper** - https://reactbits.dev/components/stepper?step=3
            
            for downloading screen or to take confikartion step by step
        * **Letter Glitch** - https://reactbits.dev/backgrounds/letter-glitch
            
            for some of hte watign screen or arror pages.


### **Backend Layer 1: The "Light" API (Cloudflare Functions)**
* **Location:** Inside `frontend/functions`.
* **Role:** Handles instant user interactions.
* **Tasks:**
  * Proxy requests to Resend (to hide API keys).
  * Simple data validation before hitting Supabase.

### **Backend Layer 2: The "Heavy" Microservice (Render)**
* **Location:** `microservices/cv-generator`.
* **Role:** CPU-intensive tasks that Cloudflare cannot handle.
* **Tech:** Node.js + Docker + TeX Live (Minimal Install).
* **Why Render?** It runs Docker containers for free and keeps them awake (unlike Render).
* **Cold Start Strategy (Smart Ping):
    - Landing Page: User sees "Create Your Professional CV".
    - Wake Up: When user clicks "Start Creating", Frontend sends an async GET /ping to Render.
    - Keep Alive: While the user is filling the form, the Frontend sends a "heartbeat" GET /ping every 10 minutes.
    - Completion: User clicks "Generate" -> Server is already warm -> Instant PDF.
    -Cleanup: If user closes the tab, pinging stops, and Render sleeps after inactivity.
    
### **Backend Layer 3: Background Automation (GitHub Actions)**
* **Role:** Long-running scripts.
* **Tasks:**
  * **Bulk Mailer:** Runs a Node.js script to process CSVs and send emails sequentially.
  * **DB Backup:** Runs a script to dump Supabase data and upload to Google Drive.
* **Logic:** (The "Batch" Strategy):
    * GitHub Actions spins up a runner.
    * Fetches a Batch of 50 "pending" emails from Supabase.
    * Concurrency: Uses SQL FOR UPDATE SKIP LOCKED to ensure no two runners grab the same emails.
    * Loop: Sends emails sequentially via Resend.
    * Update: Marks the batch as sent in one transaction.
    * Result: Saves GHA minutes and handles bulk loads efficiently.

### **Required Environment Variables**

|variable   | Service   | Purpose|
|:---       |:---       |:---    |
| VITE_SUPABASE_URL	| Frontend	| Connection to DB |
| VITE_SUPABASE_ANON_KEY	| Frontend	|Public API Key |
| SUPABASE_SERVICE_ROLE	| GitHub Actions | 	Admin Access (Keep Secret!) |
| SUPABASE_JWT_SECRET	| Render	| Verifying User Tokens| 
| RESEND_API_KEY	 | Cloudflare/GHA	| Sending Emails|

### **Database (Supabase)**
* **Type:** PostgreSQL.
* **Auth:** Handled natively by Supabase (Google Login + Email/Password).
* **Security:** Row Level Security (RLS) ensures users only access their own data.
* **Table:** 
    * **public.progiles**
        * id: references auth.user.id
        * role: text (admin, tester, pro, free)
        * usage_metadata: JSONB (Stores counters like {"mails_sent": 10})
        * preferences: JSONB (Stores theme, language, etc.)
        
### **Mailing Service (Resend)**
* **Tier:** Free (3,000 emails/mo).
* **Usage:**
  * **Transactional** (Password reset, Welcome): Triggered via Cloudflare.
  * **Bulk** (Marketing/Newsletter): Triggered via GitHub Actions.

---

## **Testing & Deployment Strategy**

* **Manual Testing:** Run `npm run test:ui` locally before pushing.
* **Automated Gatekeeper:** A GitHub Action prevents deployment if tests fail.
  * **Frontend Tests:** Vitest.
  * **Backend Tests:** Node Test Runner.
* **Backup Strategy:**
  * **Code:** Private GitHub Repo.
  * **Database:** Automated SQL Dump to Google Drive (via GitHub Actions).
  
### **Usage Limits: The "PostgreSQL JSONB" Approach**
To enforce limits without extra cost, we use a single `JSONB` column in the `pubic.profiles` table.
* **Logic:** Limits are stored as a JSON object: `{"cvs_total": 5, "mails_monthly": 50}`.
* **Gatekeeping:** A **PostgreSQL Trigger** runs every time a user requests an "Action." It checks the JSON value against the user's `role`. If the limit is reached, the DB rejects the transaction before the backend even starts working.
* **Enforcement:** A PostgreSQL Trigger intercepts "Action" requests. It compares the JSON counters against the user's role level. If limits are reached, the database rejects the request, preventing the backend from wasting CPU cycles.

### **GitHub Actions: State & Mailing Strategy**
GitHub Actions is stateless, so we use Supabase as our "Progress Tracker".
* **The Flow:** 1. GHA pulls a list of "Pending" emails from the `mailing_queue` table.
    2. GHA sends **one** email via Resend.com.
    3. GHA immediately updates that specific row to `status: 'sent'` in Supabase.
    **```mailing_queue```**
        - id
        - user_id
        - recipient_mail
        - status (sent/faild)
    **workfow details:** GHA fetches 10 pending rows, sends them via Resend, and updates each to sent. If the action fails, the next run ignores finished rows and resumes from where it stopped.
    **Update:** Update the database status to 'sent' or 'failed' for the whole batch.
    **Concurrency:** Ensure you don't have two GHA runs picking up the same rows. You can do this by marking them as 'processing' immediately when fetched, or by using SKIP LOCKED in your SQL query (Supabase supports this).
        
* **Reliability:** If the GHA fails or times out, the next run simply picks up the remaining "Pending" rows. No duplicate emails are ever sent.

### **Security Handshake (Cloudflare to Render)**
Since Render's URL is public, we protect it using a **Secret Header Handshake**:
1.  **Frontend/Worker:** Adds a custom header `X-GNRHUB-KEY: {{SECRET_PASSPHRASE}}` to the request.
2.  **Render Backend:** The Express server checks this header against an Environment Variable. If they don't match, it returns `401 Unauthorized` instantly, saving CPU resources.
3.  **Verification:** Render rejects any request missing this key.
4.  **CORS Policy:** Both Cloudflare and Render are restricted to only accept traffic from gnrhub.pages.dev or authorized custom subdomains.

---

## **Authentication & User State Strategy**

### **A. Identity & Tokens (JWT)**
* **Provider:** **Supabase Auth**.
    * Supabase automatically generates, stores, and refreshes the **Access Token (JWT)** and **Refresh Token**.
    * **Frontend:** The React app uses the `supabase-js` client to manage the session (stored in `localStorage` or cookies).
    * **Backend:** We do **not** create our own tokens. We use the Supabase JWT for all verification.
    * **Requests:** Sends POST /generate with header: Authorization: Bearer <JWT_TOKEN>.
    * **Render Backend:**
        * Intercepts request.
        * Verifies JWT signature using SUPABASE_JWT_SECRET.
        * Decodes User_ID and checks the user's role/limits in the DB.
        * If Valid: Generates PDF.
        * If Invalid: Returns 401 Unauthorized.
        * If un authorised: 

#### **Role-Based-Acces-Controll (RBCA):**
Access levels are defined by a 'role' column in the public.profiles table and enforced via supabase Row Level security (RLS).

#### **Define Roles & Access Matrix**
| Role    |   Level   |   Descrip
| :--- | :--- | :--- |
|Admin  |100    |	Full system access. Can manage users, view all logs, and override any service.
|Tester  |50  |Access to "Beta" or uncompleted services for debugging. Cannot manage other users.
|Insider (Friends)  |30 |A "VIP" role for friends. Grants full access to regular services (no usage limits) but hides "Beta" dev tools.
|Pro / Paid  |20 |Regular user with a paid subscription. High usage limits and access to PDF exports.
|Free User   |10 |Can view services and dashboards but restricted from "Action" triggers (e.g., cannot click 'Generate CV' or 'Send Bulk Mail').

    there will be another section in "profile" page for "aplly for other roles"

#### **Billing & Usage Limits Integration
To prepare for future paid tiers, the 'profiles' table will track subscription status and usage counters:

* subscription_tier: (Enum: free, pro, enterprise).
* usage_metadata: (JSONB) Stores monthly counters (e.g., {"mails_sent": 45, "cvs_generated": 2}).
* Gatekeeping: Backend Cloudflare Functions will check these values against the user's role before executing heavy tasks.

#### **Enforcement Flow:**
* JWT Check: The backend verifies the user's identity.
* Role Lookup: The backend fetches the role from the profiles table.
* Permission Logic:
    * If role == 'free' and action is generate_pdf -> Return 403 (Upgrade Required).
    * If role == 'tester' and action is access_beta -> Return 200 (Success).

### **B. User Preferences (Theme, Settings, History)**
* **Storage:** We do **not** put theme data inside the JWT (to avoid stale data).
* **Database Schema:** Preferences are stored in the `public.profiles` table in Supabase.
    * **Column:** `preferences` (Type: `JSONB`).
    * **Structure:**
        ```json
        {
          "theme": "dark",
          "language": "en",
          "onboarding_completed": true,
          "dashboard_layout": "compact"
        }
        ```
* **Loading:**
    1.  User logs in.
    2.  React app fetches `user` (Identity).
    3.  React app fetches `profiles.preferences` (State) and applies the theme instantly.

### **C. Security Handshake (Protecting the Backend)**
Since our backend services (Cloudflare Functions & Render) are public APIs, we must secure them so only *our* logged-in users can use them.

**The Flow:**
1.  **Frontend (React):**
    * Gets the current session token: `supabase.auth.getSession().access_token`.
    * Attaches it to the API request header:
        `Authorization: Bearer <SUPABASE_JWT>`
2.  **Backend (Render - CV Generator):**
    * Receives the request.
    * Extracts the token from the header.
    * Verifies the signature using the **Supabase Project JWT Secret** (Environment Variable: `SUPABASE_JWT_SECRET`).
    * If valid -> Decodes the User ID -> Generates CV.
    * If invalid -> Returns `401 Unauthorized`.
    
### **D. Role Upgrade System (Self-Service)**
Users can request higher access levels (Tester/Insider) directly from their Profile page.

**Table:**
    public.role_applications
        - id, user_id
        - requested_role
        - reason
        - status (pending/approved/rejected).

    * Automated Notification: When a request is submitted, a Cloudflare Function sends an email to the Admin via Resend.com.
    * Security: A user cannot request the "Admin" role. Only "Tester" or "Insider" are visible in the dropdown.
    
### **B. Data Privacy (GDPR Compliance)**
* CSV Uploads: When users use the "Auto Mail Sender," CSV files are processed in-memory.
* Storage: We do not save user-uploaded contact lists to our database storage.
* Policy: "Data is streamed, processed, and immediately discarded."
