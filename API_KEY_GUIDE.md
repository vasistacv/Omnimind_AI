# 🔑 HOW TO GET YOUR FREE GEMINI API KEY

## Step-by-Step Guide (Takes 2 minutes!)

### Step 1: Visit Google AI Studio
Go to: **https://makersuite.google.com/app/apikey**

Or search for "Google AI Studio API Key"

### Step 2: Sign In
- Use your Google account
- If you don't have one, create a free Google account

### Step 3: Create API Key
1. Click the **"Create API Key"** button
2. Select **"Create API key in new project"** (recommended)
3. Wait a few seconds for the key to be generated

### Step 4: Copy Your Key
- Your API key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Click the **copy icon** to copy it

### Step 5: Add to OmniMind
1. Open the `.env` file in the OmniMind folder
2. Find the line: `GEMINI_API_KEY=your_gemini_api_key_here`
3. Replace `your_gemini_api_key_here` with your actual key
4. Save the file

Example:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## ✅ You're Done!

Now run:
```bash
launch.bat
```

And enjoy your advanced AI agent!

---

## 💰 Is It Really Free?

**YES!** Google Gemini API offers:
- **Free tier**: 60 requests per minute
- **No credit card required**
- **Perfect for personal use**

If you need more:
- Paid tier available (very affordable)
- Or add OpenAI/Claude keys for multi-model

---

## 🔒 Security Tips

✅ **Keep your API key private** (don't share it)
✅ **Don't commit .env to Git** (already in .gitignore)
✅ **Regenerate if compromised** (easy to do in AI Studio)

---

## ❓ Troubleshooting

**Problem:** "API key not valid"
**Solution:** 
- Make sure you copied the entire key
- No extra spaces before/after
- Key should start with `AIzaSy`

**Problem:** "Quota exceeded"
**Solution:**
- Free tier: 60 requests/minute
- Wait a minute and try again
- Or upgrade to paid tier

**Problem:** "API not enabled"
**Solution:**
- Go to Google Cloud Console
- Enable "Generative Language API"
- Wait a few minutes

---

## 🌟 Optional: Add More Models

Want even better results? Add these (optional):

### OpenAI GPT-4 (Paid)
1. Visit: https://platform.openai.com/api-keys
2. Create account and add payment method
3. Generate API key
4. Add to `.env`: `OPENAI_API_KEY=sk-...`

### Anthropic Claude (Paid)
1. Visit: https://console.anthropic.com/
2. Create account and add payment method
3. Generate API key
4. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

**Note:** These are optional! Gemini alone is powerful enough.

---

**Ready to start?** Go back to `START_HERE.md` and launch OmniMind!
