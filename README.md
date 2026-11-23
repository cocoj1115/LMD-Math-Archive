# Visual Archive · Math 3 / City of Bridges

- **Teacher**: photograph or upload the board → Claude transcribes the text and formulas → check each line against the photo and correct formulas (MathLive) → choose a concept → publish → read student questions grouped by concept → reply → with the student's permission, add their work to the class notes
- **Student**: Topic map / Class archive → board notes, worked examples, worksheets → when stuck, choose a concept, write a question, attach a photo of the paper attempt, add voice → post to the class discussion → accept or decline the teacher's request to share their work → bookmark, print

---

## 1. Run it in VS Code

```bash
npm install
cp .env.example .env.local     # fill in ANTHROPIC_API_KEY (required); the two Supabase keys can wait
npm run dev                    # http://localhost:5173
```

- `npm run dev` serves `/api/ocr` locally, so you don't need the Vercel CLI.
- **Without Supabase the app runs in local mode**: data is saved only in this browser. Two tabs in the same browser (one Teacher, one Student) still sync live, which is enough for development.

## 2. Supabase

1. Go to https://supabase.com, sign in with GitHub → New project
2. Open **SQL Editor** → New query → paste the whole of `supabase/schema.sql` → Run
3. Open **Project Settings → API** and copy the `Project URL` and the `anon public` key into `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Restart `npm run dev`. When the yellow "Local mode" banner at the top disappears, you're connected.

## 3. Project structure (for splitting the work)

```
api/ocr.ts                 Vercel serverless function (POST /api/ocr)
server/ocr.ts              Calls Claude to transcribe a photo → {title, concept, lines[], diagram}; edit the prompts here
supabase/schema.sql        Tables + storage bucket + realtime
src/lib/content.ts         Built-in course content: topics, folders, worked examples, worksheet images
src/lib/store.ts           Data layer (Supabase or localStorage, chosen automatically)
src/lib/app.tsx            Global state and all write actions (publishNote, addPost, addReply, share…)
src/components/            Shell/navigation, KaTeX rendering, MathField (MathLive), PhotoInput (upload + camera), Dictate (voice)
src/screens/
  Start.tsx                Choose role and class code; 3-step student intro
  Archive.tsx              Class archive, folders, Topic map
  Topic.tsx                Topic overview, worked example, worksheet reader
  Note.tsx                 Note page (original photo side by side, version history, classmate work), print preview
  Discussion.tsx           Discussion board, new post (photo, voice, automatic transcription)
  TeacherCapture.tsx       Photograph board → transcribe → correct formulas → details → publish
  TeacherQuestions.tsx     Question inbox grouped by concept; share student work with permission
```

Suggested split: one person owns the Teacher side (`TeacherCapture`, `TeacherQuestions`, `server/ocr.ts`), the other owns the Student side (`Archive`, `Topic`, `Note`, `Discussion`). Give each other a heads-up before changing the shared files in `src/lib/*`.

## Resetting the demo
Open `/reset` (for example `http://localhost:5173/reset`) to clear everything posted or published in this browser: questions, replies, notes published from the teacher view, bookmarks and the signed-in name. The built-in class materials stay. Do this between test participants.
