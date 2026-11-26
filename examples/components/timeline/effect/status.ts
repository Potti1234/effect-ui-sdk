import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import {
  createTimelineController,
  Timeline,
  type TimelineStatus,
} from "@ui-sdk/effect/timeline"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const steps: {
  value: string
  title: string
  dateTime: string
  time: string
  description: string
  status: TimelineStatus
}[] = [
  {
    value: "placed",
    title: "Order placed",
    dateTime: "2026-11-01",
    time: "Nov 1",
    description: "We received your order.",
    status: "complete",
  },
  {
    value: "packed",
    title: "Packed",
    dateTime: "2026-11-02",
    time: "Nov 2",
    description: "Your items left the shelf.",
    status: "complete",
  },
  {
    value: "shipped",
    title: "Shipped",
    dateTime: "2026-11-03",
    time: "Nov 3",
    description: "On its way with the carrier.",
    status: "current",
  },
  {
    value: "delivered",
    title: "Delivered",
    dateTime: "2026-11-05",
    time: "Nov 5",
    description: "Expected by Thursday.",
    status: "upcoming",
  },
]

const controller = createTimelineController()

const FocusCurrentStep = Command.make("FocusCurrentStep", { args: {} }, () =>
  Effect.sync(() => {
    controller.focus("shipped")
    return Component.noop
  })
)

const ExampleMessage = UiSchema.TaggedEnum({ ClickedGoToCurrentStep: {} })

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

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    ClickedGoToCurrentStep: ($) => $.run(FocusCurrentStep.make({})),
  },
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .on("click", ExampleMessage.ClickedGoToCurrentStep())
            .children("Go to Current Step")
        ),
      Timeline(h, {
        props: { controller },
        view: (timeline) =>
          timeline.root(h.div.attr("aria-label", "Order status")).children(
            steps.map((step) => {
              const item = timeline.in("item", {
                value: step.value,
                status: step.status,
              })
              return timeline
                .item(h.div.key(step.value), {
                  value: step.value,
                  status: step.status,
                })
                .children(
                  item
                    .marker(h.div)
                    .children(step.status === "complete" && Check(h)),
                  item.connector(h.div),
                  item.title(h.div).children(step.title),
                  item
                    .time(h.time.attr("datetime", step.dateTime))
                    .children(step.time),
                  item.description(h.div).children(step.description)
                )
            })
          ),
      })
    ),
})

export { Example }
