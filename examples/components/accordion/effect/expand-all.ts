import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import * as HtmlCommand from "@effect/ui/html/HtmlCommand"
import { Accordion, createAccordionController } from "@ui-sdk/effect/accordion"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const weeks = [
  {
    value: "week-1",
    label: "Week 1: Foundations",
    content:
      "Set up your editor, meet the command line and write your first script.",
  },
  {
    value: "week-2",
    label: "Week 2: Data and types",
    content:
      "Strings, numbers, lists and objects, and how to tell them apart when a program runs.",
  },
  {
    value: "week-3",
    label: "Week 3: Control flow",
    content:
      "Conditions, loops and functions. The project this week is a small text adventure.",
  },
  {
    value: "week-4",
    label: "Week 4: Working with files",
    content:
      "Read and write files, parse CSV and JSON, and handle the errors that come with them.",
  },
  {
    value: "week-5",
    label: "Week 5: Final project",
    content:
      "Build a tool you'll use yourself, then present it to the group in a five-minute demo.",
  },
]

const syllabus = createAccordionController()

const Week = Html.ref("Example.week", "div")

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedExpandAll: {},
  ClickedCollapseAll: {},
  RequestedOpenChangeWeek: {
    week: Schema.String,
    open: Schema.Boolean,
    reason: Schema.String,
  },
  SettledWeek: { week: Schema.String, open: Schema.Boolean },
})

const ExpandAll = Command.make("ExpandAll", { args: {} }, () =>
  Effect.sync(() => {
    syllabus.openAll()
    return Component.noop
  })
)

const CollapseAll = Command.make("CollapseAll", { args: {} }, () =>
  Effect.sync(() => {
    syllabus.closeAll()
    return Component.noop
  })
)

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
  model: Schema.Struct({ pressed: Schema.NullOr(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ pressed: null }),
  update: {
    ClickedExpandAll: ($) => $.run(ExpandAll.make({})),
    ClickedCollapseAll: ($) => $.run(CollapseAll.make({})),
    RequestedOpenChangeWeek: ($, { week, open, reason }) =>
      $.evolve({ pressed: open && reason === "trigger-press" ? week : null }),
    SettledWeek: ($, { week, open }) =>
      open && $.model.pressed === week
        ? $.evolve({ pressed: null }).run(
            HtmlCommand.scrollIntoView(Week.at(week), () => Component.noop, {
              block: "nearest",
              behavior: "smooth",
            })
          )
        : $.model,
  },
  view: (h) =>
    h.div.children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedExpandAll())
            .children("Expand all"),
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedCollapseAll())
            .children("Collapse all")
        ),
      h.div.attr("data-slot", "scroll").children(
        Accordion(h, {
          props: { multiple: true, controller: syllabus },
          onEmit: (event) =>
            event._tag === "ItemOpenChange"
              ? ExampleMessage.RequestedOpenChangeWeek({
                  week: event.key ?? "",
                  open: event.value,
                  reason: event.reason ?? "",
                })
              : event._tag === "ItemOpenChangeComplete"
                ? ExampleMessage.SettledWeek({
                    week: event.key ?? "",
                    open: event.value,
                  })
                : undefined,
          view: (accordion) =>
            accordion.root(h.div).children(
              weeks.map((week) => {
                const section = accordion.in("item", { value: week.value })
                return accordion
                  .item(h.div.key(week.value).ref(Week.at(week.value)), {
                    value: week.value,
                  })
                  .children(
                    section
                      .header(h.h3)
                      .children(
                        section
                          .trigger(h.button)
                          .children(week.label, Chevron(h))
                      ),
                    section.panel(h.div.children(week.content))
                  )
              })
            ),
        })
      )
    ),
})

export { Example }
