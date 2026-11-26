import { hydrateFixture } from "../../ssr/effect-mount"
import { Fixture, props } from "./effect"

// Server renders in Node, then the client hydrates. Every error Effect UI reports is recorded.
function mount(root: HTMLElement) {
  return hydrateFixture(root, Fixture, props())
}

export { mount }
