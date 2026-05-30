# Submission Checklist

## Before Pushing to GitHub

- Create `server/.env` using `server/.env.example`
- Create `client/.env` using `client/.env.example` if the backend URL is not local
- Confirm MongoDB Atlas connection works
- Add an OpenAI API key for real AI extraction and itinerary generation
- Run `npm run build` inside `client/`

## GitHub

```bash
git init
git add .
git commit -m "Build AI travel itinerary MERN app"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Deployment

Backend:

- Deploy the `server` folder on Render or Railway
- Add `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `OPENAI_API_KEY`
- Use `npm install` as the build command
- Use `npm start` as the start command

Frontend:

- Deploy the `client` folder on Vercel or Netlify
- Add `VITE_API_URL=https://your-backend-url/api`
- Redeploy after updating the environment variable

## HR Reply After Submission

```text
Hello Team Orbitra,

I have completed the assignment for the Junior Full Stack Developer (MERN + AI) role.

GitHub Repository: <your-repo-link>
Live Application: <your-live-link>

Thanks and regards,
Sahaj
```
