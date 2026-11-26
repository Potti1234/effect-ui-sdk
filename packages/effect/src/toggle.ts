import {
  toggle,
  toggleGroup,
  type ToggleGroupApi,
  type TogglePrimitive,
} from "@ui-sdk/core/toggle"
import type * as Component from "@effect/ui/Component"
import {
  createParts,
  type EffectEvents,
  type EffectParts,
  type EffectProps,
} from "./create-parts"

const toggleParts = createParts(toggle, {
  name: "Toggle",
  tags: { root: "button", icon: "span" },
})

/**
 * A button that stays pressed. Its `view` gets the `root` for its button and
 * the `icon` inside it. To join a group, pass its `join` as `group`; in a
 * toolbar, pass `toolbarScope(toolbar.join)` as `toolbar`.
 * @stable
 */
const Toggle = toggleParts as unknown as Component.Headless<
  EffectProps<TogglePrimitive> & {
    /** The group it joins: a ToggleGroup's `join`. */
    readonly group?: () => ToggleGroupApi | undefined
  },
  EffectEvents<TogglePrimitive>,
  EffectParts<TogglePrimitive, { root: "button"; icon: "span" }>
>

/**
 * Toggles that share one value, with one tab stop and arrow keys between
 * them. Its `view` gets the `group` part and `join`, which each toggle in it
 * takes as `group`.
 * @stable
 */
const ToggleGroup = createParts(toggleGroup, {
  name: "ToggleGroup",
  tags: { group: "div" },
  state: "group",
})

export {
  createToggleController,
  createToggleGroupController,
} from "@ui-sdk/core/toggle"
export type {
  ToggleApi,
  ToggleChangeOptions,
  ToggleController,
  ToggleGroupApi,
  ToggleGroupChangeOptions,
  ToggleGroupController,
  ToggleGroupOptions,
  ToggleGroupOrientation,
  ToggleGroupPrimitive,
  ToggleGroupState,
  ToggleGroupValueChangeReason,
  ToggleIconProps,
  ToggleIconState,
  ToggleOptions,
  TogglePressedChangeReason,
  TogglePrimitive,
  ToggleState,
} from "@ui-sdk/core/toggle"

export { Toggle, ToggleGroup }
