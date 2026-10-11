"""
Chapter opener C: Grover's rotation in the plane (Part VII, before Unit 17.2 of chapter Q17; docs/roles/decisions/qc709-deferred-features.md D5).

Frames (scroll-scrubbed, 120 total), N = 8 strings, one marked (101); a "step" turns the state arrow by 2 alpha:
   0-19   the start: the arrow sits at alpha above the |x0-perp> axis, the eight bars are equal
  20-71   steps one and two: the arrow turns by 2 alpha each time and leaves a faint arrow behind; the marked bar grows
  72-119  step three: the arrow passes the vertical and the marked bar shrinks again
Every arrow angle and every bar height comes from pipeline/blender/data/grover.json (app/src/physics/qc/grover.ts via
app/src/openers/openerData.ts and gen_opener_data.ts). The stage ground and the inks come from the same file (stage/tokens.ts).
Nothing is lettered: no number, no axis label (the amber and cobalt outcome hues stay unused). The DOM captions say what the
picture means (openerCopy.ts).

Headless:  Blender -b --factory-startup -P pipeline/blender/opener_grover.py -- --frames 0-119
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib  # noqa: E402

import common  # noqa: E402

importlib.reload(common)
from common import lin  # noqa: E402

A = common.parse_args({
    "frames": "0-119",
    "samples": 128,
    "percent": 100,
    "out": os.path.join(common.REPO, "app", "public", "openers", "grover"),
    "_gui": globals().get("ARGS"),
})

DATA = common.load("grover.json")
INK = DATA["ink"]

# layout (u): the plane stands upright (|x0-perp> across = +x, |x0> up = +z) above a row of N bars
R = 1.5  # the unit circle
PLANE_Z = 1.85  # its centre
BASE_Z = -1.65  # the bars' baseline
BAR_SCALE = 2.0  # u per unit of amplitude: the longest bar (amplitude ~1) stays clear of the circle
BAR_W = 0.4
BAR_D = 0.12  # thin panels in the plane's own sheet, so the baseline never reads as running through a block
BAR_GAP = 0.58  # pitch
ROD = 0.016  # axis / outline thickness
CAM_TARGET = (0.0, 0.0, 0.55)
CAM_R = [(0, 10.4), (119, 10.0)]
CAM_EL = [(0, 5.0), (119, 8.0)]
CAM_AZ = [(0, -98.0), (119, -84.0)]  # camera on the -y side, drifting a few degrees round


def mat(name, hex_color, metallic=0.2, roughness=0.45, emission=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = lin(hex_color, 1.0)
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = roughness
    if emission > 0:
        b.inputs["Emission Color"].default_value = lin(hex_color, 1.0)
        b.inputs["Emission Strength"].default_value = emission
    return m


def link(scn, ob, parent=None):
    scn.collection.objects.link(ob)
    if parent is not None:
        ob.parent = parent
    return ob


def cylinder_along_x(scn, name, length, radius, m, x0=0.0, verts=20):
    """A cylinder with its axis on +x, one end at x0 (so scaling x stretches it away from the origin)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=radius, radius2=radius, depth=1.0)
    # the primitive stands on z with its centre at 0; lay it on +x with its start at the origin and unit length
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "Y"))
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0.5, 0, 0))
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(m)
    ob.location = (x0, 0, 0)
    ob.scale = (length, 1, 1)
    return link(scn, ob)


def cone_along_x(scn, name, length, radius, m):
    """A cone with its base at the origin and its tip at x = length (the arrow head)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=radius, radius2=0.0, depth=length)
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, "Y"))
    bmesh.ops.translate(bm, verts=bm.verts, vec=(length / 2, 0, 0))
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(m)
    return link(scn, ob)


def box(scn, name, m):
    """A unit cube on its own origin (scaled and moved per frame)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=0.02, segments=2, affect="EDGES", profile=0.5)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(m)
    return link(scn, ob)


def circle_outline(scn, name, radius, m):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = ROD
    cu.bevel_resolution = 3
    sp = cu.splines.new("POLY")
    n = 160
    sp.points.add(n - 1)
    sp.use_cyclic_u = True
    for i in range(n):
        t = 2 * math.pi * i / n
        sp.points[i].co = (radius * math.cos(t), 0.0, radius * math.sin(t), 1.0)
    ob = bpy.data.objects.new(name, cu)
    ob.data.materials.append(m)
    ob.location = (0, 0, PLANE_Z)
    return link(scn, ob)


class Arrow:
    """An arrow lying in the xz-plane from the plane's centre, pointing at plane angle phi (from +x towards +z)."""

    def __init__(self, scn, name, shaft_radius, head_radius, head_len, m):
        self.root = bpy.data.objects.new(name, None)
        self.root.location = (0, 0, PLANE_Z)
        self.root.rotation_mode = "XYZ"
        link(scn, self.root)
        self.shaft = cylinder_along_x(scn, name + "_shaft", 1.0, shaft_radius, m)
        self.head = cone_along_x(scn, name + "_head", head_len, head_radius, m)
        self.shaft.parent = self.root
        self.head.parent = self.root
        self.head_len = head_len

    def set(self, plane):
        x, z = plane
        phi = math.atan2(z, x)
        self.root.rotation_euler = (0.0, -phi, 0.0)
        length = R * math.hypot(x, z)
        self.shaft.scale = (max(1e-4, length - self.head_len), 1, 1)
        self.head.location = (length - self.head_len, 0, 0)

    def hide(self, hidden):
        for ob in (self.root, self.shaft, self.head):
            ob.hide_render = hidden
            ob.hide_viewport = hidden


def build():
    scn = common.scene("opener_grover")
    common.configure(scn, samples=A["samples"], percent=A["percent"])
    common.world(scn, bg=DATA["ground"], fill_strength=0.5)
    common.rig(scn, cam_az_deg=-98.0, rim=1.0)
    cam = common.camera(scn, lens=50.0)

    m_state = mat("state", INK["state"], metallic=0.0, roughness=0.35, emission=0.35)
    m_silver = mat("silver", INK["silver"], metallic=0.4, roughness=0.4)
    m_axis = mat("axis", INK["silver2"], metallic=0.2, roughness=0.5)
    m_dim = mat("dim", INK["silver3"], metallic=0.2, roughness=0.55)

    # the plane: the unit circle and the two axes (|x0-perp> across, |x0> up)
    circle_outline(scn, "unit_circle", R, m_axis)
    across = cylinder_along_x(scn, "axis_across", 2 * R + 0.5, ROD, m_silver, x0=-R - 0.25)
    across.location = (-R - 0.25, 0, PLANE_Z)
    up = cylinder_along_x(scn, "axis_up", 2 * R + 0.5, ROD, m_silver, x0=0.0)
    up.location = (0, 0, PLANE_Z - R - 0.25)
    up.rotation_euler = (0.0, -math.pi / 2, 0.0)

    # the state arrow, its faint predecessors (one per step left behind), the shadow on the vertical axis and the arc of the last turn
    arrow = Arrow(scn, "state", 0.034, 0.1, 0.26, m_state)
    trail = [Arrow(scn, f"trail{i}", 0.02, 0.06, 0.18, m_axis) for i in range(3)]
    shadow = cylinder_along_x(scn, "shadow", 1.0, 0.05, m_state)
    shadow.rotation_euler = (0.0, -math.pi / 2, 0.0)
    shadow.location = (0, 0, PLANE_Z)
    drop = cylinder_along_x(scn, "drop", 1.0, ROD * 0.8, m_axis)  # tip -> vertical axis, horizontal
    drop.location = (0, 0, PLANE_Z)
    arc_cu = bpy.data.curves.new("arc", "CURVE")
    arc_cu.dimensions = "3D"
    arc_cu.bevel_depth = ROD * 1.3
    arc_cu.bevel_resolution = 3
    arc_ob = bpy.data.objects.new("arc", arc_cu)
    arc_ob.data.materials.append(m_silver)
    arc_ob.location = (0, 0, PLANE_Z)
    link(scn, arc_ob)

    # the bars: N boxes on a baseline rod; the marked one is the state colour, the others silver
    n = len(DATA["frames"][0]["bars"])
    width = (n - 1) * BAR_GAP + BAR_W + 0.3
    cylinder_along_x(scn, "baseline", width, ROD, m_dim, x0=-width / 2).location.z = BASE_Z
    bars = []
    for i in range(n):
        b = box(scn, f"bar{i}", m_state if i == DATA["marked"] else m_silver)
        b.location = ((i - (n - 1) / 2) * BAR_GAP, 0.0, BASE_Z)
        bars.append(b)
    return scn, cam, arrow, trail, shadow, drop, arc_ob, bars


def set_arc(arc_ob, a0_deg, a1_deg):
    cu = arc_ob.data
    cu.splines.clear()
    r = 0.42 * R
    steps = max(2, int(abs(a1_deg - a0_deg) / 2.0) + 2)
    sp = cu.splines.new("POLY")
    sp.points.add(steps - 1)
    for i in range(steps):
        t = math.radians(a0_deg + (a1_deg - a0_deg) * i / (steps - 1))
        sp.points[i].co = (r * math.cos(t), 0.0, r * math.sin(t), 1.0)


def main():
    scn, cam, arrow, trail, shadow, drop, arc_ob, bars = build()

    def apply(f):
        fr = DATA["frames"][f]
        x, z = fr["plane"]
        arrow.set(fr["plane"])
        for i, t in enumerate(trail):
            if i < len(fr["trail"]):
                t.hide(False)
                t.set(fr["trail"][i])
            else:
                t.hide(True)
        # the vertical shadow of the arrow (the marked amplitude, as a length on the |x0> axis) and the line that drops to it
        shadow.scale = (max(1e-4, abs(z) * R), 1, 1)
        shadow.rotation_euler = (0.0, -math.pi / 2 if z >= 0 else math.pi / 2, 0.0)
        drop.location = (0, 0, PLANE_Z + z * R)
        drop.scale = (max(1e-4, abs(x) * R), 1, 1)
        drop.rotation_euler = (0.0, 0.0, 0.0 if x >= 0 else math.pi)
        # the arc of the turn just made (from the last whole-step arrow, or from the axis at the start)
        a0 = math.degrees(math.atan2(fr["trail"][-1][1], fr["trail"][-1][0])) if fr["trail"] else 0.0
        set_arc(arc_ob, a0, fr["angleDeg"])
        for b, a in zip(bars, fr["bars"]):
            h = max(1e-4, abs(a) * BAR_SCALE)
            b.scale = (BAR_W, BAR_D, h)
            b.location.z = BASE_Z + a * BAR_SCALE / 2
        common.place(cam, common.keyed(f, CAM_R), common.keyed(f, CAM_EL), common.keyed(f, CAM_AZ), CAM_TARGET)

    frames = common.frame_range(A["frames"], len(DATA["frames"]))
    common.render(scn, A["out"], frames, apply)
    return scn


main()
