#!/usr/bin/env python3
"""
Render PDB files from multiple angles using PyMOL headless.

Usage:
    python visualize.py                          # render all PDBs in outputs/
    python visualize.py outputs/barrel_0.pdb     # render a specific file
    python visualize.py *.pdb                    # render specific files
"""

import os
import sys
import glob

# Headless PyMOL
import pymol
from pymol import cmd

pymol.pymol_argv = ["pymol", "-qc"]  # quiet, no GUI
pymol.finish_launching(["pymol", "-qc"])

VIEWS = {
    "front":  (0, 0),
    "side":   (0, 90),
    "top":    (90, 0),
    "angle1": (30, 45),
    "angle2": (30, -45),
    "back":   (0, 180),
}

RENDER_WIDTH = 1200
RENDER_HEIGHT = 900


def render_pdb(pdb_path, out_dir):
    name = os.path.splitext(os.path.basename(pdb_path))[0]
    pdb_out = os.path.join(out_dir, name)
    os.makedirs(pdb_out, exist_ok=True)

    cmd.reinitialize()
    cmd.load(pdb_path, name)

    # Style: cartoon with rainbow coloring by residue
    cmd.hide("everything", name)
    cmd.show("cartoon", name)
    cmd.spectrum("count", "rainbow", name)
    cmd.set("cartoon_fancy_helices", 1)
    cmd.set("cartoon_smooth_loops", 1)
    cmd.set("ray_opaque_background", 1)
    cmd.set("bg_rgb", "[1,1,1]")
    cmd.set("antialias", 2)
    cmd.set("ray_trace_mode", 1)

    cmd.zoom(name, buffer=5)

    for view_name, (rot_x, rot_y) in VIEWS.items():
        cmd.reset()
        cmd.zoom(name, buffer=5)
        cmd.rotate("x", rot_x)
        cmd.rotate("y", rot_y)

        out_path = os.path.join(pdb_out, f"{view_name}.png")
        cmd.ray(RENDER_WIDTH, RENDER_HEIGHT)
        cmd.png(out_path, dpi=150)
        print(f"  {view_name:8s} -> {out_path}")

    # Also render a surface view from the front angle
    cmd.reset()
    cmd.zoom(name, buffer=5)
    cmd.rotate("x", 30)
    cmd.rotate("y", 45)
    cmd.show("surface", name)
    cmd.set("surface_color", "white")
    cmd.set("transparency", 0.5)
    out_path = os.path.join(pdb_out, "surface.png")
    cmd.ray(RENDER_WIDTH, RENDER_HEIGHT)
    cmd.png(out_path, dpi=150)
    print(f"  {'surface':8s} -> {out_path}")

    print(f"Done: {name} ({len(VIEWS)+1} renders)\n")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, "renders")
    os.makedirs(out_dir, exist_ok=True)

    # Collect PDB files
    if len(sys.argv) > 1:
        pdb_files = sys.argv[1:]
    else:
        pdb_files = sorted(glob.glob(os.path.join(script_dir, "outputs", "*.pdb")))

    if not pdb_files:
        print("No PDB files found. Pass paths as arguments or put them in outputs/")
        sys.exit(1)

    print(f"Rendering {len(pdb_files)} PDB file(s) from {len(VIEWS)+1} angles each\n")

    for pdb_path in pdb_files:
        print(f"Rendering: {os.path.basename(pdb_path)}")
        render_pdb(pdb_path, out_dir)

    print(f"All renders saved to: {out_dir}")


if __name__ == "__main__":
    main()
