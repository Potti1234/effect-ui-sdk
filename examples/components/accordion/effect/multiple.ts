import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"

const items = [
  {
    value: "notifications",
    label: "Notification settings",
    content: "Choose what we email you about, and how often.",
  },
  {
    value: "privacy",
    label: "Privacy and security",
    content: "Turn on two-factor authentication and review signed-in devices.",
  },
  {
    value: "billing",
    label: "Billing and subscription",
    content: "Update your payment method and download past invoices.",
  },
]

const Chevron = <M>(h: Html.H<M>) =>
  h
    .el("svg")
    .attrs({
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    })
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Accordion(h, {
      props: { multiple: true, defaultValue: ["notifications"] },
      view: (accordion) =>
        accordion.root(h.div).children(
          items.map((item) => {
            const section = accordion.in("item", { value: item.value })
            return accordion
              .item(h.div.key(item.value), { value: item.value })
              .children(
                section
                  .header(h.h3)
                  .children(
                    section.trigger(h.button).children(item.label, Chevron(h))
                  ),
                section.panel(h.div.children(item.content))
              )
          })
        ),
    }),
})

export { Example }
