# Flipcart - Full Stack E-commerce Application

A full-stack e-commerce platform built with React (Vite), Node.js, Express, and MySQL.

## 📁 Project Structure

- `/client`: Frontend built with React, Vite, and Tailwind CSS.
- `/server`: Backend API built with Node.js, Express, and MySQL2.
- `/db`: Database initialization scripts and backups.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) or [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Database Setup

#### Option A: Using Docker (Recommended)
If you have Docker installed, simply run:
```bash
docker-compose up -d
```

#### Option B: Manual MySQL Setup
1. Create a database named `flipcart`.
2. Import the `grocery new drs.sql` or `db/init/dump.sql` file.

### 3. Server Setup (Backend)
1. Go to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### 4. Client Setup (Frontend)
1. Go to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment
- **Backend**: Deploy the `server` folder to Vercel (include `vercel.json`).
- **Frontend**: Deploy the `client` folder to Vercel (Framework: Vite).
- **Database**: Use a cloud provider like Aiven or PlanetScale.


INSERT INTO tbl_users
  (name, username, password, role_id, last_logged_in, last_login_offset, insert_at, phone, email, token, otp)
VALUES
  ('kp', 'krishvadsak45@gmail.com', 'krish123', 2, NULL, NULL, NOW(), '9999999999', 'krishvadsak45@gmail.com', NULL, NULL);

ALTER TABLE tbl_settings 
ADD COLUMN show_paytm TINYINT(1) DEFAULT 1,
ADD COLUMN show_phonepe TINYINT(1) DEFAULT 1;