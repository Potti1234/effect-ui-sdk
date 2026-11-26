import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"

const sections: {
  value: string
  label: string
  content?: string
  topics?: { value: string; label: string; content: string }[]
}[] = [
  {
    value: "profile",
    label: "Profile",
    content: "Your name, photo and the email address people see.",
  },
  {
    value: "notifications",
    label: "Notifications",
    topics: [
      {
        value: "email",
        label: "Email",
        content: "A weekly digest, and mentions as they happen.",
      },
      {
        value: "push",
        label: "Push",
        content: "Direct messages and replies to your comments.",
      },
    ],
  },
  {
    value: "billing",
    label: "Billing",
    topics: [
      {
        value: "payment",
        label: "Payment methods",
        content: "A Visa card ending in 4242, used for every renewal.",
      },
      {
        value: "invoices",
        label: "Invoices",
        content: "Download a PDF of any invoice from the last two years.",
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
    Accordion(h, {
      props: { defaultValue: ["notifications"] },
      view: (outerAccordion) =>
        outerAccordion.root(h.div).children(
          sections.map((section) => {
            const outer = outerAccordion.in("item", { value: section.value })
            const { topics } = section
            return outerAccordion
              .item(h.div.key(section.value), { value: section.value })
              .children(
                outer
                  .header(h.h3)
                  .children(
                    outer.trigger(h.button).children(section.label, Chevron(h))
                  ),
                outer.panel(
                  h.div.children(
                    topics
                      ? Accordion(h, {
                          key: section.value,
                          props: { multiple: true },
                          view: (innerAccordion) =>
                            innerAccordion.root(h.div).children(
                              topics.map((topic) => {
                                const inner = innerAccordion.in("item", {
                                  value: topic.value,
                                })
                                return innerAccordion
                                  .item(h.div.key(topic.value), {
                                    value: topic.value,
                                  })
                                  .children(
                                    inner
                                      .header(h.h4)
                                      .children(
                                        inner
                                          .trigger(h.button)
                                          .children(topic.label, Chevron(h))
                                      ),
                                    inner.panel(h.div.children(topic.content))
                                  )
                              })
                            ),
                        })
                      : h.div.children(section.content ?? "")
                  )
                )
              )
          })
        ),
    }),
})

export { Example }
