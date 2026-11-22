import { cp } from 'node:fs/promises'

await cp(new URL('../public/', import.meta.url), new URL('./out/', import.meta.url), { recursive: true })
await cp(new URL('../src/app/favicon.ico', import.meta.url), new URL('./out/favicon.ico', import.meta.url))
