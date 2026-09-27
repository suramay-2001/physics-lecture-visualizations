"""
Chapter opener A: the Hopf fibration (D-L1-scenes §5.3 table A; decisions P3-blender.md).

Frames (scroll-scrubbed, 120 total):
   0-29  the |+z> circle alone; the near-white bead (the state times e^{i chi}) laps it once
  30-59  the theta = 80 deg torus assembles, fibers fading in by phi
  60-89  all five rings (128 fibers) + the |-z> line; shallow depth of field at the origin
  90-119 pull back and rise to look down p3: nested tori read as rings, the |-z> line becomes a point
Geometry = pipeline/blender/data/hopf.json (app/src/physics/hopf.ts via gen_opener_data.ts). Tube radius is
the conformal rule of D §3.5 (constant thickness in S^3, projected), scaled for a 1080-px frame.

Headless:  Blender -b --factory-startup -P pipeline/blender/opener_hopf.py -- --frames 0-119
"""
import math
import os
import sys

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
    "gap": 0.0,
    "out": os.path.join(common.REPO, "app", "public", "openers", "hopf"),
    "_gui": globals().get("ARGS"),
})

DATA = common.load("hopf.json")
TUBE = 1.8  # opener tubes are thicker than the live stage's: a 1080-px still, seen at up to 14 u
# Each segment frames what it introduces (judge ruling P3 #7: the spec's r 9 -> 7 u puts the camera inside the
# theta = 130 deg fibers, which reach |p| = 4.5; its own "unit circle ~22 % of stage width" needs r ~ 18 u).
CAM_KEYS_R = [(0, 6.5), (29, 6.5), (59, 10.0), (89, 18.0), (119, 22.0)]
CAM_KEYS_EL = [(0, 30.0), (29, 30.0), (59, 30.0), (89, 38.0), (119, 80.0)]
CAM_KEYS_AZ = [(0, 0.0), (29, 20.0), (59, 60.0), (89, 120.0), (119, 140.0)]
# depth of field only while all rings are on screen (frames 60-89); f-stop eased in and out
FSTOP_KEYS = [(0, 64.0), (58, 64.0), (68, 2.8), (84, 2.8), (94, 64.0), (119, 64.0)]
# Legibility (judge ruling P3 #8): the two outer rings leave out the fibers whose base point phi falls in a
# band, so the nested inner tori stay visible. Each drawn fiber is still a whole circle (none is clipped);
# the fidelity note says fibers were omitted. GAP = (centre, half-width) in radians.
GAP_C = float(A.get("gap", 0.0))  # opening toward the camera in frames 89 and 119 (look-dev sweep 0, 1.6, 3.2, 4.8)
GAP = {3: (GAP_C, 0.95), 4: (GAP_C, 1.15)}


def conformal_r(p):
    s = p[0] ** 2 + p[1] ** 2 + p[2] ** 2
    return TUBE * min(0.040, max(0.006, 0.010 * (1 + s) / 2))


def fiber_material():
    m = bpy.data.materials.new("fiber")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.42
    bsdf.inputs["Metallic"].default_value = 0.1
    info = nt.nodes.new("ShaderNodeObjectInfo")
    nt.links.new(info.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(info.outputs["Alpha"], bsdf.inputs["Alpha"])
    return m


def state_material():
    """the state colour: the bead and its fiber (reserved near-white; glows per D §1.3)"""
    m = bpy.data.materials.new("state")
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = lin("#f4f6fa", 1.0)
    bsdf.inputs["Roughness"].default_value = 0.35
    bsdf.inputs["Emission Color"].default_value = lin("#f4f6fa", 1.0)
    bsdf.inputs["Emission Strength"].default_value = 0.25
    return m


def curve_object(scn, name, points, closed, radius_of, mat):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 1.0
    cu.bevel_resolution = 3
    cu.resolution_u = 6
    cu.use_fill_caps = True
    sp = cu.splines.new("BEZIER" if len(points) > 2 else "POLY")
    if sp.type == "BEZIER":
        sp.bezier_points.add(len(points) - 1)
        for bp, p in zip(sp.bezier_points, points):
            bp.co = p
            bp.handle_left_type = bp.handle_right_type = "AUTO"
            bp.radius = radius_of(p)
    else:
        sp.points.add(len(points) - 1)
        for pt, p in zip(sp.points, points):
            pt.co = (p[0], p[1], p[2], 1.0)
            pt.radius = radius_of(p)
    sp.use_cyclic_u = closed
    ob = bpy.data.objects.new(name, cu)
    ob.data.materials.append(mat)
    scn.collection.objects.link(ob)
    return ob


def build():
    scn = common.scene("opener_hopf")
    common.configure(scn, samples=A["samples"], percent=A["percent"])
    common.world(scn, fill_strength=0.55)
    common.rig(scn, cam_az_deg=0.0)
    cam = common.camera(scn)
    fmat, smat = fiber_material(), state_material()
    fibers = []
    for f in DATA["fibers"]:
        if f["role"] == "plus":
            ob = curve_object(scn, "fiber_plus", f["points"], True, lambda p: 0.030 * TUBE, smat)
        elif f["role"] == "minus":
            ob = curve_object(scn, "fiber_minus", f["points"], False, lambda p: 0.012 * TUBE, fmat)
        else:
            ob = curve_object(scn, "fiber_" + f["id"], f["points"], True, conformal_r, fmat)
        ob.color = lin(f["hex"], 1.0)
        fibers.append((f, ob))
    bead = sphere(scn, "bead", 0.09)
    bead_mat = bpy.data.materials.new("bead")
    bead_mat.use_nodes = True
    b = bead_mat.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin("#f4f6fa", 1.0)
    b.inputs["Emission Color"].default_value = lin("#f4f6fa", 1.0)
    b.inputs["Emission Strength"].default_value = 1.1
    bead.data.materials.append(bead_mat)
    return scn, cam, fibers, bead


def sphere(scn, name, radius):
    """a smooth UV sphere built with bmesh (no operator: no dependence on the active window or selection)"""
    import bmesh

    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=radius)
    for face in bm.faces:
        face.smooth = True
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    scn.collection.objects.link(ob)
    return ob


def alpha_for(f, fiber, index_in_ring):
    role = fiber["role"]
    if role == "plus":
        return 1.0
    if role == DATA["firstRing"]:
        # the 28 fibers of the 80-degree ring appear one by one in phi order over frames 30-59
        start = 30 + index_in_ring * (25.0 / 28.0)
        return common.smooth((f - start) / 4.0)
    if role in GAP:
        c, hw = GAP[role]
        if abs((fiber["phi"] - c + math.pi) % (2 * math.pi) - math.pi) < hw:
            return 0.0
    # the other rings (inner first) and the |-z> line arrive over frames 60-75
    order = {"minus": 4, 0: 0, 1: 1, 3: 2, 4: 3}[role]
    return common.smooth((f - (60 + 3 * order)) / 4.0)


def main():
    scn, cam, fibers, bead = build()
    per_ring = {}
    ranks = []
    for fiber, _ in fibers:
        k = fiber["role"]
        ranks.append(per_ring.get(k, 0))
        per_ring[k] = per_ring.get(k, 0) + 1

    def apply(f):
        for (fiber, ob), rank in zip(fibers, ranks):
            a = alpha_for(f, fiber, rank)
            ob.hide_render = a <= 0.001
            c = ob.color
            ob.color = (c[0], c[1], c[2], a)
        bead.location = DATA["bead"][f]
        r = common.keyed(f, CAM_KEYS_R)
        common.place(cam, r, common.keyed(f, CAM_KEYS_EL), common.keyed(f, CAM_KEYS_AZ))
        fstop = math.exp(common.keyed(f, [(k, math.log(v)) for k, v in FSTOP_KEYS]))
        cam.data.dof.use_dof = fstop < 60
        cam.data.dof.focus_distance = r
        cam.data.dof.aperture_fstop = fstop

    frames = common.frame_range(A["frames"], DATA["frames"])
    common.render(scn, A["out"], frames, apply)
    return scn


main()
