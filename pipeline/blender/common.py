"""
Shared setup for the chapter-opener renders (D-L1-scenes §5.3; decisions in docs/roles/decisions/P3-blender.md).

Every value the spec pins is set here, so a render is reproducible from the scripts alone:
  Cycles, 128 samples + OpenImageDenoise, film filter 1.5 px, no motion blur, view transform Standard
  (AgX/Filmic would shift the background hex and the fiber ramp), 1080 x 1350, WebP q80, background exactly
  --stage-bg-state #161d2c for camera rays, lights = the app's rig (key #fff4e8, fill sky/ground, rim #a9bcff).

Two ways to run a script that imports this module:
  headless (the real render):  Blender -b --factory-startup -P pipeline/blender/opener_hopf.py -- --frames 0-119
  inside the MCP-connected GUI (look development): exec the script with ARGS = {...}; it builds in its own
  scene (never the user's) and renders only what ARGS asks for.
Blender computes no physics: geometry comes from pipeline/blender/data/*.json (gen_opener_data.ts).
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))

BG_STATE = "#161d2c"
KEY = "#fff4e8"
RIM = "#a9bcff"
FILL_SKY = "#d6def0"
FILL_GROUND = "#1a2130"


def lin(hex_str, alpha=None):
    """sRGB hex -> scene-linear RGB(A) tuple."""
    h = hex_str.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out) + ((alpha,) if alpha is not None else ())


def load(name):
    path = os.path.join(HERE, "data", name)
    if not os.path.exists(path):
        raise SystemExit(f"missing {path}: run `node pipeline/blender/gen_opener_data.ts` from the repo root first")
    with open(path) as f:
        return json.load(f)


def parse_args(defaults):
    """CLI args after `--` (headless) or the ARGS dict the GUI exec passes in."""
    args = dict(defaults)
    gui = defaults.get("_gui")
    if gui:
        args.update(gui)
        return args
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    for i in range(0, len(argv) - 1, 2):
        key = argv[i].lstrip("-")
        args[key] = type(defaults[key])(argv[i + 1]) if key in defaults and defaults[key] is not None else argv[i + 1]
    return args


def frame_range(spec, total):
    """'0-119' | '60' | '0,30,60,90,119' -> list of frames."""
    out = []
    for part in str(spec).split(","):
        if "-" in part:
            a, b = part.split("-")
            out.extend(range(int(a), int(b) + 1))
        else:
            out.append(int(part))
    return [f for f in out if 0 <= f < total]


def scene(name):
    """Headless: the factory-startup scene, emptied. GUI: a fresh scene of our own; the user's scenes stay untouched."""
    if bpy.app.background:
        scn = bpy.context.scene
        for ob in list(scn.objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        scn.name = name
        return scn
    old = bpy.data.scenes.get(name)
    if old is not None:
        for ob in list(old.objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        bpy.data.scenes.remove(old)
    scn = bpy.data.scenes.new(name)
    bpy.context.window.scene = scn
    return scn


def configure(scn, samples=128, percent=100):
    r = scn.render
    r.engine = "CYCLES"
    scn.cycles.samples = samples
    scn.cycles.use_denoising = True
    scn.cycles.denoiser = "OPENIMAGEDENOISE"
    scn.cycles.filter_width = 1.5
    r.use_motion_blur = False
    r.resolution_x, r.resolution_y, r.resolution_percentage = 1080, 1350, percent
    r.film_transparent = False
    r.use_persistent_data = True
    r.dither_intensity = 1.0  # ~1/255 noise at quantization: no banding on the dark background
    scn.view_settings.view_transform = "Standard"
    scn.view_settings.look = "None"
    scn.view_settings.exposure = 0.0
    scn.view_settings.gamma = 1.0
    scn.display_settings.display_device = "sRGB"
    s = r.image_settings
    s.file_format = "WEBP"
    s.color_mode = "RGB"
    s.quality = 80
    if bpy.app.background:
        # factory-startup prefs are not saved; the GUI user's preferences are never touched
        prefs = bpy.context.preferences.addons["cycles"].preferences
        try:
            prefs.compute_device_type = "METAL"
            prefs.get_devices()
            for d in prefs.devices:
                d.use = d.type != "CPU"
            scn.cycles.device = "GPU" if any(d.use for d in prefs.devices) else "CPU"
        except TypeError:
            scn.cycles.device = "CPU"


def world(scn, bg=BG_STATE, fill_strength=0.45):
    """Camera rays see exactly `bg`; everything else is lit by a sky/ground fill (the app's hemisphere light)."""
    w = bpy.data.worlds.new(scn.name + "_world")
    scn.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    cam_bg = nt.nodes.new("ShaderNodeBackground")
    cam_bg.inputs["Color"].default_value = lin(bg, 1.0)
    cam_bg.inputs["Strength"].default_value = 1.0
    fill = nt.nodes.new("ShaderNodeBackground")
    fill.inputs["Strength"].default_value = fill_strength
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = lin(FILL_GROUND, 1.0)
    ramp.color_ramp.elements[1].position = 0.65
    ramp.color_ramp.elements[1].color = lin(FILL_SKY, 1.0)
    rng = nt.nodes.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = -1.0
    rng.inputs["From Max"].default_value = 1.0
    lp = nt.nodes.new("ShaderNodeLightPath")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], rng.inputs["Value"])
    nt.links.new(rng.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], fill.inputs["Color"])
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(fill.outputs["Background"], mix.inputs[1])
    nt.links.new(cam_bg.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    return w


def sun(scn, name, hex_color, strength, az_deg, el_deg, angle_deg=8.0):
    """A sun shining FROM (az, el) toward the origin (physics axes = Blender axes)."""
    d = bpy.data.lights.new(name, "SUN")
    d.color = lin(hex_color)
    d.energy = strength
    d.angle = math.radians(angle_deg)
    ob = bpy.data.objects.new(name, d)
    scn.collection.objects.link(ob)
    az, el = math.radians(az_deg), math.radians(el_deg)
    towards = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)))
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = towards.to_track_quat("Z", "Y")  # a sun lights along its local -Z
    return ob


def rig(scn, cam_az_deg, rim=0.8):
    """The app's light rig (D §1.7), directions relative to the camera's starting azimuth."""
    sun(scn, "key", KEY, 3.2, cam_az_deg + 40, 50)
    sun(scn, "rim", RIM, 1.6 * rim, cam_az_deg + 200, 20)


def camera(scn, lens=50.0):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_fit = "AUTO"
    cd.clip_start = 0.05
    cd.clip_end = 200
    cam = bpy.data.objects.new("cam", cd)
    scn.collection.objects.link(cam)
    scn.camera = cam
    cam.rotation_mode = "QUATERNION"
    return cam


def place(cam, r, el_deg, az_deg, target=(0.0, 0.0, 0.0)):
    az, el = math.radians(az_deg), math.radians(el_deg)
    t = Vector(target)
    cam.location = t + Vector((r * math.cos(el) * math.cos(az), r * math.cos(el) * math.sin(az), r * math.sin(el)))
    cam.rotation_quaternion = (t - cam.location).to_track_quat("-Z", "Y")


def smooth(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def keyed(f, keys):
    """Piecewise smoothstep between (frame, value) keys: the camera arrives at each key view and settles."""
    if f <= keys[0][0]:
        return keys[0][1]
    for (fa, va), (fb, vb) in zip(keys, keys[1:]):
        if f <= fb:
            s = smooth((f - fa) / (fb - fa))
            return va + (vb - va) * s
    return keys[-1][1]


def render(scn, out_dir, frames, apply):
    os.makedirs(out_dir, exist_ok=True)
    for f in frames:
        apply(f)
        scn.frame_set(f)
        scn.render.filepath = os.path.join(out_dir, f"{f:04d}")
        bpy.ops.render.render(write_still=True, scene=scn.name)
        print(f"frame {f:04d} done", flush=True)
