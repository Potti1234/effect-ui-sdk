import * as Html from "@effect/ui/html/Html"
import { Checkbox, CheckboxGroup } from "@ui-sdk/effect/checkbox"
import * as Schema from "effect/Schema"

const backups = [
  { value: "photos", label: "Photos" },
  { value: "documents", label: "Documents" },
  { value: "messages", label: "Messages" },
]

const folders = [
  { value: "desktop", label: "Desktop", disabled: true },
  { value: "projects", label: "Projects", disabled: false },
  { value: "downloads", label: "Downloads", disabled: false },
]

const Icon = <M>(h: Html.H<M>, d: string) =>
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
    .children(h.el("path").attr("d", d))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      CheckboxGroup(h, {
        key: "backups",
        props: { defaultValue: ["photos", "documents"], disabled: true },
        view: (group) =>
          h.div.attr("data-slot", "stack").children(
            h.h3.attr("id", "disabled-backups").children("Backups"),
            h.p
              .attr("data-slot", "hint")
              .children("Managed by your organization."),
            group
              .group(h.div.attr("aria-labelledby", "disabled-backups"))
              .children(
                backups.map((item) =>
                  Checkbox(h, {
                    key: item.value,
                    props: { value: item.value, group: group.join },
                    view: (checkbox) =>
                      h.label
                        .attr("data-slot", "label")
                        .children(
                          checkbox
                            .root(h.button)
                            .children(
                              checkbox.indicator(
                                h.span.children(Icon(h, "M20 6 9 17l-5-5"))
                              )
                            ),
                          checkbox.input(h.input),
                          item.label
                        ),
                  })
                )
              ),
            group.input(h.input)
          ),
      }),
      CheckboxGroup(h, {
        key: "folders",
        props: {
          defaultValue: ["desktop"],
          allValues: folders.map((item) => item.value),
        },
        view: (group) =>
          h.div.attr("data-slot", "stack").children(
            h.h3.attr("id", "disabled-folders").children("Sync folders"),
            group
              .group(h.div.attr("aria-labelledby", "disabled-folders"))
              .children(
                Checkbox(h, {
                  key: "parent",
                  props: { parent: true, group: group.join },
                  view: (checkbox) =>
                    h.label
                      .attr("data-slot", "label")
                      .children(
                        checkbox
                          .root(h.button)
                          .children(
                            checkbox.indicator(
                              h.span.children(
                                Icon(h, "M20 6 9 17l-5-5"),
                                Icon(h, "M5 12h14")
                              )
                            )
                          ),
                        checkbox.input(h.input),
                        "Select all"
                      ),
                }),
                h.div.attr("data-slot", "stack").children(
                  folders.map((item) =>
                    Checkbox(h, {
                      key: item.value,
                      props: {
                        value: item.value,
                        disabled: item.disabled,
                        group: group.join,
                      },
                      view: (checkbox) =>
                        h.label
                          .attr("data-slot", "label")
                          .children(
                            checkbox
                              .root(h.button)
                              .children(
                                checkbox.indicator(
                                  h.span.children(Icon(h, "M20 6 9 17l-5-5"))
                                )
                              ),
                            checkbox.input(h.input),
                            item.label
                          ),
                    })
                  )
                )
              ),
            group.input(h.input)
          ),
      })
    ),
})

export { Example }
