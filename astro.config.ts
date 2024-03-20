import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import db from "@astrojs/db"
import vercel from "@astrojs/vercel/serverless"

// https://astro.build/config
export default defineConfig({
	site: "https://cms.aureliendossantos.com",
	output: "server",
	prefetch: false,
	integrations: [tailwind(), db()],
	adapter: vercel(),
})
