// PLACEHOLDER LEGAL CONTENT — NOT REVIEWED BY A LAWYER.
// This is template/demo copy covering the categories a real fintech consent
// screen typically needs (nature of the score, data handling, liability,
// user responsibilities). It has not been drafted or reviewed by a qualified
// attorney and should not be relied on for real legal protection — especially
// around Kenya's Data Protection Act 2019 and consumer credit regulation,
// which govern exactly what this app does (processing M-Pesa financial data,
// producing a score, sharing it with lenders). Replace before shipping to
// real users, with a lawyer, not by editing this file further.

export const termsSections: { title: string; body: string }[] = [
  {
    title: '1. What PesaScore is',
    body: 'PesaScore produces an informational score estimate based on patterns in your M-Pesa transaction history. It is not an official or regulated credit score, is not issued by any credit reference bureau, and is not a guarantee that any lender will approve, reject, or offer any particular terms on a loan. Lenders make their own decisions using their own criteria.',
  },
  {
    title: '2. Not financial or credit advice',
    body: "Nothing in this app is financial, credit, investment, or legal advice. Tips and recommendations shown are general, automatically generated observations about patterns in your own data — not a professional's assessment of your financial situation. You should not rely on them as a substitute for independent advice.",
  },
  {
    title: '3. How your data is used',
    body: 'When you upload an M-Pesa statement, it is processed to compute your score and then discarded — the file itself is not stored. Your score and the underlying summary metrics are stored so the app can show them to you and to lenders you explicitly approve. You control which lenders can see your data through the consent screen, and can revoke access at any time from Active Requests.',
  },
  {
    title: '4. Accuracy and limitations',
    body: "Classifying transactions from M-Pesa data alone (for example, distinguishing a loan repayment from an ordinary bill payment) is inherently imperfect. Where the app can't confidently classify a transaction, it asks you directly rather than guessing — but your answers, and the app's own classification, may still not be fully accurate. You are responsible for reviewing what you upload and confirm.",
  },
  {
    title: '5. No warranty; limitation of liability',
    body: 'PesaScore is provided "as is" and "as available," without warranties of any kind, express or implied, including as to accuracy, reliability, or fitness for a particular purpose. To the fullest extent permitted by law, PesaScore and its operators are not liable for any loss or damage — including a declined loan application, a lending decision made using your score, or any financial loss — arising from your use of the app or reliance on any score, tip, or recommendation it produces.',
  },
  {
    title: '6. Your responsibilities',
    body: 'You confirm that any statement you upload belongs to you, that you will not attempt to upload or misrepresent someone else\'s financial data, and that you will use PesaScore lawfully. You are responsible for keeping your PIN and device secure.',
  },
  {
    title: '7. Changes to these terms',
    body: 'These terms may be updated from time to time. Continued use of the app after a change constitutes acceptance of the updated terms.',
  },
  {
    title: '8. Governing law',
    body: 'These terms are intended to be governed by the laws of Kenya, without regard to conflict-of-law principles. [Placeholder — confirm with counsel.]',
  },
  {
    title: '9. Contact',
    body: 'Questions about these terms or your data can be sent to [support email placeholder].',
  },
];
