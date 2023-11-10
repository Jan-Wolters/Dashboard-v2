const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const run = (command, cwd) => new Promise((res, rej) => {
	let hadError = false;

	const proc = exec(command, { cwd }, (err, stdout, stderr) => {
		if (err) {
			if (!hadError) {
				hadError = true;
				rej(err);
			}
		}
	});

	proc.on("error", (err) => {
		if (!hadError) {
			hadError = true;
			rej(err);
		}
	});

	proc.on("exit", () => {
		if (!hadError) res();
	});
});

const build = async () => 
{
	await Promise.all([
		run("npm run build", path.resolve(__dirname, "../app")),
		run("npm run build", path.resolve(__dirname, "../server")),
	]);

	fs.cpSync(path.resolve(__dirname, "../server/dist"), path.resolve(__dirname, "../dist"), { recursive: true });
	fs.cpSync(path.resolve(__dirname, "../app/dist"), path.resolve(__dirname, "../dist/public"), { recursive: true });
};

build();