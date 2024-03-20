export const getSiteURL = () => {
	return import.meta.env.PROD
		? "https://cms.aureliendossantos.com/"
		: "http://localhost:4321/"
}
