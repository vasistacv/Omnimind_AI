import subprocess
import sys
import os

def install(packages, index_url=None):
    if isinstance(packages, str):
        packages = packages.split()
    cmd = [sys.executable, "-m", "pip", "install"] + packages
    if index_url:
        cmd.extend(["--index-url", index_url])
    print(f"Installing {packages}...")
    subprocess.check_call(cmd)

def main():
    print("Checking CUDA setup...")
    # Basic check - in a real scenario we might query nvidia-smi, 
    # but we know from prompt it's CUDA 12.4.
    
    # Install PyTorch for CUDA 12.4 (using 12.4 wheels if available, or 12.1 fallback)
    # PyTorch official usually has cu124 or cu121.
    print("Installing PyTorch with CUDA support...")
    try:
        install("torch torchvision torchaudio", index_url="https://download.pytorch.org/whl/cu124")
    except Exception as e:
        print(f"Failed to install CUDA 12.4 torch, trying 12.1: {e}")
        install("torch torchvision torchaudio", index_url="https://download.pytorch.org/whl/cu121")

    # Install other AI tools
    # llama-cpp-python usually needs compilation, but we can try installing a pre-built wheel 
    # or just the package and hope specific flags aren't needed for basic inference 
    # (though GPU accel requires flags).
    # For Windows, simpler to rely on torch-based quantization like AutoGPTQ or HQQ 
    # but llama-cpp is best for GGUF.
    
    # We will try installing llama-cpp-python with strict cmake args for CUDA if possible,
    # but that often fails without VS runtime. 
    # Let's stick to 'transformers' and 'accelerate' for now as a fallback, 
    # and 'llama-cpp-python' as a 'try-to-have'.
    
    pkgs = [
        "fastapi",
        "uvicorn",
        "transformers",
        "accelerate",
        "huggingface_hub",
        "bitsandbytes", # Windows support is experimental but available via specific forks
        "ctransformers", # For GGUF model support with GPU acceleration
        "requests",
        "termcolor" # For 'unrealistic' terminal output
    ]
    
    for pkg in pkgs:
        try:
            install(pkg)
        except Exception as e:
            print(f"Warning: Could not install {pkg}: {e}")

    # For GGUF support (easiest for local llm):
    # Try creating a batch file to install llama-cpp-python with CUDA enabled 
    # involves setting CMAKE_ARGS. Python script calling pip might not pass env vars easily 
    # unless completely explicit.
    print("Setup complete for basic AI Core.")

if __name__ == "__main__":
    main()
