"""
CleftGuard AI — Synthetic Clinical Dataset Generator.

Generates realistic dental radiographs with alveolar bone graft variations
for training and evaluating convolutional neural networks (Normal vs. Defect).
"""

from __future__ import annotations

import argparse
import os
import random
from pathlib import Path

import cv2
import numpy as np


def generate_single_radiograph(
    is_healthy: bool,
    width: int = 640,
    height: int = 480,
    seed: int | None = None,
) -> np.ndarray:
    """
    Synthesize a single dental radiograph showing either a healthy consolidated
    alveolar bone graft or an alveolar resorption defect.
    """
    if seed is not None:
        np.random.seed(seed)
        random.seed(seed)

    # 1. Base radiograph background with smooth exposure gradient
    base = np.zeros((height, width), dtype=np.float32)
    freq_x = random.uniform(30.0, 50.0)
    freq_y = random.uniform(40.0, 60.0)
    base_val = random.uniform(20.0, 35.0)

    for y in range(height):
        for x in range(width):
            val = base_val + 15.0 * np.sin(x / freq_x) + 10.0 * np.cos(y / freq_y)
            base[y, x] = max(10.0, min(70.0, val))

    # 2. Add anatomical jaw arch (alveolar ridge curve)
    arch_center_x = width // 2 + random.randint(-15, 15)
    arch_center_y = height - 50 + random.randint(-10, 10)
    arch_rx = 260 + random.randint(-15, 15)
    arch_ry = 200 + random.randint(-10, 10)
    
    cv2.ellipse(
        base,
        (arch_center_x, arch_center_y),
        (arch_rx, arch_ry),
        0, 180, 360,
        random.randint(80, 105),
        -1,
    )

    # 3. Add tooth roots and enamel crowns
    tooth_spacing = random.randint(45, 55)
    start_x = width // 2 - (4 * tooth_spacing)
    teeth_positions = [start_x + i * tooth_spacing for i in range(9)]

    for tc in teeth_positions:
        root_w = random.randint(16, 20)
        root_h = random.randint(50, 65)
        crown_h = random.randint(30, 40)
        
        # Root & Crown radiopacity
        cv2.ellipse(base, (tc, 220), (root_w, root_h), 0, 0, 360, random.randint(160, 200), -1)
        cv2.ellipse(base, (tc, 160), (root_w - 3, crown_h), 0, 0, 360, random.randint(200, 240), -1)
        # Pulp radiolucency (dark canal)
        cv2.ellipse(base, (tc, 200), (3, 30), 0, 0, 360, random.randint(50, 80), -1)

    # 4. Alveolar Bone Graft Region of Interest (Center-Horizontal, Lower-Third)
    roi_x0 = width // 3
    roi_x1 = (2 * width) // 3
    roi_y0 = (2 * height) // 3
    roi_y1 = height

    if is_healthy:
        # Healthy: dense bone graft (high radiopacity, uniform trabeculae)
        graft_val = random.randint(155, 185)
        cv2.rectangle(
            base,
            (roi_x0 + random.randint(5, 15), roi_y0 + random.randint(5, 15)),
            (roi_x1 - random.randint(5, 15), roi_y1 - random.randint(5, 15)),
            graft_val,
            -1,
        )
        cv2.ellipse(
            base,
            (width // 2 + random.randint(-10, 10), roi_y0 + 70 + random.randint(-5, 5)),
            (random.randint(65, 85), random.randint(45, 55)),
            0, 0, 360,
            graft_val + random.randint(5, 15),
            -1,
        )
    else:
        # Defect / Resorption: low density, dark radiolucent cavity
        defect_val = random.randint(70, 95)
        cv2.rectangle(
            base,
            (roi_x0 + random.randint(5, 15), roi_y0 + random.randint(5, 15)),
            (roi_x1 - random.randint(5, 15), roi_y1 - random.randint(5, 15)),
            defect_val,
            -1,
        )
        # Deep resorption radiolucency
        cv2.ellipse(
            base,
            (width // 2 + random.randint(-15, 15), roi_y0 + 70 + random.randint(-8, 8)),
            (random.randint(45, 65), random.randint(30, 45)),
            0, 0, 360,
            random.randint(25, 45),
            -1,
        )

    # 5. Add realistic bone trabecular texture noise
    noise_sigma = random.uniform(8.0, 14.0)
    noise = np.random.normal(0, noise_sigma, (height, width)).astype(np.float32)
    image_noisy = np.clip(base + noise, 0, 255).astype(np.uint8)

    # 6. Apply slight clinical X-ray blur / scatter
    ksize = random.choice([(3, 3), (5, 5)])
    image_final = cv2.GaussianBlur(image_noisy, ksize, random.uniform(0.8, 1.3))

    # 7. Add anatomical 'R' and 'L' orientation markers
    cv2.putText(image_final, "R", (25, height - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, 180, 2, cv2.LINE_AA)
    cv2.putText(image_final, "L", (width - 40, height - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, 180, 2, cv2.LINE_AA)

    return image_final


def build_dataset(
    output_dir: str = "dataset",
    train_count: int = 120,
    val_count: int = 30,
    test_count: int = 30,
) -> None:
    """Build a complete partitioned train/val/test dataset for PyTorch ImageFolder."""
    root = Path(output_dir)
    splits = {
        "train": train_count,
        "val": val_count,
        "test": test_count,
    }

    print("==========================================================")
    print(f"🦷 Generating CleftGuard AI Radiograph Dataset -> {root}")
    print(f"   Train: {train_count*2} | Val: {val_count*2} | Test: {test_count*2}")
    print("==========================================================")

    total_created = 0
    for split, count in splits.items():
        normal_dir = root / split / "normal"
        defect_dir = root / split / "defect"
        normal_dir.mkdir(parents=True, exist_ok=True)
        defect_dir.mkdir(parents=True, exist_ok=True)

        for i in range(count):
            # Normal radiograph
            img_normal = generate_single_radiograph(is_healthy=True)
            cv2.imwrite(str(normal_dir / f"scan_normal_{i+1:04d}.png"), img_normal)

            # Defect radiograph
            img_defect = generate_single_radiograph(is_healthy=False)
            cv2.imwrite(str(defect_dir / f"scan_defect_{i+1:04d}.png"), img_defect)
            total_created += 2

    print(f"✓ Dataset generation complete! Total radiographs created: {total_created}")
    print(f"📁 Root dataset path: {root.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic dental radiograph dataset for CleftGuard AI")
    parser.add_argument("--output", type=str, default="dataset", help="Output dataset directory")
    parser.add_argument("--train", type=int, default=120, help="Train samples per class")
    parser.add_argument("--val", type=int, default=30, help="Validation samples per class")
    parser.add_argument("--test", type=int, default=30, help="Test samples per class")
    args = parser.parse_args()

    build_dataset(
        output_dir=args.output,
        train_count=args.train,
        val_count=args.val,
        test_count=args.test,
    )
