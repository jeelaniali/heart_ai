import torch

checkpoint = torch.load("models/heart_model.pt", map_location="cpu")

if isinstance(checkpoint, dict) and "model_state" in checkpoint:
    state_dict = checkpoint["model_state"]
else:
    state_dict = checkpoint

print("=== ALL KEYS IN YOUR MODEL ===")
for key, tensor in state_dict.items():
    print(f"{key:45s} shape: {tensor.shape}")