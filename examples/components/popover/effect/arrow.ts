import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"

const sides = [
  { value: "top", label: "Top" },
  { value: "right", label: "Right" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
] as const

const Side = Schema.Literals(sides.map((side) => side.value))

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedSide: { side: Side },
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ side: Side }),
  message: ExampleMessage,
}).make({
  init: () => ({ side: "bottom" as const }),
  update: {
    ClickedSide: ($, { side }) => $.evolve({ side }),
  },
  view: (h, model) =>
    Popover(h, {
      props: {
        onOpenChange: (_open, details) => {
          const target = details.event?.target
          const inControls =
            target instanceof Element && target.closest('[aria-label="Side"]')
          if (inControls && details.reason !== "escape-key") {
            details.cancel()
          }
        },
      },
      view: (popover) =>
        h.div.attr("data-slot", "stack").children(
          h.div
            .attrs({
              "data-slot": "controls",
              role: "group",
              "aria-label": "Side",
            })
            .children(
              sides.map((option) =>
                h.button
                  .key(option.value)
                  .attrs({
                    type: "button",
                    "data-size": "sm",
                    "aria-pressed":
                      model.side === option.value ? "true" : "false",
                  })
                  .on(
                    "click",
                    ExampleMessage.ClickedSide({ side: option.value })
                  )
                  .children(option.label)
              )
            ),
          popover.trigger(h.button.attr("aria-label", "Help")).children(
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
              .children(
                h.el("circle").attrs({ cx: "12", cy: "12", r: "10" }),
                h.el("path").attr("d", "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"),
                h.el("path").attr("d", "M12 17h.01")
              )
          ),
          popover.content(
            h.div.children(
              popover.arrow(h.div),
              popover.title(h.h2).children("Keyboard shortcuts"),
              popover
                .description(h.p)
                .children("Press ? anywhere to see them all.")
            ),
            { side: model.side, sideOffset: 10, arrowPadding: 12 }
          )
        ),
    }),
})

export { Example }
