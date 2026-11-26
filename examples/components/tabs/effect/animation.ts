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
        tabs
          .root(h.div)
          .children(
            tabs
              .list(h.div.attr("aria-label", "Project"))
              .children(
                tabs.tab(h.button, { value: "overview" }).children("Overview"),
                tabs.tab(h.button, { value: "activity" }).children("Activity"),
                tabs.tab(h.button, { value: "settings" }).children("Settings"),
                tabs.indicator(h.span)
              ),
            h.div
              .attr("data-slot", "stack")
              .children(
                tabs.panel(
                  h.div.children(
                    "The launch is on track for Friday, with 4 of 6 tasks done."
                  ),
                  { value: "overview" }
                ),
                tabs.panel(
                  h.div.children(
                    "Inès Moreau deployed to production and Kofi Mensah left a review."
                  ),
                  { value: "activity" }
                ),
                tabs.panel(
                  h.div.children(
                    "Rename the project, transfer it to another team or archive it."
                  ),
                  { value: "settings" }
                )
              )
          ),
    }),
})

export { Example }
