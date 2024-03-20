export const getSiteURL = () => {
	return import.meta.env.PROD ? Astro.site : "http://localhost:4321/"
}
