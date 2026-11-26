import { avatar } from "@ui-sdk/core/avatar"
import { createParts } from "./create-parts"

/**
 * A box for an image and its fallback. Its `view` gets the `root`, the
 * `image`, a real <img> hidden until it loads, and the `fallback`, shown
 * while there's no loaded image, after its `delay`.
 * @stable
 */
const Avatar = createParts(avatar, {
  name: "Avatar",
  tags: { root: "span", image: "img", fallback: "span" },
  present: ["fallback"],
})

export type {
  AvatarFallbackProps,
  AvatarLoadingStatus,
  AvatarLoadingStatusChangeReason,
  AvatarOptions,
  AvatarPrimitive,
  AvatarState,
} from "@ui-sdk/core/avatar"

export { Avatar }
