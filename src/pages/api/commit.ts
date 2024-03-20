import { Octokit } from "@octokit/core"
import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request }) => {
	if (request.headers.get("Content-Type") === "application/json") {
		const body = await request.json()
		const base64 = Buffer.from(body.content).toString("base64")

		const octokit = new Octokit({
			auth: body.auth,
		})

		const octoRequestUser = await octokit.request("GET /user", {
			headers: {
				"X-GitHub-Api-Version": "2022-11-28",
			},
		})
		const user = octoRequestUser.data
		if (!user.name)
			return new Response(
				"GitHub account doesn't have a name (used to sign commits)",
				{ status: 401 }
			)
		if (!user.email)
			return new Response(
				"GitHub account doesn't have an email (used to sign commits)",
				{ status: 401 }
			)

		const octoRequest = await octokit.request(
			"PUT /repos/{owner}/{repo}/contents/{path}",
			{
				owner: body.owner,
				repo: body.repo,
				path: body.path,
				message: `[cms] ${body.filename}`,
				committer: {
					name: user.name,
					email: `${user.id}+${user.login}@users.noreply.github.com`,
				},
				content: base64,
				sha: body.sha,
				headers: {
					"X-GitHub-Api-Version": "2022-11-28",
				},
			}
		)

		return new Response(
			JSON.stringify({
				content: octoRequest.data.commit.html_url,
			}),
			{
				status: octoRequest.status,
			}
		)
	}
	return new Response(null, { status: 400 })
}
