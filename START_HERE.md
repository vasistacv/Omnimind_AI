# 🚀 QUICK START GUIDE

## Get Started in 5 Minutes!

### Step 1: Run Setup (2 minutes)
```bash
setup.bat
```
This installs all dependencies automatically.

### Step 2: Get FREE API Key (1 minute)
1. Visit: **https://makersuite.google.com/app/apikey**
2. Click "Create API Key"
3. Copy the key

### Step 3: Configure (1 minute)
```bash
copy .env.example .env
```

Open `.env` in Notepad and paste your API key:
```
GEMINI_API_KEY=your_key_here
```

### Step 4: Launch (1 minute)
```bash
launch.bat
```

Wait for both windows to open, then go to:
**http://localhost:3000**

## 🎉 You're Ready!

### Try These Examples:

**1. Generate Code:**
```
Write a Python function to sort a list using quicksort with comments
```

**2. Upload a Document:**
- Click the 📎 button
- Select a PDF, DOCX, or image
- Ask: "Summarize this document"

**3. OCR an Image:**
- Upload a photo with text
- The AI will extract and analyze the text

**4. Get Reasoning:**
- Ask any complex question
- Click "🧠 Reasoning Chain" to see how it thinks

## 💡 Pro Tips

✅ **Use specific prompts** for better results
✅ **Upload documents** for analysis
✅ **Enable dark mode** for night use
✅ **View reasoning** to understand decisions

## ⚠️ Troubleshooting

**Problem:** Backend won't start
**Solution:** Check your API key in `.env` file

**Problem:** "Connection refused"
**Solution:** Wait 10 seconds for backend to fully start

**Problem:** OCR not working
**Solution:** Install Tesseract OCR (optional, for advanced OCR)

## 📚 Learn More

- Full documentation: `README.md`
- Features list: `FEATURES.md`
- Architecture: `ARCHITECTURE.md`

---

**Need Help?** Check the README.md file for detailed information!
