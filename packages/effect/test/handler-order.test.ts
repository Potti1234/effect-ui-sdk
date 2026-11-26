// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { rating } from "../../../examples/core/rating-stages/keyboard"
import { createParts } from "../src/primitive"

const tick = () => new Promise((resolve) => setTimeout(resolve, 40))

const Rating = createParts(rating, {
  name: "Rating",
  tags: { root: "div", star: "button" },
})

const PageMessage = UiSchema.TaggedEnum({
  PressedRowKey: { key: Schema.String },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ keys: Schema.String }),
  message: PageMessage,
}).make({
  init: () => ({ keys: "" }),
  update: {
    PressedRowKey: ($, { key }) => $.evolve({ keys: (keys) => keys + key }),
  },
  view: (h, model) =>
    h.div(
      Rating(h, {
        props: { defaultValue: 3 },
        view: (stars) =>
          stars.root(h.div).children(
            ["1", "2", "3", "4", "5"].map((value) =>
              stars
                .star(
                  h.button
                    .key(value)
                    .attr("aria-label", value)
                    .on(
                      "keydown",
                      ({ key }) =>
                        key === "ArrowUp" || key === "ArrowDown"
                          ? PageMessage.PressedRowKey({ key })
                          : undefined,
                      { preventDefault: true }
                    ),
                  { value }
                )
                .children("★")
            )
          ),
      }),
      h.output.children(model.keys)
    ),
})

const press = (el: HTMLElement, key: string) =>
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
  )

test("a consumer's handler runs first, and one that cancels skips the part's own", async () => {
  const app = document.body.appendChild(document.createElement("div"))
  Effect.runFork(
    Effect.scoped(
      Effect.gen(function* () {
        yield* BrowserHost.mountEffect(Page, {}, app)
        yield* Effect.never
      })
    ) as Effect.Effect<never>
  )
  await tick()
  const star = (value: string) =>
    app.querySelector<HTMLButtonElement>(`[aria-label="${value}"]`)!
  star("3").focus()
  press(star("3"), "ArrowDown")
  await tick()
  expect(app.querySelector("output")!.textContent).toBe("ArrowDown")
  expect(document.activeElement).toBe(star("3"))
  press(star("3"), "ArrowRight")
  await tick()
  expect(document.activeElement).toBe(star("4"))
  expect(app.querySelector("output")!.textContent).toBe("ArrowDown")
})
