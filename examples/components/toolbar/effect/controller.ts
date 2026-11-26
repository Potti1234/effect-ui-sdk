import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { shortcut } from "@ui-sdk/effect/shortcuts"
import { createToolbarController, Toolbar } from "@ui-sdk/effect/toolbar"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

type Shape = readonly [string, Record<string, string>]

const icon =
  (shapes: Shape[]) =>
  <M>(h: Html.H<M>) =>
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
      .children(shapes.map(([tag, attrs]) => h.el(tag).attrs(attrs)))
const Bold = icon([
  [
    "path",
    {
      d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",
    },
  ],
])
const Italic = icon([
  ["line", { x1: "19", x2: "10", y1: "4", y2: "4" }],
  ["line", { x1: "14", x2: "5", y1: "20", y2: "20" }],
  ["line", { x1: "15", x2: "9", y1: "4", y2: "20" }],
])
const Link = icon([
  [
    "path",
    { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" },
  ],
  [
    "path",
    { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" },
  ],
])

const actions = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Insert link", icon: Link },
]

const toolbar = createToolbarController()

const ExampleMessage = UiSchema.TaggedEnum({
  PressedAction: { label: Schema.String },
  RequestedFocusToolbar: {},
})

const FocusToolbar = Command.make("FocusToolbar", { args: {} }, () =>
  Effect.sync(() => {
    toolbar.focus()
    return Component.noop
  })
)

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  subscriptions: () => [
    shortcut("alt+f10", ExampleMessage.RequestedFocusToolbar(), {
      allowInInput: true,
    }),
  ],
  update: {
    PressedAction: ($, { label }) => $.set(null).run(log(label)),
    RequestedFocusToolbar: ($) => $.set(null).run(FocusToolbar.make({})),
  },
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.RequestedFocusToolbar())
            .children("Focus Toolbar")
        ),
      Toolbar(h, {
        props: { controller: toolbar },
        view: (parts) =>
          parts.root(h.div.attr("aria-label", "Notes formatting")).children(
            actions.map((action) =>
              parts
                .button(
                  h.button
                    .key(action.label)
                    .attr("aria-label", action.label)
                    .on(
                      "click",
                      ExampleMessage.PressedAction({ label: action.label })
                    )
                )
                .children(action.icon(h))
            )
          ),
      }),
      h.textarea.attrs({
        "aria-label": "Notes",
        placeholder: "Type, then press Alt+F10",
      })
    ),
})

export { Example }
