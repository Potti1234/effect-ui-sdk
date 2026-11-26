import { hydrateFixture } from "../../ssr/effect-mount"
import { Fixture, props } from "./effect"

// Server renders in Node, then the client hydrates. Every error Effect UI
// reports is recorded, and the server's markup is kept for specs that read
// it, under the name the timeline specs use.
function mount(root: HTMLElement) {
  const page = window as unknown as { __serverHtml?: string }
  Object.defineProperty(window, "__serverMarkup", {
    get: () => page.__serverHtml,
  })
  return hydrateFixture(root, Fixture, props())
}

export { mount }
