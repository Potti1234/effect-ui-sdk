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
      props: { defaultValue: "account" },
      view: (tabs) =>
        tabs
          .root(h.div)
          .children(
            tabs
              .list(h.div.attr("aria-label", "Settings"))
              .children(
                tabs.tab(h.button, { value: "account" }).children("Account"),
                tabs.tab(h.button, { value: "password" }).children("Password")
              ),
            tabs.panel(
              h.div.children(
                "Update your name, email address and profile photo. Your team sees changes right away."
              ),
              { value: "account" }
            ),
            tabs.panel(
              h.div.children(
                "Choose a new password for hollis@example.com. You stay signed in on this device."
              ),
              { value: "password" }
            )
          ),
    }),
})

export { Example }
