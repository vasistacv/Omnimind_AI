"""
Nano Banana Image Generator - SAFE VERSION
Uses Gemini/Imagen 3 API via simple REST calls.
"""

import os
import requests
import json
import traceback

class NanoBananaImageGenerator:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("[NANO BANANA] ⚠️ No API Key found")
        print("[NANO BANANA] Initialized (Safe Mode)")

    async def generate_image(self, prompt, aspect_ratio="1:1", num_images=1, safety_filter="default"):
        """
        Generate image (async wrapper around sync call to prevent 500s)
        """
        print(f"[NANO BANANA] 🍌 Processing: {prompt[:50]}...")
        
        try:
            # We use a direct synchronous call here to ensure stability.
            # In a production app with high load we'd use thread pool, 
            # but for a single-user local app, this blocks for ~5s which is fine and safer.
            return self._generate_sync(prompt, aspect_ratio, num_images)
        except Exception as e:
            print(f"[NANO BANANA] ❌ Error in generate_image wrapper: {e}")
            traceback.print_exc()
            return {"success": False, "error": str(e)}

    def _generate_sync(self, prompt, aspect_ratio, num_images):
        """Synchronous generation logic"""
        try:
            url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict"
            
            headers = {"Content-Type": "application/json"}
            payload = {
                "instances": [{"prompt": prompt}],
                "parameters": {
                    "sampleCount": num_images,
                    "aspectRatio": aspect_ratio
                }
            }
            
            print(f"[NANO BANANA] 📡 Calls Imagen 3 API...")
            
            response = requests.post(
                f"{url}?key={self.api_key}",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if "predictions" in result:
                    images = []
                    for pred in result["predictions"]:
                        if "bytesBase64Encoded" in pred:
                            b64 = pred["bytesBase64Encoded"]
                            # Convert to data URL
                            images.append({"url": f"data:image/png;base64,{b64}"})
                    
                    if images:
                        print(f"[NANO BANANA] ✅ Success! Generated {len(images)} images")
                        return {"success": True, "images": images}
            
            # Handle Errors
            print(f"[NANO BANANA] ⚠️ API Status: {response.status_code}")
            print(f"[NANO BANANA] Response: {response.text[:200]}")
            
            return {
                "success": False, 
                "error": f"API Error {response.status_code}: {response.text[:100]}"
            }
            
        except Exception as e:
            print(f"[NANO BANANA] ❌ Error in _generate_sync: {e}")
            traceback.print_exc()
            return {"success": False, "error": str(e)}
