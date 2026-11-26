import * as Html from "@effect/ui/html/Html"
import { Avatar } from "@ui-sdk/effect/avatar"
import * as Schema from "effect/Schema"

const person = {
  name: "shadcn",
  src: "https://github.com/shadcn.png",
}

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "row").children(
      Avatar(h, {
        view: (avatar) =>
          avatar
            .root(h.span)
            .children(
              avatar.image(h.img.attrs({ src: person.src, alt: person.name })),
              avatar.fallback(
                h.span.children(
                  h.span.attr("aria-hidden", "true").children("CN"),
                  h.span.attr("data-slot", "visually-hidden").children("shadcn")
                )
              )
            ),
      })
    ),
})

export { Example }
