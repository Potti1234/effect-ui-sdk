import * as HtmlServer from "@effect/ui/html/HtmlServer"
import * as Effect from "effect/Effect"

type Root = Parameters<typeof HtmlServer.renderToHtml>[0]

const examples = import.meta.glob<{ Example: unknown }>([
  "../*/effect/*.ts",
  "../components/*/effect/*.ts",
  "!../shared/**",
])

async function render(module: { Example: unknown }) {
  const { html } = await Effect.runPromise(
    HtmlServer.renderToHtml(
      module.Example as Root,
      {} as never
    ) as unknown as Effect.Effect<{ html: string }>
  )
  return html
}

export { examples, render }
