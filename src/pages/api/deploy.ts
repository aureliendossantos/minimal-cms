import type { APIRoute } from "astro"

export const POST: APIRoute = async () => {
	const vercelRequest = await fetch(import.meta.env.DEPLOY_URL, {
		method: "POST",
	})
	return new Response(JSON.stringify(vercelRequest), { status: 200 })
}
