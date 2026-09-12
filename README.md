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
- File storage: Local uploads for product and profile images

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
```

> Replace the MongoDB connection string and JWT secret with your real credentials before starting the app.

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
