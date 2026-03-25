# KaryON Backend

## Quick Start (for a fresh unzip)

1. Open a terminal in this `backend` folder.
2. Install dependencies:
   `npm install`
3. Create env file:
   - Copy `.env.example` to `.env`
   - Keep defaults for local testing, or update values as needed.
4. Start server:
   `npm start`

Server runs on `http://localhost:5001` by default.
Health check: `http://localhost:5001/api/health`

## MongoDB Notes

- If local MongoDB is available, backend uses `MONGODB_URI` or the default `mongodb://127.0.0.1:27017/karyon_data`.
- If MongoDB is not installed or not running, backend automatically starts an embedded MongoDB instance so the project still works on another machine.
- This embedded database is intended for local/demo use and is not meant for production deployment.
- On the first install/run, the embedded MongoDB package may need internet access to fetch its MongoDB binary.

## Optional Database Modes

- Set `USE_EMBEDDED_DB=true` in `.env` to always use the embedded MongoDB instance.
- Set `SKIP_DB=true` only if you want to boot the API without any DB for smoke testing.

## Contact Form Emails (Gmail)

To receive contact form submissions in Gmail, set these values in `backend/.env`:

- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=your_gmail_address@gmail.com`
- `EMAIL_PASS=your_16_character_gmail_app_password`
- `CONTACT_RECEIVER_EMAIL=your_gmail_address@gmail.com` (optional; defaults to `EMAIL_USER`)

For Gmail, use an App Password (Google Account -> Security -> 2-Step Verification -> App passwords).

## Demo Data

When the embedded DB is used (no local MongoDB), demo data is seeded automatically on first startup:

| Role         | Email                | Password   |
|--------------|----------------------|------------|
| Customer     | customer@demo.com    | Demo@1234  |
| Professional | pro@demo.com         | Demo@1234  |
| Professional | pro2@demo.com        | Demo@1234  |

To seed demo data into your own local MongoDB, set `SEED_DEMO=true` in `.env` and start the server once.

## Common First-Run Issues

- `Cannot find module ...`: run `npm install` inside `backend`.
- Port already in use: change `PORT` in `.env`.
- Frontend cannot reach backend: ensure frontend uses `http://localhost:5001`.
- If embedded MongoDB cannot start, rerun `npm install` with internet enabled once so its binary can be downloaded.
