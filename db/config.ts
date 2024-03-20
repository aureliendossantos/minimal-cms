import { column, defineDb, defineTable } from "astro:db"

const GitHubAccount = defineTable({
	columns: {
		id: column.number({ unique: true }),
		login: column.text(),
		avatar_url: column.text(),
		name: column.text(),
		email: column.text({ optional: true }),
	},
})

const GitHubToken = defineTable({
	columns: {
		user_id: column.number({ references: () => GitHubAccount.columns.id }),
		access_token: column.text(),
		expires_at: column.date(),
		refresh_token: column.text(),
		refresh_token_expires_at: column.date(),
	},
})

export default defineDb({
	tables: { GitHubAccount, GitHubToken },
})
