import { toolbar, type ToolbarApi } from "@ui-sdk/core/toolbar"
import { createParts } from "./create-parts"

/**
 * A row of controls with one tab stop and arrow keys between them. Its
 * `view` gets the `root`, `button`, `link`, `input`, `group` and `separator`
 * parts; `toolbar.in("group", { id, disabled })` gives the items inside a
 * group. Toggles and toggle groups join it through `toolbarScope`.
 * @stable
 */
const Toolbar = createParts(toolbar, {
  name: "Toolbar",
  tags: {
    root: "div",
    button: "button",
    link: "a",
    input: "input",
    group: "div",
    separator: "div",
  },
})

/**
 * What a toggle or a toggle group passes as `toolbar` to join one.
 * @stable
 */
type ToolbarScope = () =>
  ReturnType<ToolbarApi["internal"]["scopeIn"]> | undefined

const scopes = new WeakMap<object, Partial<Record<string, ToolbarScope>>>()

/**
 * Joins a toggle or a toggle group to a toolbar: pass the toolbar's `join`,
 * and whether the toolbar group around it is disabled. The same function for
 * the same arguments, so the toggle's options don't change on every render.
 * @stable
 */
function toolbarScope(join: () => ToolbarApi | undefined, disabled = false) {
  const made = scopes.get(join) ?? {}
  scopes.set(join, made)
  return (made[String(disabled)] ??= () => join()?.internal.scopeIn(disabled))
}

export { createToolbarController } from "@ui-sdk/core/toolbar"
export type {
  ToolbarApi,
  ToolbarButtonProps,
  ToolbarButtonState,
  ToolbarController,
  ToolbarGroupProps,
  ToolbarGroupState,
  ToolbarInputProps,
  ToolbarInputState,
  ToolbarLinkState,
  ToolbarOptions,
  ToolbarOrientation,
  ToolbarPrimitive,
  ToolbarState,
  ToolbarSeparatorState,
} from "@ui-sdk/core/toolbar"

export { Toolbar, toolbarScope, type ToolbarScope }
