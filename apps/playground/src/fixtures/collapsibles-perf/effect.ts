import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import * as Schema from "effect/Schema"
import { mountWhenAsked, perfSize } from "tests/fixtures/perf.ts"
import { mountFixture } from "../../ssr/effect-mount"

// N closed collapsibles, like the folders of a long tree.
// With ?found, closed panels stay in the page for find in page.
const items = Array.from({ length: perfSize(200) }, (_, index) => index)
const found = new URLSearchParams(location.search).has("found")

const Fixture = Html.component({
  name: "CollapsiblesPerfFixture",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div
      .class("fixture")
      .attr("style", "flex-direction:column;align-items:start")
      .children(
        h.button.children("Before"),
        items.map((index) =>
          Collapsible(h, {
            key: String(index),
            view: (collapsible) =>
              collapsible
                .root(h.div.class("collapsible-row"))
                .children(
                  collapsible
                    .trigger(h.button.class("collapsible-trigger"))
                    .children(`Folder ${index + 1}`),
                  collapsible.panel(
                    h.div
                      .class("collapsible-panel")
                      .children(`Files ${index + 1}`),
                    { hiddenUntilFound: found }
                  )
                ),
          })
        ),
        h.button.children("After")
      ),
})

function mount(root: HTMLElement) {
  mountWhenAsked(root, (target) => void mountFixture(target, Fixture, {}))
}

export { mount }
