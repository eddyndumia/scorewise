# PesaScore

Credit scores from M-Pesa statements instead of a credit bureau. A lot of people here have years of M-Pesa history and no bank loan history, so the bureau has nothing on them.

This is the borrower app. You upload a statement, see your score and what's pushing it up or down, and choose which lenders can see it. The backend lives in [score-wise-backend](https://github.com/eddyndumia/score-wise-backend).

React, TypeScript, Vite.

```bash
cd frontend
npm install
npm run dev
```

Expects the backend on `localhost:8000`.
