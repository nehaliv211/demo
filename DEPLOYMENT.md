# Deployment Guide (Hybrid: Vercel + Render/Railway)

This guide explains how to deploy your Business Billing application to production.

## Prerequisites
1.  **GitHub Account**: You must push your code to a GitHub repository.
2.  **Vercel Account**: For hosting the frontend.
3.  **Render or Railway Account**: For hosting the backend and MySQL database.

---

## Step 1: Push Code to GitHub
Ensure both your `frontend` and `backend` folders are pushed to a common repository.

---

## Step 2: Deploy the Backend & Database (Render Example)
1.  **Create a MySQL Database**:
    - In Render, click "New" -> "MySQL".
    - Copy the **External Database URL**.
2.  **Create a Web Service**:
    - Click "New" -> "Web Service".
    - Connect your GitHub repo.
    - Set **Root Directory** to `backend`.
    - Set **Start Command** to `npm start`.
    - In **Environment**, add:
        - `DATABASE_URL`: (Paste your External Database URL here)
        - `PORT`: `5000`
3.  Once deployed, copy your **Web Service URL** (e.g., `https://my-backend.onrender.com`).

---

## Step 3: Deploy the Frontend (Vercel)
1.  Go to the Vercel Dashboard and click "Add New" -> "Project".
2.  Import your GitHub repository.
3.  Set **Root Directory** to `frontend`.
4.  In **Environment Variables**, add:
    - **Key**: `VITE_API_URL`
    - **Value**: `https://my-backend.onrender.com/api/customers` (Use your URL from Step 2)
5.  Click **Deploy**.

---

## Environment Variables Summary

### Backend (Render/Railway)
| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | Your MySQL connection string |
| `PORT` | 5000 |

### Frontend (Vercel)
| Variable | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://your-backend-url.com/api/customers` |

---

## ✅ Deployment Checklist
- [ ] Database is accessible from the internet.
- [ ] Backend is running and logs "✅ Database and table ready!".
- [ ] Frontend `VITE_API_URL` is set correctly.
