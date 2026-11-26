import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Checkbox } from "@ui-sdk/effect/checkbox"
import { Field } from "@ui-sdk/effect/field"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const ExampleMessage = UiSchema.TaggedEnum({
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
})

const Check = <M>(h: Html.H<M>) =>
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
    .children(h.el("path").attr("d", "M20 6 9 17l-5-5"))

const options = [
  {
    props: { name: "terms", value: "yes", required: true },
    label: "Accept terms and conditions",
    description: "You agree to our Terms of Service and Privacy Policy.",
  },
  {
    props: { name: "newsletter", value: "weekly", defaultChecked: true },
    label: "Send me the weekly newsletter",
    description: "Product news and tips, once a week. Unsubscribe anytime.",
  },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    SubmittedForm: ($, { entries }) =>
      $.set(null).run(
        log(
          entries.length
            ? `Submitted ${entries.map(([name, value]) => `${name}=${value}`).join("&")}`
            : "Submitted nothing"
        )
      ),
  },
  view: (h) =>
    h.form
      .attr("data-slot", "stack")
      .on("submit", ({ entries }) => ExampleMessage.SubmittedForm({ entries }))
      .children(
        options.map((option) =>
          Checkbox(h, {
            key: option.props.name,
            props: option.props,
            view: (checkbox) =>
              Field(h, {
                view: (field) =>
                  field
                    .root(h.div)
                    .children(
                      field
                        .control(checkbox.root(h.button))
                        .children(
                          checkbox.indicator(h.span.children(Check(h)))
                        ),
                      checkbox.input(h.input),
                      h.div
                        .attr("data-slot", "stack")
                        .children(
                          field.label(h.label).children(option.label),
                          field.description(h.p).children(option.description)
                        )
                    ),
              }),
          })
        ),
        h.div
          .attr("data-slot", "row")
          .children(
            h.button.attr("type", "submit").children("Create Account"),
            h.button.attr("type", "reset").children("Reset")
          )
      ),
})

export { Example }
