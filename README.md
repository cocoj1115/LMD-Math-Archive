# Visual Archive · Math 3 / City of Bridges

- **Teacher**: photograph or upload the board → Claude transcribes the text and formulas → check each line against the photo and correct formulas (MathLive) → choose a concept → publish → read student questions grouped by concept → reply → with the student's permission, add their work to the class notes
- **Student**: Topic map / Class archive → board notes, worked examples, worksheets → when stuck, choose a concept, write a question, attach a photo of the paper attempt, add voice → post to the class discussion → accept or decline the teacher's request to share their work → bookmark, print

---

## 1. Run it in VS Code 

```bash
npm install
cp .env.example .env.local     # 填 ANTHROPIC_API_KEY
npm run dev                    # http://localhost:5173
```

- `npm run dev` 自带 `/api/ocr`，本地不需要装 Vercel CLI。
- 数据只存在这个浏览器里（localStorage）。同一个浏览器开两个 tab（一个 Teacher、一个 Student）会实时同步。**两台电脑之间不会同步。**

## 2. Anthropic API key（照片识别）

https://console.anthropic.com → API Keys → Create key，填进 `.env.local` 的 `ANTHROPIC_API_KEY`。账户里先充 $5 就够整场测试用了。默认模型是 `claude-sonnet-5-5`，可以用 `ANTHROPIC_MODEL` 改。

**这个 key 只在服务器端用（`api/ocr.ts`、`server/ocr.ts`），不会发到浏览器。不要 commit `.env.local`**（已经在 `.gitignore` 里了）。

## 3. 部署到 Vercel

1. 先把代码 push 到 GitHub（见下面第 5 节）
2. https://vercel.com → Add New → Project → 选这个 repo → Framework 会自动识别成 Vite
3. **Environment Variables** 里加 `ANTHROPIC_API_KEY`
4. Deploy。之后每次 push 到 `main` 会自动上线；每个 PR 也会自动生成一个 preview 链接。

## 4. 测试当天的 checklist

- [ ] 两台电脑都用 **Chrome** 打开 Vercel 网址（语音输入 Chrome 最稳）
- [ ] 两边输入**同一个 class code**（默认是 `MATH3`）。每一场测试换一个新的 code（比如 `TEST1`、`TEST2`），数据就不会混在一起
- [ ] 老师那台电脑：第一次点 Capture board 的时候，允许浏览器用摄像头。也可以先用手机拍板书，传到电脑上，再点 Upload file
- [ ] 学生那台电脑：第一次点 Record by voice 的时候，允许浏览器用麦克风
- [ ] 提醒参与者：照片里只拍题目和作答部分，不要拍到名字
- [ ] 每个 tab 是一个独立的身份（存在 sessionStorage 里）。关掉 tab 就等于退出，学生就没法再回应老师的分享请求了，所以测试中途不要关 tab

## 5. 推到 GitHub

这个文件夹已经是一个 git repo，并且做好了第一个 commit：

```bash
# GitHub 上新建一个空 repo（不要勾选 README），然后：
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

在 GitHub repo 的 Settings → Collaborators 里把另一位 developer 加进来。

## 6. 项目结构（方便分工）

```
api/ocr.ts                 Vercel serverless function（POST /api/ocr）
server/ocr.ts              调用 Claude 识别照片 → {title, concept, lines[], diagram}；prompt 在这里改
src/lib/content.ts         内置课程内容：topics、folders、worked examples、worksheet 图片
src/lib/store.ts           数据层（localStorage）
src/lib/app.tsx            全局状态和所有写操作（publishNote, addPost, addReply, share…）
src/components/            Shell/导航、KaTeX 渲染、MathField（MathLive）、PhotoInput（上传和摄像头）、Dictate（语音）
src/screens/
  Start.tsx                Choose role and class code; 3-step student intro
  Archive.tsx              Class archive, folders, Topic map
  Topic.tsx                Topic overview, worked example, worksheet reader
  Note.tsx                 Note page (original photo side by side, version history, classmate work), print preview
  Discussion.tsx           Discussion board, new post (photo, voice, automatic transcription)
  TeacherCapture.tsx       Photograph board → transcribe → correct formulas → details → publish
  TeacherQuestions.tsx     Question inbox grouped by concept; share student work with permission
```

建议这样分工：一个人负责 Teacher 端（`TeacherCapture`、`TeacherQuestions`、`server/ocr.ts`），另一个人负责 Student 端（`Archive`、`Topic`、`Note`、`Discussion`）。改共享的 `src/lib/*` 之前，在群里先说一声。

## 已知限制（prototype）

- 没有真实账号，靠 class code 区分班级。数据只存在本地浏览器，两台电脑之间不同步
- 识别出来的结果要老师校对（界面会把识别不确定的行标黄）。图形不会被转成矢量，会保留在原图里，同时生成一句文字描述
- Worksheet 是 PNG 图片（从 Figma 导出的）。"Print this page" 打印的是当前这一页
- 先做了 PC 端。手机端的 responsive 布局下一步做
