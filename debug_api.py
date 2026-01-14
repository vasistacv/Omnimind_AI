import requests
import json
import traceback

def test_api():
    print("Testing API at http://127.0.0.1:8000/api/chat...")
    try:
        payload = {
            "message": "Hi",
            "use_reasoning": True
        }
        response = requests.post("http://127.0.0.1:8000/api/chat", json=payload)
        
        print(f"Status Code: {response.status_code}")
        print("Raw Response Content:")
        print(response.content.decode('utf-8'))
        
        try:
            data = response.json()
            print("\nParsed JSON:")
            print(json.dumps(data, indent=2))
        except:
            print("Could not parse JSON")
            
    except Exception as e:
        print(f"Request Failed: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_api()
