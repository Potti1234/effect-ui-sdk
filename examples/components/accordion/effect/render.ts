import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"

const steps = [
  {
    value: "install",
    label: "Install the package",
    content: "Add it with your package manager. It has no dependencies.",
  },
  {
    value: "import",
    label: "Import the parts",
    content: "Import the accordion parts you need from the package.",
  },
  {
    value: "style",
    label: "Style it",
    content: "Every part renders its state as data attributes you can style.",
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
    Accordion(h, {
      props: { multiple: true, defaultValue: ["install"] },
      view: (accordion) =>
        accordion.root(h.div).children(
          steps.map((step) => {
            const section = accordion.in("item", { value: step.value })
            const trigger = section.trigger.state()
            return accordion
              .item(h.div.key(step.value), { value: step.value })
              .children(
                section.header(h.h4).children(
                  section.trigger(h.button).children(
                    trigger.index >= 0 &&
                      h.span
                        .attrs({
                          "data-slot": "hint",
                          "aria-hidden": "true",
                        })
                        .children(String(trigger.index + 1).padStart(2, "0")),
                    h.span.children(step.label),
                    h.span
                      .attrs({ "data-slot": "hint", "aria-hidden": "true" })
                      .children(trigger.open ? "Hide" : "Show")
                  )
                ),
                section.panel(h.div.children(step.content))
              )
          })
        ),
    }),
})

export { Example }
