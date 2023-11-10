declare global {
	namespace NodeJS {
		interface ProcessEnv {
			JWT_SECRET: string;
			DB_HOST: string;
			DB_USER: string;
			DB_PASSWORD: string;
			DB_DATABASE: string;
			VEEAM_TOKENURL: string;
			VEAAM_SESSIONSURL: string;
			VEEAM_REPOSITORIEURL: string;
			PROJECT_IP: string;
			PROJECT_PORT: string;
			VITE_PORT: string;
		}
	}
}

export { }