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
      props: { defaultValue: "general", orientation: "vertical" },
      view: (tabs) =>
        tabs
          .root(h.div)
          .children(
            tabs
              .list(h.div.attr("aria-label", "Preferences"))
              .children(
                tabs.tab(h.button, { value: "general" }).children("General"),
                tabs.tab(h.button, { value: "security" }).children("Security"),
                tabs
                  .tab(h.button, { value: "integrations" })
                  .children("Integrations")
              ),
            tabs.panel(
              h.div.children(
                "Choose your language, time zone and the page you start on."
              ),
              { value: "general" }
            ),
            tabs.panel(
              h.div.children(
                "Manage passkeys, signed-in sessions and recovery codes."
              ),
              { value: "security" }
            ),
            tabs.panel(
              h.div.children(
                "Connect your calendar and chat apps to get reminders."
              ),
              { value: "integrations" }
            )
          ),
    }),
})

export { Example }
