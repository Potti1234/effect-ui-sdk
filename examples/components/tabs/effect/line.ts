import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Tabs(h, {
      props: { defaultValue: "overview" },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs
            .list(h.div.attr("aria-label", "Dashboard"))
            .children(
              tabs.tab(h.button, { value: "overview" }).children("Overview"),
              tabs.tab(h.button, { value: "analytics" }).children("Analytics"),
              tabs.tab(h.button, { value: "reports" }).children("Reports"),
              tabs.indicator(h.span)
            ),
          tabs.panel(
            h.div.children(
              "Revenue, visitors and sign-ups for the last 30 days."
            ),
            { value: "overview" }
          ),
          tabs.panel(
            h.div.children("Where visitors come from and what they do."),
            { value: "analytics" }
          ),
          tabs.panel(h.div.children("Monthly reports, ready to download."), {
            value: "reports",
          })
        ),
    }),
})

export { Example }
