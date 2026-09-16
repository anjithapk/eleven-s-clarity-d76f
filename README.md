# Eleven — The Hero Who Hears the Unspoken

A single-page website and help portal built for the **TechAscent Machine Test**, featuring an original
superhero: **Eleven**, who senses the emotional signal underneath what people manage to say.

The heart of the portal is a conversational interface where a visitor talks to Eleven step by step.
Their message is stored in a database and a notification email is sent to the evaluator.

---

## 1. Stack & architecture

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR) + Vite 7 |
| Styling | Tailwind CSS v4 (design tokens in `src/styles.css`) |
| Backend | Lovable Cloud (managed Postgres + server runtime) |
| Server logic | TanStack **server functions** (`createServerFn`) |
| Conversation | Hugging Face Inference Providers chat completions (`meta-llama/Llama-3.1-8B-Instruct`) |
| Email | Resend HTTP API, with a development simulation fallback |

```
src/
├─ routes/
│  ├─ __root.tsx                 app shell, fonts, global meta
│  └─ index.tsx                  the single page (nav, hero, story, powers,
│                                mission, how she helps, chat, footer)
├─ components/eleven/
│  ├─ Emblem.tsx                 original abstract sound-wave emblem (SVG)
│  ├─ Waveform.tsx               frequency visualiser + typing indicator
│  └─ ChatWithEleven.tsx         conversational chat interface
├─ lib/
│  ├─ chat.functions.ts          server function: Eleven's AI replies
│  └─ submissions.functions.ts   server function: validate → save → notify
└─ styles.css                    midnight-navy design system
```

### Conversation model

The first four steps (name → age → location → email) stay **fully deterministic** on the client:
same validation, same input modes, same in-character correction lines. Only the grievance stage
is model-assisted.

`src/lib/chat.functions.ts` exposes `generateElevenChatResponse`, a `createServerFn({ method: 'POST' })`
handler that:

1. reads `HUGGINGFACE_API_KEY` and `HUGGINGFACE_MODEL` **inside the handler** (never in the browser bundle),
2. posts to `https://router.huggingface.co/v1/chat/completions` with Bearer auth,
   Eleven's system prompt, the visitor's name as context, the grievance exchanges,
   `max_tokens: 160`, `temperature: 0.7`,
3. on a missing key logs a warning and returns a gentle scripted fallback,
4. on any network error, timeout or non-200 logs the error server-side and returns
   *"Sorry, I lost the thread for a moment. Could you tell me that again?"* — no stack traces reach the UI.

After two grievance exchanges Eleven closes with *"Thank you for trusting me with that. You've been heard."*
and the existing submission flow runs automatically: the **full transcript** (visitor turns and
Eleven's replies) is saved to `submissions` and the Resend notification is sent.

### Why server functions instead of an edge function

This project runs on TanStack Start, which already has its own server runtime. App-internal
server logic therefore lives in `createServerFn` handlers rather than a separate edge function.
The service-role client and every API key stay inside handler bodies, so they never reach the
browser bundle.


---

## 2. Database schema

Table: `public.submissions`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | primary key, `gen_random_uuid()` |
| `visitor_name` | `text` | required |
| `visitor_age` | `integer` | validated 1–120 on the client and server |
| `visitor_location` | `text` | |
| `visitor_email` | `text` | required, format-validated |
| `grievance` | `text` | required |
| `submitted_at` | `timestamptz` | defaults to `now()` |
| `status` | `text` | defaults to `'new'` |

**Row Level Security** is enabled:

- `INSERT` is granted to `anon` and `authenticated` (anyone can reach out).
- No `SELECT`, `UPDATE`, or `DELETE` policy exists, so submissions cannot be read from the
  browser by anyone. Only trusted server-side code (service role) can read them.

---

## 3. Email notification

On a successful submission the server function sends:

- **To:** `anjitha.p.k.2007@gmail.com`
- **Subject:** `🦸 Someone Needs Your Help!`
- **Body:** name, age, location, email, formatted submission date/time (Asia/Kolkata), and the
  full message, in a dark themed HTML template matching the site.

### Configuration

| Env var | Required | Purpose |
| --- | --- | --- |
| `HUGGINGFACE_API_KEY` | optional | Hugging Face Inference Providers token. Without it Eleven falls back to a scripted empathetic reply. |
| `HUGGINGFACE_MODEL` | optional | Chat model id. Defaults to `meta-llama/Llama-3.1-8B-Instruct`. |
| `RESEND_API_KEY` | optional | Resend API key. When present, a real email is sent. |
| `RESEND_FROM` | optional | Sender address, e.g. `Eleven <eleven@yourdomain.com>`. Defaults to `Eleven <onboarding@resend.dev>`. |

All four are read **only inside server-function handlers**. None are `VITE_`-prefixed, so none of
them are ever shipped to the browser or exposed in network responses.


### Development fallback

If `RESEND_API_KEY` is **not** configured:

- the submission is still saved to the database,
- the email payload is logged server-side,
- the chat returns `emailStatus: "simulated"` and Eleven's confirmation is followed by a visible
  note telling the evaluator that the email was simulated because no key is configured.

If a key exists but Resend rejects the request, the submission is still saved and the UI reports
that the email could not be delivered — the visitor's message is never lost.

---

## 4. Notes for White Matrix Solutions evaluators

1. Open the site and scroll to **Talk to Eleven** (or use the nav button). The conversation starts
   automatically when the section comes into view.
2. Eleven collects, in order: name → age → location → email → message. Those four steps are
   deterministic client-side logic; age and email are validated in the chat itself, and invalid
   input produces a natural in-character correction rather than a form error.
3. The message stage is AI-assisted: Eleven replies to the first message with a model-generated
   follow-up, then after the second message closes with *"Thank you for trusting me with that.
   You've been heard."* and submits automatically.

4. The row appears in the `submissions` table immediately. The email is sent when `RESEND_API_KEY`
   is configured, otherwise the simulation notice is shown in the chat.
5. Design intent: midnight navy (`#0a0f1d` / `#0f172a`), restrained cyan and teal accents
   (`#06b6d4`, `#14b8a6`), warm off-white type, and sound-wave / ripple motifs only. No comic-book
   tropes, no existing-universe influences; the emblem, copy, and character are original.
6. Accessibility: semantic landmarks, a single `<h1>`, keyboard-operable chat, live-region updates,
   and full `prefers-reduced-motion` support.

---

## 5. Running locally

```sh
npm install
npm run dev
```

The backend (database + secrets) is provisioned through Lovable Cloud; environment variables are
injected automatically in both preview and production.
