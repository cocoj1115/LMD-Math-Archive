# Visual Archive · Math 3 / City of Bridges

这是给周一 school prototype testing 用的 working prototype。Teacher 端和 Student 端用同一个网址，共享一份数据。

- **Teacher**：拍板书或上传照片 → Claude 识别文字和公式 → 对照原图逐行修改公式（MathLive）→ 选 concept → publish → 按 concept 看学生的问题 → 回复 → 学生同意后，把学生的作业加进 class notes
- **Student**：Topic map / Class archive → board notes、worked example、worksheet → 卡住了就选 concept、写问题、拍纸上的作答、用语音补充 → 发到 class discussion → 同意或拒绝老师分享自己的作业 → bookmark、打印

Design tokens 是从 Figma「Wire-frame → higher fidelity wireframes → Guided class archive (V3)」提取的，见 `src/index.css` 顶部。

---

## 1. 在 VS Code 里跑起来（5 分钟）

```bash
npm install
cp .env.example .env.local     # 填 ANTHROPIC_API_KEY（必须），Supabase 两个 key（可以先不填）
npm run dev                    # http://localhost:5173
```

- `npm run dev` 自带 `/api/ocr`，本地不需要装 Vercel CLI。
- **没填 Supabase 的时候是 local mode**：数据只存在这个浏览器里。同一个浏览器开两个 tab（一个 Teacher、一个 Student）也能实时同步，开发够用。
- **要在两台电脑上测试（老师一台、学生一台）就必须填 Supabase。**

## 2. Supabase（免费，大约 5 分钟）

1. 打开 https://supabase.com，用 GitHub 登录 → New project
2. 进 **SQL Editor** → New query → 把 `supabase/schema.sql` 整个粘进去 → Run
3. 进 **Project Settings → API**，把 `Project URL` 和 `anon public` key 填到 `.env.local`：
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. 重启 `npm run dev`。页面顶部那条黄色的 "Local mode" 提示消失，就说明连上了。

## 3. Anthropic API key（照片识别）

https://console.anthropic.com → API Keys → Create key，填进 `.env.local` 的 `ANTHROPIC_API_KEY`。账户里先充 $5 就够整场测试用了。默认模型是 `claude-sonnet-5-5`，可以用 `ANTHROPIC_MODEL` 改。

**这个 key 只在服务器端用（`api/ocr.ts`、`server/ocr.ts`），不会发到浏览器。不要 commit `.env.local`**（已经在 `.gitignore` 里了）。

## 4. 部署到 Vercel

1. 先把代码 push 到 GitHub（见下面第 6 节）
2. https://vercel.com → Add New → Project → 选这个 repo → Framework 会自动识别成 Vite
3. **Environment Variables** 里加这三个：`ANTHROPIC_API_KEY`、`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
4. Deploy。之后每次 push 到 `main` 会自动上线；每个 PR 也会自动生成一个 preview 链接。

## 5. 测试当天的 checklist

- [ ] 两台电脑都用 **Chrome** 打开 Vercel 网址（语音输入 Chrome 最稳）
- [ ] 两边输入**同一个 class code**（默认是 `MATH3`）。每一场测试换一个新的 code（比如 `TEST1`、`TEST2`），数据就不会混在一起
- [ ] 老师那台电脑：第一次点 Capture board 的时候，允许浏览器用摄像头。也可以先用手机拍板书，传到电脑上，再点 Upload file
- [ ] 学生那台电脑：第一次点 Record by voice 的时候，允许浏览器用麦克风
- [ ] 提醒参与者：照片里只拍题目和作答部分，不要拍到名字
- [ ] 每个 tab 是一个独立的身份（存在 sessionStorage 里）。关掉 tab 就等于退出，学生就没法再回应老师的分享请求了，所以测试中途不要关 tab

## 6. 推到 GitHub

这个文件夹已经是一个 git repo，并且做好了第一个 commit：

```bash
# GitHub 上新建一个空 repo（不要勾选 README），然后：
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

在 GitHub repo 的 Settings → Collaborators 里把另一位 developer 加进来。

## 7. 项目结构（方便分工）

```
api/ocr.ts                 Vercel serverless function（POST /api/ocr）
server/ocr.ts              调用 Claude 识别照片 → {title, concept, lines[], diagram}；prompt 在这里改
supabase/schema.sql        数据表 + storage bucket + realtime
src/lib/content.ts         内置课程内容：topics、folders、worked examples、worksheet 图片
src/lib/store.ts           数据层（Supabase / localStorage，二选一自动切换）
src/lib/app.tsx            全局状态和所有写操作（publishNote, addPost, addReply, share…）
src/components/            Shell/导航、KaTeX 渲染、MathField（MathLive）、PhotoInput（上传和摄像头）、Dictate（语音）
src/screens/
  Start.tsx                选身份和 class code、student intro（3 步）
  Archive.tsx              Class archive、folder、Topic map
  Topic.tsx                Topic overview、worked example、worksheet 阅读器
  Note.tsx                 Note 页（原图对照、version history、同学作业）、print preview
  Discussion.tsx           讨论区、发新帖（照片、语音、自动识别）
  TeacherCapture.tsx       拍板书 → 识别 → 改公式 → details → publish
  TeacherQuestions.tsx     按 concept 分组的问题 inbox、征得同意后分享作业
```

建议这样分工：一个人负责 Teacher 端（`TeacherCapture`、`TeacherQuestions`、`server/ocr.ts`），另一个人负责 Student 端（`Archive`、`Topic`、`Note`、`Discussion`）。改共享的 `src/lib/*` 之前，在群里先说一声。

## 已知限制（prototype）

- 没有真实账号，靠 class code 区分班级。Supabase 用的是开放的 RLS policy，只适合 prototype testing
- 识别出来的结果要老师校对（界面会把识别不确定的行标黄）。图形不会被转成矢量，会保留在原图里，同时生成一句文字描述
- Worksheet 是 PNG 图片（从 Figma 导出的）。"Print this page" 打印的是当前这一页
- 先做了 PC 端。手机端的 responsive 布局下一步做
