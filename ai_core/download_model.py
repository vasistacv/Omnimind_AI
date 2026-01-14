from huggingface_hub import hf_hub_download
import os
import sys

def main():
    print("Initiating MISTRAL NEURAL CORE (Fallback for Llama 3 Compatibility)...")
    # Using Mistral 7B Instruct v0.1 - Fully compatible with CTransformers
    repo_id = "TheBloke/Mistral-7B-Instruct-v0.1-GGUF"
    filename = "mistral-7b-instruct-v0.1.Q4_K_M.gguf"
    
    target_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(target_dir, exist_ok=True)
    
    # Clean up old incompatible model if exists to save space
    old_model = os.path.join(target_dir, "Meta-Llama-3-8B-Instruct.Q4_K_M.gguf")
    if os.path.exists(old_model):
        print("Removing incompatible Llama 3 Core to free space...")
        try:
            os.remove(old_model)
        except:
            pass
    
    print(f"Target: {filename}")
    print(f"Source: {repo_id}")
    print("Size: ~4.37 GB")
    
    try:
        local_path = hf_hub_download(
            repo_id=repo_id, 
            filename=filename, 
            local_dir=target_dir,
            local_dir_use_symlinks=False
        )
        print(f"SUCCESS: Model integrated at {local_path}")
    except Exception as e:
        print(f"Download Interrupted: {e}")

if __name__ == "__main__":
    main()
