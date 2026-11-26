import * as HtmlServer from "@effect/ui/html/HtmlServer"
import * as Effect from "effect/Effect"

// Renders an Effect UI fixture on the server, for `/__ssr`, with the state
// the client adopts as it hydrates. Fixtures read their options from
// `location`, so the page's URL stands in for it while the props are made.
const fixtures = import.meta.glob("../fixtures/*/effect.ts") as Record<
  string,
  () => Promise<{ Fixture: never; props: () => unknown }>
>

async function renderFixture(fixture: string, url: string) {
  const load = fixtures[`../fixtures/${fixture}/effect.ts`]
  if (!load) {
    throw new Error(`No Effect UI fixture for ${fixture}.`)
  }
  const { Fixture, props } = await load()
  const realm = globalThis as { location?: unknown }
  realm.location = new URL(url)
  let given: unknown
  try {
    given = props()
  } finally {
    delete realm.location
  }
  const { html, state } = await Effect.runPromise(
    HtmlServer.renderToHtml(Fixture, given as never) as Effect.Effect<
      { html: string; state: unknown },
      never,
      never
    >
  )
  return JSON.stringify({ html, state })
}

export { renderFixture }
