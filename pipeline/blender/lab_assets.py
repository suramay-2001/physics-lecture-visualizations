"""
Stern-Gerlach bench hardware as one GLB (D-L1-scenes §5.1-5.2; rulings in docs/roles/decisions/P3-blender.md).

What is here: the parts that dress the procedural bench — yoke with bolt heads, coil packs in dark tape (no
copper: copper reads as amber, which is reserved), the gradient-arrow mount, the oven with heat shields, rear
flange and stand, the slit on a U-bracket, the plate frame with foot, the beam stop with stem and clamp, and a
rail profile. What is NOT here (ruling #2): the knife-edge and groove pole pieces — their profile is what the
field lines and atoms are drawn against, and they morph to flat poles, so they stay exact in code
(app/src/stage/scenes/lab/geometry.ts).

Frames and units (ruling #3): 1 Blender unit = 1 app unit u; every part in the frame the rig already uses:
  module parts: entrance at y = 0, exit at y = L = 3.2, x across the poles, z up (yoke on the -x side)
  oven: mouth centre at the origin, body toward -y      slit: centre on the beam      plate frame: glass centre
  beam stop: block centre                                rail: profile along y, length 1 (the rig scales y)
Exported with +Y up OFF: glTF coordinates = Blender = physics axes; the app bakes nothing but node matrices.
Geometry only: no materials, no UVs, no textures (the app owns every material; ruling #1: no compression).

Headless:  Blender -b --factory-startup -P pipeline/blender/lab_assets.py -- --out app/public/models/lab.glb
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib  # noqa: E402

import common  # noqa: E402

importlib.reload(common)

A = common.parse_args({
    "out": os.path.join(common.REPO, "app", "public", "models", "lab.glb"),
    "export": 1,
    "_gui": globals().get("ARGS"),
})

L = 3.2          # module length (layout.ts LAB.L)
RAIL_TOP = -1.99  # FLOOR_Z (-2.15) + rail height 0.16, relative to the beam
CH = 0.02        # chamfer on hard edges: catches the key light


# ── bmesh builders (each returns nothing; they add to `bm`) ─────────────────────────────────────────────
def box(bm, x0, x1, y0, y1, z0, z1, chamfer=CH):
    """axis-aligned box with chamfered edges; flat faces flat-shaded, bevel faces smooth"""
    tmp = bmesh.new()
    bmesh.ops.create_cube(tmp, size=1.0)
    bmesh.ops.scale(tmp, vec=(x1 - x0, y1 - y0, z1 - z0), verts=tmp.verts)
    bmesh.ops.translate(tmp, vec=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), verts=tmp.verts)
    if chamfer > 0:
        res = bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=chamfer, segments=2, affect="EDGES", profile=0.5)
        for f in res["faces"]:
            f.smooth = True
    _append(bm, tmp)


def cylinder(bm, r, depth, center, axis="Y", segments=32, r2=None, smooth=True):
    tmp = bmesh.new()
    rot = {"X": Matrix.Rotation(math.pi / 2, 4, "Y"), "Y": Matrix.Rotation(math.pi / 2, 4, "X"), "Z": Matrix.Identity(4)}[axis]
    m = Matrix.Translation(Vector(center)) @ rot
    res = bmesh.ops.create_cone(tmp, cap_ends=True, cap_tris=False, segments=segments, radius1=r, radius2=r if r2 is None else r2, depth=depth, matrix=m)
    if smooth:
        for f in tmp.faces:
            f.smooth = len(f.verts) == 4  # sides smooth, caps flat
    del res
    _append(bm, tmp)


def hex_bolt(bm, center, axis, r=0.055):
    cylinder(bm, r, 0.035, center, axis=axis, segments=6, smooth=False)


def _append(bm, tmp):
    me = bpy.data.meshes.new("_tmp")
    tmp.to_mesh(me)
    tmp.free()
    bm.from_mesh(me)
    bpy.data.meshes.remove(me)


def mesh_object(scn, name, build):
    bm = bmesh.new()
    build(bm)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    scn.collection.objects.link(ob)
    return ob


# ── parts ──────────────────────────────────────────────────────────────────────────────────────────────
def yoke(bm):
    # C-frame closing the circuit on -x: back plate + two arms resting on the poles (envelope of geometry.ts)
    box(bm, -1.53, -1.11, 0.0, L, -1.99, 1.99)
    box(bm, -1.53, 0.77, 0.0, L, 1.57, 1.99)
    box(bm, -1.53, 0.77, 0.0, L, -1.99, -1.57)
    for y in (0.32, L - 0.32):
        for z in (1.78, -1.78):
            hex_bolt(bm, (-1.53 - 0.0175, y, z), "X")      # outer face of the back plate, at the corners
        for x in (-1.3, 0.52):
            hex_bolt(bm, (x, y, 1.99 + 0.0175), "Z")       # top face of the upper arm
            hex_bolt(bm, (x, y, -1.99 - 0.0175), "Z")      # bottom face of the lower arm


def coils(bm):
    # two coil packs wrapped round the back plate, above and below the beam; the arrow sits between them
    for z0, z1 in ((0.58, 1.46), (-1.46, -0.58)):
        box(bm, -1.64, -1.02, -0.1, L + 0.1, z0, z1, chamfer=0.05)
        for k in range(1, 4):  # shallow tape bands: read as windings under a raking light
            z = z0 + (z1 - z0) * k / 4
            box(bm, -1.655, -1.005, -0.115, L + 0.115, z - 0.012, z + 0.012, chamfer=0.006)


def axis_mount(bm):
    # two clamps holding the gradient arrow (geometry.ts: shaft at x = -1.555, y = L/2, z -0.45 … 0.27)
    for z in (-0.32, 0.14):
        box(bm, -1.61, -1.53, L / 2 - 0.09, L / 2 + 0.09, z - 0.035, z + 0.035, chamfer=0.008)


def oven(bm):
    # crucible housing r 0.40, mouth at y = 0 (facing +y), body toward -y; heat shields; rear flange + bolts
    cylinder(bm, 0.38, 0.86, (0, -0.52, 0), "Y", segments=40)
    cylinder(bm, 0.30, 0.09, (0, -0.045, 0), "Y", segments=40, r2=0.38)  # front taper toward the mouth
    for y in (-0.78, -0.42):
        cylinder(bm, 0.425, 0.05, (0, y, 0), "Y", segments=40)
    cylinder(bm, 0.47, 0.05, (0, -0.975, 0), "Y", segments=40)
    for k in range(6):
        a = k * math.pi / 3 + math.pi / 6
        hex_bolt(bm, (0.41 * math.cos(a), -1.0175, 0.41 * math.sin(a)), "Y")
    # stand: post from the housing down to the rail, with a foot plate
    cylinder(bm, 0.05, abs(RAIL_TOP) - 0.38, (0, -0.52, (RAIL_TOP - 0.38) / 2), "Z", segments=16)
    box(bm, -0.24, 0.24, -0.72, -0.32, RAIL_TOP, RAIL_TOP + 0.04, chamfer=0.01)


def slit(bm):
    # two jaws (rig: 1.24 x 0.04 x 0.50 at z = ±0.33) on a U-bracket, with a post to the rail
    for zc in (0.33, -0.33):
        box(bm, -0.62, 0.62, -0.02, 0.02, zc - 0.25, zc + 0.25, chamfer=0.006)
    for x in (-0.68, 0.68):
        box(bm, x - 0.035, x + 0.035, -0.035, 0.035, -0.66, 0.62, chamfer=0.01)
    box(bm, -0.715, 0.715, -0.035, 0.035, -0.72, -0.64, chamfer=0.01)
    box(bm, -0.035, 0.035, -0.035, 0.035, RAIL_TOP, -0.72, chamfer=0.01)
    box(bm, -0.2, 0.2, -0.15, 0.15, RAIL_TOP, RAIL_TOP + 0.04, chamfer=0.01)


def plate_frame(bm):
    # frame round the 2.3 u glass (rig: bars 0.08 at ±1.19) + foot to the floor + base plate
    box(bm, -1.23, 1.23, -0.035, 0.035, 1.15, 1.23)
    box(bm, -1.23, 1.23, -0.035, 0.035, -1.23, -1.15)
    box(bm, 1.15, 1.23, -0.035, 0.035, -1.23, 1.23)
    box(bm, -1.23, -1.15, -0.035, 0.035, -1.23, 1.23)
    box(bm, -0.05, 0.05, -0.05, 0.05, RAIL_TOP, -1.23)
    box(bm, -0.26, 0.26, -0.18, 0.18, RAIL_TOP, RAIL_TOP + 0.04, chamfer=0.01)
    for x in (-1.19, 1.19):
        for z in (-1.19, 1.19):
            hex_bolt(bm, (x, -0.035 - 0.0175, z), "Y", r=0.034)  # inside the 0.08 frame bar


def beam_stop(bm):
    # block 0.30 x 0.12 x 0.30 (hatched face stays in code), stem to below, clamp on the stem
    box(bm, -0.15, 0.15, -0.06, 0.06, -0.15, 0.15, chamfer=0.012)
    cylinder(bm, 0.02, 1.0, (0, 0, -0.65), "Z", segments=12)
    box(bm, -0.05, 0.05, -0.05, 0.05, -0.26, -0.17, chamfer=0.008)


def bench_rail(bm):
    # rail profile extruded along y (length 1, centred): base, web, two top ridges (the rig scales y)
    box(bm, -0.25, 0.25, -0.5, 0.5, -0.08, -0.02, chamfer=0.01)
    box(bm, -0.12, 0.12, -0.5, 0.5, -0.02, 0.05, chamfer=0.008)
    for x in (-0.09, 0.09):
        box(bm, x - 0.025, x + 0.025, -0.5, 0.5, 0.05, 0.08, chamfer=0.006)


PARTS = [
    ("sg_yoke", yoke),
    ("sg_coils", coils),
    ("sg_axis_mount", axis_mount),
    ("oven", oven),
    ("slit", slit),
    ("plate_frame", plate_frame),
    ("beam_stop", beam_stop),
    ("bench_rail", bench_rail),
]


def main():
    scn = common.scene("lab_assets")
    objs = [mesh_object(scn, name, fn) for name, fn in PARTS]
    tris = {}
    for ob in objs:
        ob.data.calc_loop_triangles()
        tris[ob.name] = len(ob.data.loop_triangles)
    print("triangles", tris, "total", sum(tris.values()), flush=True)
    if int(A["export"]):
        os.makedirs(os.path.dirname(A["out"]), exist_ok=True)
        for ob in scn.objects:
            ob.select_set(ob in objs)
        bpy.ops.export_scene.gltf(
            filepath=A["out"],
            export_format="GLB",
            use_selection=True,
            export_yup=False,
            export_apply=True,
            export_texcoords=False,
            export_normals=True,
            export_materials="NONE",
            export_cameras=False,
            export_lights=False,
            export_extras=False,
            export_animations=False,
        )
        print("wrote", A["out"], os.path.getsize(A["out"]), "bytes", flush=True)
    return tris


RESULT = main()
