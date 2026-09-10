"""
CleftGuard AI — PyTorch Deep Learning Training Pipeline.

Trains a medical Convolutional Neural Network (DenseNet-121 / ResNet-18)
for pediatric alveolar cleft bone graft evaluation (Normal vs. Defect).
Tracks Accuracy, Sensitivity, Specificity, and F1-score with checkpoint saving.
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


def get_device() -> torch.device:
    """Detect the best available acceleration backend (MPS / CUDA / CPU)."""
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("⚡ Using Apple Silicon Metal GPU Acceleration (MPS)")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"⚡ Using NVIDIA CUDA GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        print("⚙️ Using CPU Compute")
    return device


def build_data_transforms() -> tuple[transforms.Compose, transforms.Compose]:
    """Medical-grade radiograph transforms for train and validation splits."""
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    return train_transform, eval_transform


def build_model(arch: str = "resnet18", num_classes: int = 2) -> nn.Module:
    """Build classification model with pretrained weights and custom clinical head."""
    if arch == "densenet121":
        weights = models.DenseNet121_Weights.DEFAULT
        model = models.densenet121(weights=weights)
        in_features = model.classifier.in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, num_classes),
        )
    else:
        weights = models.ResNet18_Weights.DEFAULT
        model = models.resnet18(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, num_classes),
        )

    return model


def evaluate(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> dict[str, float]:
    """Evaluate model performance on a dataset split with clinical metrics."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    # Confusion Matrix accumulators (class 0: defect/review, class 1: normal/healthy)
    tp = 0  # True Positives (Defect correctly identified)
    fp = 0  # False Positives
    tn = 0  # True Negatives (Normal correctly identified)
    fn = 0  # False Negatives

    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            running_loss += loss.item() * inputs.size(0)

            _, preds = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (preds == labels).sum().item()

            for p, l in zip(preds.view(-1), labels.view(-1)):
                if p == 0 and l == 0:
                    tp += 1
                elif p == 0 and l == 1:
                    fp += 1
                elif p == 1 and l == 1:
                    tn += 1
                elif p == 1 and l == 0:
                    fn += 1

    loss = running_loss / max(1, total)
    accuracy = correct / max(1, total)
    sensitivity = tp / max(1, (tp + fn))  # Defect Recall
    specificity = tn / max(1, (tn + fp))
    precision = tp / max(1, (tp + fp))
    f1 = 2 * (precision * sensitivity) / max(1e-6, (precision + sensitivity))

    return {
        "loss": round(loss, 4),
        "accuracy": round(accuracy, 4),
        "sensitivity": round(sensitivity, 4),
        "specificity": round(specificity, 4),
        "precision": round(precision, 4),
        "f1_score": round(f1, 4),
        "tp": tp, "fp": fp, "tn": tn, "fn": fn,
    }


def train_cleftguard(
    data_dir: str = "dataset",
    models_dir: str = "models",
    arch: str = "resnet18",
    epochs: int = 10,
    batch_size: int = 16,
    lr: float = 1e-4,
) -> dict[str, Any]:
    """Execute end-to-end model training, validation, and checkpoint saving."""
    data_path = Path(data_dir)
    train_dir = data_path / "train"
    val_dir = data_path / "val"
    test_dir = data_path / "test"

    if not train_dir.exists():
        raise FileNotFoundError(
            f"Dataset not found at '{train_dir}'. Run 'python generate_dataset.py' first."
        )

    device = get_device()
    train_transform, eval_transform = build_data_transforms()

    train_dataset = datasets.ImageFolder(str(train_dir), transform=train_transform)
    val_dataset = datasets.ImageFolder(str(val_dir), transform=eval_transform)
    test_dataset = datasets.ImageFolder(str(test_dir), transform=eval_transform) if test_dir.exists() else None

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False) if test_dataset else None

    class_names = train_dataset.classes
    print(f"📊 Classes detected: {class_names} (0: {class_names[0]}, 1: {class_names[1]})")
    print(f"📦 Samples: Train={len(train_dataset)} | Val={len(val_dataset)} | Test={len(test_dataset) if test_dataset else 0}")

    model = build_model(arch=arch, num_classes=len(class_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_f1 = 0.0
    best_weights_path = Path(models_dir) / "cleftguard_model.pth"
    best_weights_path.parent.mkdir(parents=True, exist_ok=True)
    history: list[dict[str, Any]] = []

    print("\n==========================================================")
    print(f"🚀 Training CleftGuard AI Model [{arch.upper()}] for {epochs} Epochs")
    print("==========================================================")

    start_time = time.time()
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            train_total += labels.size(0)
            train_correct += (preds == labels).sum().item()

        scheduler.step()

        epoch_train_loss = train_loss / max(1, train_total)
        epoch_train_acc = train_correct / max(1, train_total)
        val_metrics = evaluate(model, val_loader, criterion, device)

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {epoch_train_loss:.4f} | Acc: {epoch_train_acc*100:.1f}% || "
            f"Val Loss: {val_metrics['loss']:.4f} | Acc: {val_metrics['accuracy']*100:.1f}% | "
            f"F1: {val_metrics['f1_score']:.4f} | Sens: {val_metrics['sensitivity']*100:.1f}%"
        )

        epoch_record = {
            "epoch": epoch,
            "train_loss": round(epoch_train_loss, 4),
            "train_acc": round(epoch_train_acc, 4),
            "val_loss": val_metrics["loss"],
            "val_acc": val_metrics["accuracy"],
            "val_f1": val_metrics["f1_score"],
            "val_sensitivity": val_metrics["sensitivity"],
        }
        history.append(epoch_record)

        # Save best model checkpoint based on Validation F1-score
        if val_metrics["f1_score"] >= best_val_f1:
            best_val_f1 = val_metrics["f1_score"]
            torch.save({
                "arch": arch,
                "classes": class_names,
                "model_state_dict": model.state_dict(),
                "val_metrics": val_metrics,
                "epoch": epoch,
            }, str(best_weights_path))

    total_time = time.time() - start_time
    print("==========================================================")
    print(f"✓ Training finished in {total_time:.1f}s | Best Val F1: {best_val_f1:.4f}")
    print(f"💾 Checkpoint saved to -> {best_weights_path}")

    # Final Test Set Evaluation if present
    test_metrics = {}
    if test_loader:
        # Load best weights for test evaluation
        checkpoint = torch.load(str(best_weights_path), map_location=device)
        model.load_state_dict(checkpoint["model_state_dict"])
        test_metrics = evaluate(model, test_loader, criterion, device)
        print("\n🧪 Final Unseen Test Set Evaluation:")
        print(f"   Test Accuracy:    {test_metrics['accuracy']*100:.2f}%")
        print(f"   Test Sensitivity: {test_metrics['sensitivity']*100:.2f}% (Recall on defects)")
        print(f"   Test Specificity: {test_metrics['specificity']*100:.2f}%")
        print(f"   Test F1-Score:    {test_metrics['f1_score']:.4f}")

    # Export metrics metadata
    summary = {
        "arch": arch,
        "classes": class_names,
        "epochs_trained": epochs,
        "training_time_seconds": round(total_time, 2),
        "best_val_f1": best_val_f1,
        "test_metrics": test_metrics,
        "history": history,
    }
    metrics_path = Path(models_dir) / "training_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CleftGuard AI Convolutional Neural Network")
    parser.add_argument("--data-dir", type=str, default="dataset", help="Path to dataset root")
    parser.add_argument("--models-dir", type=str, default="models", help="Directory to save model weights")
    parser.add_argument("--arch", type=str, default="resnet18", choices=["resnet18", "densenet121"], help="Model backbone")
    parser.add_argument("--epochs", type=int, default=8, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size for training")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    args = parser.parse_args()

    train_cleftguard(
        data_dir=args.data_dir,
        models_dir=args.models_dir,
        arch=args.arch,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
    )
