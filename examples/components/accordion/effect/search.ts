import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"

const faq = [
  {
    value: "returns",
    question: "What is your return policy?",
    answer:
      "Return any unused item within 30 days. Once it reaches us, your refund is on its way.",
  },
  {
    value: "refunds",
    question: "How long do refunds take?",
    answer:
      "Refunds reach your card within 5 to 7 business days after we receive the item.",
  },
  {
    value: "shipping",
    question: "Do you ship internationally?",
    answer:
      "We ship to 40 countries. Duties are included in the price at checkout.",
  },
  {
    value: "tracking",
    question: "How do I track my order?",
    answer:
      "Every shipping email has a tracking link. You'll also find it under Orders.",
  },
  {
    value: "exchange",
    question: "Can I exchange an item for another size?",
    answer:
      "Yes. Start a return, choose Exchange and pick the new size. Shipping is free.",
  },
  {
    value: "gift",
    question: "Can I send an order as a gift?",
    answer:
      "Add a gift note at checkout and we'll leave the prices off the packing slip.",
  },
]

function matches(question: (typeof faq)[number], query: string) {
  const search = query.trim().toLowerCase()
  return (
    !search ||
    question.question.toLowerCase().includes(search) ||
    question.answer.toLowerCase().includes(search)
  )
}

function highlight(text: string, query: string) {
  const search = query.trim().toLowerCase()
  if (!search) {
    return [{ text, match: false }]
  }
  const parts: { text: string; match: boolean }[] = []
  let start = 0
  for (let index = text.toLowerCase().indexOf(search); index !== -1;) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), match: false })
    }
    parts.push({ text: text.slice(index, index + search.length), match: true })
    start = index + search.length
    index = text.toLowerCase().indexOf(search, start)
  }
  if (start < text.length) {
    parts.push({ text: text.slice(start), match: false })
  }
  return parts
}

const Highlight = <M>(h: Html.H<M>, text: string, query: string) =>
  highlight(text, query).map((part) =>
    part.match ? h.mark.children(part.text) : part.text
  )

const ExampleMessage = UiSchema.TaggedEnum({
  UpdatedQuery: { query: Schema.String },
  RequestedValueChangeQuestions: { value: Schema.Array(Schema.String) },
})

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
  model: Schema.Struct({
    query: Schema.String,
    value: Schema.Array(Schema.String),
  }),
  message: ExampleMessage,
}).make({
  init: () => ({ query: "", value: [] }),
  update: {
    UpdatedQuery: ($, { query }) =>
      $.evolve({
        query,
        value: query.trim()
          ? faq
              .filter((question) => matches(question, query))
              .map((question) => question.value)
          : [],
      }),
    RequestedValueChangeQuestions: ($, { value }) => $.evolve({ value }),
  },
  view: (h, model) => {
    const results = faq.filter((question) => matches(question, model.query))
    return h.div.children(
      h.div.attr("data-slot", "controls").children(
        h.input
          .attrs({
            type: "search",
            "aria-label": "Search questions",
            placeholder: "Search questions…",
          })
          .value(model.query)
          .on("input", ({ value }) =>
            ExampleMessage.UpdatedQuery({ query: value })
          )
      ),
      Accordion(h, {
        props: { multiple: true, value: model.value },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? ExampleMessage.RequestedValueChangeQuestions({
                value: event.value,
              })
            : undefined,
        view: (accordion) =>
          accordion.root(h.div).children(
            results.map((question) => {
              const section = accordion.in("item", { value: question.value })
              return accordion
                .item(h.div.key(question.value), { value: question.value })
                .children(
                  section
                    .header(h.h3)
                    .children(
                      section
                        .trigger(h.button)
                        .children(
                          h.span.children(
                            Highlight(h, question.question, model.query)
                          ),
                          Chevron(h)
                        )
                    ),
                  section.panel(
                    h.div.children(Highlight(h, question.answer, model.query))
                  )
                )
            })
          ),
      }),
      h.p
        .attrs({ "data-slot": "hint", role: "status" })
        .children(
          results.length === 0 ? `No questions match “${model.query}”.` : ""
        )
    )
  },
})

export { Example }
