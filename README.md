# SuperM

<p align="center">
  <img src="frontend/public/favicon.svg" alt="SuperM logo" width="120" />
</p>

<p align="center">
  <strong>Retail operations made simple.</strong>
</p>

SuperM is a complete retail management application built to help businesses manage inventory, point-of-sale transactions, sales tracking, supplier records, expenses, and customer relationships from a single system.

## Overview

SuperM brings together the core workflows needed to run a modern retail business:

- Inventory and product management
- POS checkout workflow
- Sales history and reporting
- Supplier and purchase tracking
- Expense monitoring
- Customer management
- Secure authentication and protected routes

## Tech stack

- Frontend: React, JavaScript, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- Product image storage: Supabase Storage (legacy local product image URLs remain supported)

## Features

### Store management
- Track products, pricing, stock levels, and product details
- Manage supplier information and purchase relationships
- Monitor operating expenses and profit metrics

### Sales and POS
- Process point-of-sale transactions quickly
- Review sales history and transaction details
- Analyze profit trends across products and periods

### Customer and business operations
- Maintain customer records
- Access secure protected admin routes
- Use a clean dashboard to monitor business performance

### Platform owner management
- Sign in separately at `/owner` with the platform owner account
- Review businesses, users, branches, license status, and system activity
- Search and filter businesses, manage branches, and suspend or reactivate accounts
- Owner credentials are provisioned from backend environment variables; there is no public owner signup

### License management
- Issue one license per business with a generated key, plan, start date, and expiry date
- Suspend or reactivate licenses, extend expiry dates, and change plans from the owner console
- Business users activate their assigned key from the license screen before opening retail features
- Protected retail APIs verify license status and dates on every request; expired, suspended, and unlicensed businesses are blocked
- Electron uses the same activation screen and backend verification as the web application

## Local development

### 1) Backend setup

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend setup

```bash
cd frontend
npm install
npm run start
```

### 3) Environment configuration

Create a `.env` file in the `backend` folder with the following values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
OWNER_EMAIL=owner@example.com
OWNER_PASSWORD=use-a-long-unique-password
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_backend_service_role_key
```

> Replace the MongoDB connection string and JWT secret with your real credentials before starting the app. Set a unique owner email and strong password; the backend creates the owner account on first startup and stores the password as a bcrypt hash. Changing `OWNER_PASSWORD` does not reset an already-provisioned owner's password.
> Product image uploads use the backend-only Supabase service role key. The backend creates a public `product-images` bucket on first upload when needed. Never add this key to frontend environment variables or client-side code.

## Production deployment

### Build the frontend

```bash
cd frontend
npm install
npm run build
```

### Run the backend in production mode

```bash
cd backend
NODE_ENV=production npm start
```

The backend serves the React production build from `frontend/build` and exposes the API at `/api/*`.

### Personal desktop installer

The current personal-use installer bundles the local backend and `backend/.env` so the installed app can connect to its configured MongoDB database, Supabase Storage, and license service. The environment file contains private credentials; use the installer only on a computer you control and never distribute it to customers. Customer distribution requires a separately hosted API and a build that excludes backend secrets.

The installer version is read from the root `package.json`. Run `npm run dist` to build the Windows installer and portable app in `dist-1.10.0-final`.

## Project structure

```text
SuperM-main/
├── backend/
│   ├── src/
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── database/
├── README.md
└── .gitignore
```

## License

This project is intended for educational and business-use prototype development. Please confirm licensing requirements before using it in production.
