import { Octokit } from "@octokit/core"
import { createAppAuth } from "@octokit/auth-app"
import { GitHubAccount, GitHubToken, db, eq } from "astro:db"
import { getSiteURL } from "./site"

export const createAccount = async (code: string) => {
	const token = await fetch(
		`https://github.com/login/oauth/access_token?client_id=${
			import.meta.env.GITHUB_APP_CLIENT_ID
		}&client_secret=${
			import.meta.env.GITHUB_APP_CLIENT_SECRET
		}&code=${code}&redirect_uri=${getSiteURL()}`,
		{
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		}
	).then((res) => res.json())
	if (!token.access_token)
		throw new Error("Failed to get access token:" + JSON.stringify(token))
	const octokit = new Octokit({
		auth: token.access_token,
	})
	const octoRequestUser = await octokit.request("GET /user", {
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
	})
	const user = octoRequestUser.data
	const dbUser = await db
		.insert(GitHubAccount)
		.values({
			id: user.id,
			login: user.login,
			avatar_url: user.avatar_url,
			name: user.name || user.login,
			email: user.email,
		})
		.onConflictDoUpdate({
			target: GitHubAccount.id,
			set: {
				login: user.login,
				avatar_url: user.avatar_url,
				name: user.name || user.login,
				email: user.email,
			},
		})
		.returning()
		.get()
	const dbToken = await db
		.insert(GitHubToken)
		.values({
			user_id: user.id,
			access_token: token.access_token,
			expires_at: new Date(Date.now() + token.expires_in * 1000),
			refresh_token: token.refresh_token,
			refresh_token_expires_at: new Date(
				Date.now() + token.refresh_token_expires_in * 1000
			),
		})
		.returning()
		.get()
	return { user: dbUser, token: dbToken }
}

/**
 * The refresh token can be used to generate a new user access token and a new refresh token. Once you use a refresh token, that refresh token and the old user access token will no longer work, so they are simply replaced in the DB.
 * @param refreshToken
 */
export const refreshToken = async (refreshToken: string) => {
	const octokit = new Octokit()
	const octoRequest = await octokit.request("POST /login/oauth/access_token", {
		client_id: import.meta.env.GITHUB_APP_CLIENT_ID,
		client_secret: import.meta.env.GITHUB_APP_CLIENT_SECRET,
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	})
	return await db
		.update(GitHubToken)
		.set({
			access_token: octoRequest.data.access_token,
			expires_at: new Date(Date.now() + octoRequest.data.expires_in * 1000),
			refresh_token: octoRequest.data.refresh_token,
			refresh_token_expires_at: new Date(
				Date.now() + octoRequest.data.refresh_token_expires_in * 1000
			),
		})
		.where(eq(GitHubToken.refresh_token, refreshToken))
		.returning()
}

export const getUserRepos = async (auth: string) => {
	// Get the ID of the user installation, if it exists
	const userAccessOctokit = new Octokit({ auth: auth })
	const userInstalls = await userAccessOctokit.request(
		"GET /user/installations"
	)
	if (userInstalls.data.total_count == 0) return []
	const installation = userInstalls.data.installations[0]
	if (installation.suspended_by) return []
	// Retrieve installation access token
	const app = createAppAuth({
		appId: import.meta.env.GITHUB_APP_ID,
		privateKey: import.meta.env.GITHUB_APP_PRIVATE_KEY,
		clientId: import.meta.env.GITHUB_APP_CLIENT_ID,
		clientSecret: import.meta.env.GITHUB_APP_CLIENT_SECRET,
	})
	const installAuth = await app({
		type: "installation",
		installationId: installation.id,
	})
	// List repositories accessible to the app installation
	const appAccessOctokit = new Octokit({ auth: installAuth.token })
	const installationRepos = await appAccessOctokit.request(
		"GET /installation/repositories",
		{
			per_page: 100,
			headers: { "X-GitHub-Api-Version": "2022-11-28" },
		}
	)
	return installationRepos.data.repositories
}

export const getRepoContent = async (
	auth: string,
	owner: string,
	repo: string,
	path?: string
) => {
	const octokit = new Octokit({ auth })
	const octoRequest = await octokit.request(
		"GET /repos/{owner}/{repo}/contents/{path}",
		{
			owner,
			repo,
			path: path || "",
			headers: {
				"X-GitHub-Api-Version": "2022-11-28",
			},
		}
	)
	return octoRequest.data
}
