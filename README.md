# കളം | 📋 Google Sheet Checklist

**കളം** (pronounced *kalam*) is a sleek web app for managing checklists directly from Google Sheets. It connects to a shared spreadsheet and provides a beautiful, collapsible interface for activity tracking — ideal for outreach teams, clubs, or any collaborative workflows.

---

## ✨ Features

- ✅ Interactive checklist UI synced with Google Sheets
- 🔒 Role-based edit access (only editable rows can be changed)
  - Add `[!]` to the name of acitivity for it to uneditable
- 📁 Collapsible activity groups for better UX

---

## 🔧 Setup

### 1. Clone this repo

```bash
git clone https://github.com/your-username/kalam-checklist.git
cd kalam-checklist
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your `.env`

Create a `.env` file with the following variables (See example.env):

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-google-api-key
VITE_SPREADSHEET_ID=your-google-sheet-id
```

* The spreadsheet should be shared with **"Anyone with the link"** or to the required users.
* Make sure to publish your [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).

---

## 🔌 Google Sheet Format

Your sheet should be named `Outreach` (Can be changed in `app.tsx`) and look like:

|      | Task 1           | Task 2    | ... |
| ---------- | ---------------- | --------- | --- |
| Activity A    | TRUE             | FALSE     |     |
| Activity B    | FALSE            | TRUE      |     |
| ...        | ...              | ...       |     |

---

## 🚀 Run Dev Server

```bash
npm run dev
```

The app will open on `http://localhost:5173`.

---

## 🧠 Tech Stack

* React + TypeScript
* Google Sheets API v4
* Google OAuth2 (token-based login)
* Tailwind CSS (for styling)
* Lucide React (icons)

---

## 📦 Deployment

You can deploy to:

* **Vercel** (auto-detects Vite)
* **Netlify**
* **Firebase Hosting**

Ensure your `.env` vars are set in the respective dashboard.

---

## 📄 License

MIT License. Feel free to fork, remix, and use.
