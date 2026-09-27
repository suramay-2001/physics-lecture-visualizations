"""
Chapter opener B: Dirac's belt trick (D-L1-scenes §5.3 table B; decisions P3-blender.md).

Frames (scroll-scrubbed, 120 total):
   0-39  the block turns 0 -> 360 deg about the vertical; the belt gains one full twist
  40-79  360 -> 720 deg; two twists
  80-119 the block is held still; the belt loops round and ends flat
Every frame's belt (centreline, width direction) and block orientation come from pipeline/blender/data/belt.json
(app/src/physics/belt.ts via gen_opener_data.ts). Faces are told apart by luminance only (front silver
#9aa5b4, back silver-3 #4a5462): no hue, no sign glyph; the DOM caption carries the "-1 after 360 deg" story.

Headless:  Blender -b --factory-startup -P pipeline/blender/opener_belt.py -- --frames 0-119
"""
import os
import sys

import bmesh
import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib  # noqa: E402

import common  # noqa: E402

importlib.reload(common)
from common import lin  # noqa: E402

A = common.parse_args({
    "frames": "0-119",
    "samples": 128,
    "percent": 100,
    "out": os.path.join(common.REPO, "app", "public", "openers", "belt"),
    "_gui": globals().get("ARGS"),
})

DATA = common.load("belt.json")
HALF_W = 0.08  # ribbon half-width (u): wide enough to read the twist at 1080 px
TARGET = (0.0, 0.0, 1.1)
CAM_AZ = [(0, -55.0), (39, -55.0), (79, -45.0), (119, -35.0)]
CAM_EL = [(0, 20.0), (79, 20.0), (119, 30.0)]
CAM_R = [(0, 5.0), (119, 5.0)]  # the loop reaches x ~ +0.7 u: still inside the frame


def steel(name, hex_color, metallic, roughness):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(hex_color, 1.0)
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = roughness
    return m


def belt_material():
    m = bpy.data.materials.new("belt")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Metallic"].default_value = 0.15  # low: the two faces must read their luminance, not the sky
    b.inputs["Roughness"].default_value = 0.5
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    ramp = nt.nodes.new("ShaderNodeValToRGB")  # 0 = front, 1 = back
    ramp.color_ramp.interpolation = "CONSTANT"
    ramp.color_ramp.elements[0].color = lin("#9aa5b4", 1.0)
    ramp.color_ramp.elements[1].position = 0.5
    ramp.color_ramp.elements[1].color = lin("#4a5462", 1.0)
    nt.links.new(geo.outputs["Backfacing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return m


def box(scn, name, size, loc, mat, bevel=0.0):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=bevel, segments=3, affect="EDGES", profile=0.5)
        for f in bm.faces:
            f.smooth = True
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.data.materials.append(mat)
    scn.collection.objects.link(ob)
    return ob


def ribbon_object(scn, mat):
    n = len(DATA["frames"][0]["points"])
    me = bpy.data.meshes.new("belt")
    verts = [(0.0, 0.0, 0.0)] * (2 * n)
    faces = [(2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2) for i in range(n - 1)]
    me.from_pydata(verts, [], faces)
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new("belt", me)
    ob.data.materials.append(mat)
    scn.collection.objects.link(ob)
    return ob


def build():
    scn = common.scene("opener_belt")
    common.configure(scn, samples=A["samples"], percent=A["percent"])
    common.world(scn, fill_strength=0.5)
    common.rig(scn, cam_az_deg=-55.0, rim=1.0)
    cam = common.camera(scn)
    bracket_mat = steel("bracket", "#77818e", 0.85, 0.35)
    block_mat = steel("block", "#a3acb7", 0.95, 0.28)
    mark_mat = steel("mark", "#39414f", 0.7, 0.42)
    top = DATA["frames"][0]["points"][0]
    box(scn, "bracket_bar", (1.1, 0.16, 0.1), (0.0, 0.0, top[2] + 0.12), bracket_mat, bevel=0.012)
    box(scn, "bracket_clamp", (0.3, 0.22, 0.14), (0.0, 0.0, top[2] + 0.02), bracket_mat, bevel=0.012)
    # the block: a 0.6 u chamfered steel cube, a clamp on top where the belt attaches, one dark mark on a side
    # face so a quarter turn is visible (a cube looks the same every 90 deg)
    block = box(scn, "block", (0.6, 0.6, 0.6), (0.0, 0.0, 0.0), block_mat, bevel=0.035)
    clamp = box(scn, "block_clamp", (0.3, 0.2, 0.08), (0.0, 0.0, 0.33), bracket_mat, bevel=0.01)
    mark = box(scn, "block_mark", (0.012, 0.2, 0.2), (0.301, 0.0, 0.0), mark_mat)
    clamp.parent = block
    mark.parent = block
    block.rotation_mode = "QUATERNION"
    belt = ribbon_object(scn, belt_material())
    return scn, cam, block, belt


def main():
    scn, cam, block, belt = build()

    def apply(f):
        fr = DATA["frames"][f]
        w, x, y, z = fr["block"]
        block.rotation_quaternion = (w, x, y, z)  # q and -q are the same rotation; the sign lives in the caption
        co = []
        for p, d in zip(fr["points"], fr["widths"]):
            co.extend((p[0] - HALF_W * d[0], p[1] - HALF_W * d[1], p[2] - HALF_W * d[2]))
            co.extend((p[0] + HALF_W * d[0], p[1] + HALF_W * d[1], p[2] + HALF_W * d[2]))
        belt.data.vertices.foreach_set("co", co)
        belt.data.update()
        common.place(cam, common.keyed(f, CAM_R), common.keyed(f, CAM_EL), common.keyed(f, CAM_AZ), TARGET)

    frames = common.frame_range(A["frames"], len(DATA["frames"]))
    common.render(scn, A["out"], frames, apply)
    return scn


main()
