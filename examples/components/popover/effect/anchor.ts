import * as Html from "@effect/ui/html/Html"
import { Checkbox } from "@ui-sdk/effect/checkbox"
import { Popover } from "@ui-sdk/effect/popover"
import * as Schema from "effect/Schema"

const types = [
  { label: "Documents", checked: true },
  { label: "Images", checked: false },
  { label: "Shared with me", checked: true },
]

const filterPaths = [
  "M10 5H3",
  "M12 19H3",
  "M14 3v4",
  "M16 17v4",
  "M21 12h-9",
  "M21 19h-5",
  "M21 5h-7",
  "M8 10v4",
  "M8 12H3",
]

const Icon = <M>(h: Html.H<M>, paths: ReadonlyArray<string>) =>
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
    .children(paths.map((d) => h.el("path").attr("d", d)))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Popover(h, {
      view: (popover) =>
        h.div.attr("data-slot", "row").children(
          h.input.attrs({
            type: "search",
            placeholder: "Search files…",
            "aria-label": "Search files",
          }),
          popover
            .trigger(h.button.attr("aria-label", "Search filters"))
            .children(Icon(h, filterPaths)),
          popover.content(
            h.div.children(
              popover.title(h.h2).children("Filters"),
              popover
                .description(h.p)
                .children("Show only these kinds of files."),
              h.div.attr("data-slot", "stack").children(
                types.map((type) =>
                  Checkbox(h, {
                    key: type.label,
                    props: { defaultChecked: type.checked },
                    view: (checkbox) =>
                      h.label
                        .attr("data-slot", "label")
                        .children(
                          checkbox
                            .root(h.button)
                            .children(
                              checkbox.indicator(
                                h.span.children(Icon(h, ["M20 6 9 17l-5-5"]))
                              )
                            ),
                          checkbox.input(h.input),
                          type.label
                        ),
                  })
                )
              ),
              h.div
                .attr("data-slot", "row")
                .children(
                  popover.close(h.button).children("Cancel"),
                  popover
                    .close(h.button.attr("data-variant", "solid"))
                    .children("Apply")
                )
            ),
            {
              anchor: 'input[aria-label="Search files"]',
              align: "start",
              sideOffset: 8,
            }
          )
        ),
    }),
})

export { Example }
