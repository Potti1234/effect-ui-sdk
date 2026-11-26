import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const policies = [
  {
    value: "shipping",
    label: "Shipping",
    text: "Orders leave our warehouse within two working days. Express delivery arrives the next morning.",
  },
  {
    value: "returns",
    label: "Returns",
    text: "Send anything back within 30 days. Opened electronics carry a restocking fee of 10 percent.",
  },
  {
    value: "warranty",
    label: "Warranty",
    text: "Every product has a two-year warranty. Batteries are covered for one year from delivery.",
  },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Tabs(h, {
      props: { defaultValue: "shipping", hiddenUntilFound: true },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs
            .list(h.div.attr("aria-label", "Policies"))
            .children(
              policies.map((policy) =>
                tabs
                  .tab(h.button.key(policy.value), { value: policy.value })
                  .children(policy.label)
              )
            ),
          policies.map((policy) =>
            tabs.panel(h.div.key(policy.value).children(policy.text), {
              value: policy.value,
            })
          )
        ),
    }),
})

export { Example }
