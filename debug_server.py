import sys
import os
import asyncio
import traceback
from dotenv import load_dotenv

# Add current dir to path
sys.path.append(os.getcwd())

print("--- DEBUG INITIALIZED ---")

# Check imports
try:
    import requests
    print("requests module found.")
except ImportError:
    print("CRITICAL: requests module NOT found.")

try:
    print("Importing Orchestrator...")
    from ai_core.orchestrator import SuperAdvancedOrchestrator
except Exception:
    print("CRITICAL: Failed to import Orchestrator")
    traceback.print_exc()
    sys.exit(1)

async def main():
    load_dotenv()
    print("Environment loaded.")
    
    try:
        print("Instantiating Orchestrator...")
        orc = SuperAdvancedOrchestrator()
        
        prompt = "image of a blue sports car"
        print(f"Testing Prompt: {prompt}")
        
        # Test routing logic
        print("Calling generate_response...")
        result = await orc.generate_response(prompt)
        
        print("\n--- RESULT ---")
        print(result)
        
    except Exception:
        print("\n!!! CRASH DURING EXECUTION !!!")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
