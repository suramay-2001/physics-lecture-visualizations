/**
 * Stand-in for `@motion-canvas/2d/editor`, the inspector plugin that `makeScene2D` asks the editor to load. That plugin
 * is editor UI (it imports @motion-canvas/ui and preact, not installed here); a headless render needs none of it.
 * Returning null makes Motion Canvas's editorBootstrap skip it (core/lib/app/bootstrap.js).
 */
export default function noEditorPlugin(): null {
  return null
}
