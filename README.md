# SuperM

A retail management app with inventory, POS, sales, supplier tracking, expenses, and customer management.

## Local development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run start
```

Create a `.env` file inside the backend with the following values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
```

### Production deployment

Build the frontend:

```bash
cd frontend
npm install
npm run build
```

Then start the backend in production mode:

```bash
cd backend
NODE_ENV=production npm start
```

The backend will serve the React build from `frontend/build` and expose the API at `/api/*`.
