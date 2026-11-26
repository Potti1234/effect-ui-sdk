import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Checkbox, CheckboxGroup } from "@ui-sdk/effect/checkbox"
import { Field } from "@ui-sdk/effect/field"
import { RadioGroup } from "@ui-sdk/effect/radio"
import { Switch } from "@ui-sdk/effect/switch"
import * as Schema from "effect/Schema"
import { formsFixture as f, formsOptions } from "tests/fixtures/forms.ts"
import { mountFixture } from "../../ssr/effect-mount"

const Checked = Schema.Union([Schema.Boolean, Schema.Literal("indeterminate")])

const FixtureProps = Schema.Struct({
  plan: Schema.optional(Schema.String),
  readOnly: Schema.Boolean,
  disabled: Schema.Boolean,
  invalid: Schema.optional(Schema.Boolean),
  cancel: Schema.NullOr(Schema.String),
  loop: Schema.optional(Schema.Boolean),
  controlled: Schema.Boolean,
  toppingsRequired: Schema.Boolean,
  nickname: Schema.Boolean,
})

const FixtureMessage = UiSchema.TaggedEnum({
  RequestedChange: {
    name: Schema.String,
    value: Schema.Unknown,
    source: Schema.String,
  },
  SubmittedForm: {
    entries: Schema.Array(Schema.Tuple([Schema.String, Schema.String])),
  },
  ClickedToggleShipping: {},
})

type Change = { value: unknown; source?: string }

const Fixture = Html.component({
  name: "FormsFixture",
  props: FixtureProps,
  model: Schema.Struct({
    action: Schema.String,
    source: Schema.String,
    submitted: Schema.String,
    terms: Checked,
    shipping: Schema.Boolean,
  }),
  message: FixtureMessage,
}).make({
  init: () => ({
    action: "",
    source: "",
    submitted: "",
    terms: false,
    shipping: false,
  }),
  update: {
    RequestedChange: ($, { name, value, source }) => {
      if ($.props.cancel === name) {
        return $.model
      }
      const described = Array.isArray(value) ? value.join(",") : String(value)
      return $.evolve({
        action: `${name}:${described}`,
        source,
        ...(name === f.terms.name
          ? { terms: value as boolean | "indeterminate" }
          : {}),
      })
    },
    SubmittedForm: ($, { entries }) =>
      $.evolve({
        submitted: new URLSearchParams(
          entries.map(([name, value]) => [name, value])
        ).toString(),
      }),
    ClickedToggleShipping: ($) => $.evolve({ shipping: (value) => !value }),
  },
  view: (h, model) => {
    const options = h.props
    const all = f.toppings.items.map((item) => item.value)
    // The Model refuses what the URL cancels, so those controls are controlled.
    const report = (name: string) => (change: Change) =>
      FixtureMessage.RequestedChange({
        name,
        value: change.value,
        source: change.source ?? "",
      })
    const onChecked = (name: string) => (event: Change & { _tag: string }) =>
      event._tag === "CheckedChange" ? report(name)(event) : undefined
    const checkbox = (props: Record<string, unknown>, label: string) =>
      Checkbox(h, {
        key: String(props.key ?? label),
        props,
        view: (box) =>
          h.label.children(
            box
              .root(h.button.class("checkbox"))
              .children(box.indicator(h.span.class("checkbox-indicator"))),
            box.input(h.input),
            label
          ),
      })

    return h.div.class("fixture").children(
      h.button.children("Before"),
      h.form
        .class("form")
        .attrs({ id: f.formId, "aria-label": f.formLabel })
        .on("submit", ({ entries }) =>
          FixtureMessage.SubmittedForm({ entries })
        )
        .children(
          Field(h, {
            key: "terms",
            view: (field) =>
              field.root(h.div).children(
                Checkbox(h, {
                  props: {
                    name: f.terms.name,
                    value: f.terms.value,
                    required: true,
                    readOnly: options.readOnly,
                    ...(options.controlled || options.cancel === f.terms.name
                      ? { checked: model.terms }
                      : {}),
                  },
                  onEmit: onChecked(f.terms.name),
                  view: (terms) =>
                    h.div
                      .class("row")
                      .children(
                        field
                          .control(terms.root(h.button.class("checkbox")))
                          .children(
                            terms.indicator(h.span.class("checkbox-indicator"))
                          ),
                        terms.input(h.input),
                        field.label(h.label).children(f.terms.label)
                      ),
                }),
                field.description(h.p).children(f.terms.description),
                field.error(h.p.class("field-error").children(f.terms.error), {
                  match: "valueMissing",
                })
              ),
          }),

          h.fieldset.children(
            h.legend
              .attr("id", f.toppings.legendId)
              .children(f.toppings.legend),
            CheckboxGroup(h, {
              props: {
                name: f.toppings.name,
                defaultValue: f.toppings.defaultValue,
                allValues: all,
                required: options.toppingsRequired,
                ...(options.cancel === f.toppings.name
                  ? { value: f.toppings.defaultValue }
                  : {}),
              },
              onEmit: (event) =>
                event._tag === "ValueChange"
                  ? report(f.toppings.name)(event)
                  : undefined,
              view: (toppings) =>
                toppings
                  .group(
                    h.div
                      .class("form")
                      .attr("aria-labelledby", f.toppings.legendId)
                  )
                  .children(
                    checkbox(
                      { key: "parent", parent: true, group: toppings.join },
                      f.toppings.parent
                    ),
                    f.toppings.items.map((item) =>
                      checkbox(
                        {
                          key: item.value,
                          value: item.value,
                          group: toppings.join,
                        },
                        item.label
                      )
                    ),
                    toppings.input(h.input)
                  ),
            })
          ),

          f.switches.map((item) =>
            Switch(h, {
              key: item.name,
              props: {
                name: item.name,
                defaultChecked: item.defaultChecked,
                ...(options.cancel === item.name
                  ? { checked: item.defaultChecked }
                  : {}),
              },
              onEmit: onChecked(item.name),
              view: (control) =>
                h.label.children(
                  control
                    .root(h.button.class("switch"))
                    .children(control.thumb(h.span.class("switch-thumb"))),
                  control.input(h.input),
                  item.label
                ),
            })
          ),

          Field(h, {
            key: "plan",
            view: (field) =>
              field.root(h.div).children(
                field.label(h.label).children(f.plan.label),
                RadioGroup(h, {
                  props: {
                    name: f.plan.name,
                    required: true,
                    defaultValue: options.plan,
                    readOnly: options.readOnly,
                    disabled: options.disabled,
                    loop: options.loop,
                    ...(options.cancel === f.plan.name
                      ? { value: options.plan ?? null }
                      : {}),
                  },
                  onEmit: (event) =>
                    event._tag === "ValueChange"
                      ? report(f.plan.name)(event)
                      : undefined,
                  view: (plan) =>
                    field.control(plan.group(h.div.class("form"))).children(
                      f.plan.items.map((item) => {
                        const radio = plan.in("radio", { value: item.value })
                        return h.label.key(item.value).children(
                          plan
                            .radio(h.button.class("radio"), {
                              value: item.value,
                              disabled: item.disabled,
                            })
                            .children(
                              radio.indicator(h.span.class("radio-indicator"))
                            ),
                          plan.input(h.input, {
                            value: item.value,
                            disabled: item.disabled,
                          }),
                          item.label
                        )
                      })
                    ),
                }),
                field.description(h.p).children(f.plan.description),
                field.error(h.p.class("field-error"))
              ),
          }),

          Field(h, {
            key: "email",
            props: { invalid: options.invalid },
            view: (field) =>
              field.root(h.div).children(
                field.label(h.label).children(f.email.label),
                field.control(
                  h.input.attrs({
                    type: "email",
                    name: f.email.name,
                    required: "",
                  })
                ),
                field.description(h.p).children(f.email.description),
                field.error(h.p.class("field-error"))
              ),
          }),

          options.nickname &&
            Field(h, {
              key: "nickname",
              view: (field) =>
                field
                  .root(h.div)
                  .children(
                    field.label(h.label).children(f.nickname.label),
                    field.control(
                      h.input.attrs({ name: f.nickname.name, required: "" })
                    )
                  ),
            }),

          h.fieldset
            .attr("disabled", model.shipping ? "" : undefined)
            .children(
              h.legend.children(f.shipping.legend),
              checkbox({ name: f.shipping.name }, f.shipping.label)
            ),

          h.div
            .class("row")
            .children(
              h.button.attr("type", "submit").children("Save"),
              h.button.attr("type", "reset").children("Reset")
            )
        ),
      checkbox(
        {
          form: f.formId,
          name: f.newsletter.name,
          value: f.newsletter.value,
        },
        f.newsletter.label
      ),
      h.button
        .attr("type", "button")
        .on("click", FixtureMessage.ClickedToggleShipping())
        .children("Toggle shipping"),
      h.button.children("After"),
      h.output
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action),
      h.output.attr("aria-label", "Last source").children(model.source),
      h.output
        .attrs({ role: "status", "aria-label": "Submitted" })
        .children(model.submitted)
    )
  },
})

const props = () => {
  const options = formsOptions()
  return {
    ...options,
    ...(options.plan === undefined ? { plan: undefined } : {}),
  }
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
