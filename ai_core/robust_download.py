import requests
import os
import sys
import time

def download_file(url, dest_path):
    print(f"Starting download from: {url}")
    print(f"Destination: {dest_path}")
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024 * 1024 * 10 # 10MB chunks
        
        if os.path.exists(dest_path):
            existing_size = os.path.getsize(dest_path)
            if existing_size == total_size:
                print("File already exists and matches size. Skipping.")
                return True
            else:
                print(f"File exists but size mismatch ({existing_size} vs {total_size}). Redownloading.")
        
        with open(dest_path, 'wb') as file:
            downloaded = 0
            start_time = time.time()
            for data in response.iter_content(block_size):
                file.write(data)
                downloaded += len(data)
                
                # Progress bar
                elapsed = time.time() - start_time
                speed = downloaded / (elapsed + 0.001) / (1024 * 1024)
                percent = (downloaded / total_size) * 100 if total_size else 0
                
                sys.stdout.write(f"\rProgress: {percent:.2f}% | {downloaded / (1024*1024):.0f}MB / {total_size / (1024*1024):.0f}MB | Speed: {speed:.2f} MB/s")
                sys.stdout.flush()
                
        print("\nDownload finished successfully.")
        return True
    
    except Exception as e:
        print(f"\nError downloading file: {e}")
        return False

if __name__ == "__main__":
    model_url = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf"
    target_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, "mistral-7b-instruct-v0.1.Q4_K_M.gguf")
    
    download_file(model_url, target_file)
