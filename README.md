# EcoTrack — Carbon Footprint Tracker

**EcoTrack** is a premium, full-stack web application designed to help individuals understand, track, and systematically reduce their daily carbon footprint. 

---

## 1. Problem Statement & Pitch
Many people want to adopt eco-friendly habits but struggle to understand the scale of their impact, which actions make the biggest difference, and how their footprint compares to sustainability thresholds. **EcoTrack** bridges this gap by converting lifestyle inputs into transparent, scientifically grounded metrics. It enables users to calculate their annual emissions profile, log daily offset habits, and set achievable reduction targets.

---

## 2. Architecture & Tech Stack

```mermaid
graph TD
  User((User))
  subgraph Frontend (React + TS)
    UI[Dashboard / Onboarding / Actions Logs]
    Chart[Recharts Visualizations]
  end
  subgraph Backend (Next.js API)
    API[REST Endpoints]
    Calc[Carbon Calculation Engine]
    Auth[JWT Session Manager]
  end
  subgraph Database Layer
    PR[Prisma ORM]
    DB[(SQLite / PostgreSQL)]
  end

  User --> UI
  UI --> Chart
  UI -->|HTTP requests| API
  API --> Calc
  API --> Auth
  API --> PR
  PR --> DB
```

### Stack Components:
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts (for data visualization), Lucide React (icons).
- **Backend**: Next.js App Router API Routes.
- **Database / ORM**: Prisma ORM with SQLite (local development) and simple transition capability to PostgreSQL (production Supabase/Neon).
- **Session / Authentication**: Custom self-contained JWT cookie-based auth (`HttpOnly`, `secure`, `SameSite=lax`).
- **Unit Testing**: Node.js test runner with custom assertions for carbon formulas.

---

## 3. Carbon Calculation Methodology & Factors
Our calculation engine is fully transparent, avoiding arbitrary metrics. Calculations use official greenhouse gas (GHG) reporting guidelines:

### A. Transportation:
- **Passenger Vehicles**: Emissions calculated per week. Petrol car: `0.170 kg/km`, Diesel: `0.171 kg/km`, Hybrid: `0.100 kg/km`, EV: `0.050 kg/km` *(reflecting average grid mix)*. [Source: UK DEFRA 2023]
- **Public Transit**: Average bus/rail: `0.050 kg/km`. [Source: UK DEFRA 2023]
- **Aviation**: Split by duration to represent short-haul vs long-haul flights:
  - Short-haul (&lt;3 hours, avg 1000km): `250 kg CO₂e` per flight. [Source: UK DEFRA 2023]
  - Long-haul (&gt;3 hours, avg 6000km): `1100 kg CO₂e` per flight. [Source: UK DEFRA 2023]

### B. Home Energy:
- We assume average household energy demands: `25 kWh/m²/year` for lighting/appliances, and `80 kWh/m²/year` for heating.
- **Electricity Tariff**: Standard grid mix: `0.370 kg/kWh` (US EPA eGRID average). Renewable/Green Tariff: `0.050 kg/kWh` lifecycle emissions.
- **Heating fuel factors**: Natural Gas: `0.180 kg/kWh`, Electricity heating: `0.370 kg/kWh`, Oil heating: `0.260 kg/kWh`, Renewable/Solar: `0.020 kg/kWh`. [Source: UK DEFRA / US EPA]

### C. Diet:
- Annual dietary footprints calculated from Poore & Nemecek (2018), published in *Science*:
  - **High Meat** (daily red meat): `2,650 kg CO₂e/yr`
  - **Mixed** (average diet): `2,055 kg CO₂e/yr`
  - **Low Meat** (occasional meat/poultry): `1,705 kg CO₂e/yr`
  - **Vegetarian**: `1,390 kg CO₂e/yr`
  - **Vegan**: `1,055 kg CO₂e/yr`

### D. Goods/Consumption:
- **Shopping Profile**: Low: `600 kg/yr`, Moderate: `1,200 kg/yr`, High: `2,000 kg/yr`.

---

## 4. Key Features
1. **Multi-Step Onboarding**: A step-by-step onboarding wizard to calculate your annual baseline emissions across Transport, Energy, Diet, and Goods.
2. **Interactive Dashboard**:
   - Compare emissions pace directly to the **4.5 tonnes global average** and the **2°C-aligned target (2.0 tonnes/year)**.
   - Recharts pie chart breakdown of emissions.
   - 7-day offset area chart showing cumulative daily savings.
   - Dynamic **"Biggest Opportunity"** box recommending high-impact actions for the user's highest emissions category.
3. **Daily Action Logging**: 
   - Add actions (e.g. walk/bike, eat a plant-based meal, line dry clothes).
   - Live calendar log that is editable (adjust offset amount or comments) and deletable.
4. **Goal Progress Widget**:
   - Set annual reduction percentage targets (e.g., 20%).
   - Dynamic progress bar showing if you are on track based on logged actions.
5. **Session Persistence**: Complete email/password register and login flow.

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd ecotrack
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment variables:
   ```bash
   copy .env.example .env
   ```
4. Build and initialize the local SQLite database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Run the calculations unit test suite:
   ```bash
   npx tsx lib/__tests__/run-tests.ts
   ```
6. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Directory Structure
```text
ecotrack/
├── app/                  # Next.js App Router (pages & API routes)
│   ├── api/              # REST Backend APIs (Auth, Profile, Activities, Goals)
│   ├── actions/          # Actions page
│   ├── dashboard/        # Dashboard analytics page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── onboarding/       # Multi-step quiz wizard
│   ├── globals.css       # Custom flat nature/eco theme variables
│   └── layout.tsx        # SEO Meta configurations & Outfit / Space Grotesk font loading
├── components/           # Reusable Client components (Navbar, Recharts)
├── lib/                  # Backend utilities (carbon formulas, prisma, jwt helper)
│   ├── __tests__/        # Carbon calculation engine unit test suites
│   ├── carbon.ts         # Math engine & action libraries
│   ├── db.ts             # Prisma client
│   └── jwt.ts            # Authentication signing
├── prisma/               # Schema configuration
└── public/               # Static assets
```

---

## 7. Future Roadmap
- **OAuth Integration**: Support Google and GitHub logins.
- **Custom Actions**: Let users define custom actions with self-declared CO2 offsets.
- **Social Benchmarks**: Share carbon reduction progress with friends or community teams.

---

## Credits & Attributions
- **UK DEFRA 2023** factors for transportation, aviation, and heating indexes.
- **US EPA Greenhouse Gas Inventory** eGRID values for electricity demand.
- **Poore & Nemecek (2018)** study on agriculture and global dietary impacts.
