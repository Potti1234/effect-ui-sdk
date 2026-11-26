// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import { definePrimitive } from "@ui-sdk/core"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { createParts } from "../src/primitive"

const tick = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms))

const copyButton = definePrimitive({
  name: "copy-button",
  options: { text: "string", timeout: "number", onCopy: "callback" },
  state: (options: {
    text?: string
    timeout?: number
    onCopy?: (text: string) => void
  }) => ({ copied: false }),
  api: (context) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    context.onDestroy(() => clearTimeout(timer))
    return {
      copy() {
        const { text = "", timeout = 1500, onCopy } = context.options()
        context.store.set({ copied: true })
        onCopy?.(text)
        clearTimeout(timer)
        timer = setTimeout(() => context.store.set({ copied: false }), timeout)
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { copied: boolean }>({
      state: (state) => ({ copied: state.copied }),
      attrs: (state) => ({
        type: "button",
        "data-copied": state.copied ? "" : undefined,
      }),
      press: ({ api }) => api.copy(),
    }),
  }),
})

const CopyButton = createParts(copyButton, {
  name: "CopyButton",
  tags: { root: "button" },
})

const PageMessage = UiSchema.TaggedEnum({
  CopiedCommand: { text: Schema.String },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ copied: Schema.String }),
  message: PageMessage,
}).make({
  init: () => ({ copied: "" }),
  update: {
    CopiedCommand: ($, { text }) => $.evolve({ copied: text }),
  },
  view: (h, model) =>
    h.div(
      CopyButton(h, {
        props: { text: "npm add @ui-sdk/core", timeout: 60 },
        onEmit: {
          Copy: ({ value }) => PageMessage.CopiedCommand({ text: value }),
        },
        view: (copy) =>
          copy
            .root(h.button)
            .children(copy.root.state().copied ? "Copied" : "Copy"),
      }),
      h.output.children(model.copied)
    ),
})

test("a part renders from its state, and follows changes the primitive makes on its own", async () => {
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
  const button = app.querySelector("button")!
  expect(button.textContent).toBe("Copy")
  button.click()
  await tick()
  expect(button.textContent).toBe("Copied")
  expect(button.hasAttribute("data-copied")).toBe(true)
  expect(app.querySelector("output")!.textContent).toBe("npm add @ui-sdk/core")
  await tick(120)
  expect(button.textContent).toBe("Copy")
  expect(button.hasAttribute("data-copied")).toBe(false)
})
