import { hydrateFixture } from "../../ssr/effect-mount"
import { Fixture, props } from "./effect"

// Server renders in Node, then the client hydrates. Every error Effect UI reports is recorded.
// With ?hydrate=manual, the page stays server markup until window.hydrate() runs.
function mount(root: HTMLElement) {
  return hydrateFixture(root, Fixture, props(), { manual: true })
}

export { mount }
