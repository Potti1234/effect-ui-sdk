import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"

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
      props: { defaultValue: ["reply"] },
      view: (accordion) => {
        const reply = accordion.in("item", { value: "reply" })
        const formatting = accordion.in("item", { value: "formatting" })
        return accordion.root(h.div).children(
          accordion.item(h.div, { value: "reply" }).children(
            reply
              .header(h.h3)
              .children(
                reply
                  .trigger(h.button)
                  .children("Reply to this thread", Chevron(h))
              ),
            reply.panel(
              h.div.children(
                h.div.attr("data-slot", "field").children(
                  h.label
                    .attrs({ "data-slot": "field-label", for: "reply" })
                    .children("Message"),
                  h.textarea.attrs({
                    id: "reply",
                    "data-slot": "textarea",
                    rows: "3",
                    placeholder: "Write a reply…",
                  })
                )
              ),
              { keepMounted: true }
            )
          ),
          accordion
            .item(h.div, { value: "formatting" })
            .children(
              formatting
                .header(h.h3)
                .children(
                  formatting
                    .trigger(h.button)
                    .children("Formatting", Chevron(h))
                ),
              formatting.panel(
                h.div.children(
                  h.p.children(
                    "Use **bold**, _italics_ and `code`. Links paste as previews."
                  )
                )
              )
            )
        )
      },
    }),
})

export { Example }
