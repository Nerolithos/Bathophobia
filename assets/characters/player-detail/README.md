# Detailed surface character

Original image-model artwork packed by `scripts/prepare-player-detail.py`. No body parts are procedurally redrawn or rotated. Source poses remain in `design/character-animation/source/` and `assets/characters/water-studies-v2/`.

- 56 frames, 128-pixel source height, fixed 192×160 cells and foot baseline 144.
- Surface display: 64 world pixels, nearest-neighbor sampling. Admin preview can switch to the previous 48-pixel mode.
- Cave display: original 40-pixel mode; new water keyframes have palette-mapped 32/40/48 derivatives.
- Collision box remains 14×28; decorative ears/tail do not collide.
- One cached atlas per page; the previous sprites remain the loading/error fallback. The build fingerprints and copies the atlas beside its matching JS.
- Offline dependencies: Python, Pillow, NumPy, SciPy ≥1.14 with NumPy 2. No Python or new runtime packages are needed to build/play the site.

Preparation uses vectorized masks, compiled connected-region detection and stripwise palette mapping. One preparation run takes about 1.2 seconds on the development machine. The original preparation script is not rerun or modified.
