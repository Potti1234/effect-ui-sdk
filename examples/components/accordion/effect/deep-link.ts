import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"

const items = [
  {
    value: "returns",
    label: "Returns",
    paragraphs: [
      {
        text: "Return any unused item in its original packaging within 30 days.",
      },
      {
        id: "return-label",
        text: "To print a return label, open the order and choose Return. The label is free.",
      },
    ],
  },
  {
    value: "refunds",
    label: "Refunds",
    paragraphs: [
      { text: "Refunds go back to the card you paid with." },
      {
        id: "refund-timeline",
        text: "Timeline: we inspect the item within 2 days of receiving it, and your bank shows the refund 5 to 7 business days later.",
      },
    ],
  },
  {
    value: "exchanges",
    label: "Exchanges",
    paragraphs: [
      {
        text: "Start a return, choose Exchange and pick the new size. Shipping both ways is free.",
      },
    ],
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
    h.div.children(
      h.nav
        .attrs({ "data-slot": "controls", "aria-label": "Jump to" })
        .children(
          h.a
            .attr("href", "#refund-timeline")
            .children("Jump to the refund timeline"),
          h.a.attr("href", "#return-label").children("Print a return label")
        ),
      Accordion(h, {
        props: { hiddenUntilFound: true },
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
                  section.panel(
                    h.div.children(
                      h.div
                        .attr("data-slot", "stack")
                        .children(
                          item.paragraphs.map((paragraph) =>
                            h.p
                              .attr("id", paragraph.id)
                              .children(paragraph.text)
                          )
                        )
                    )
                  )
                )
            })
          ),
      })
    ),
})

export { Example }
