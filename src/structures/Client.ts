import fs from "fs";
import { Client, ClientOptions, ClientEvents } from "oceanic.js";
import { Command, Utils  } from "../typings/index";
import Embed from "./Embed";
import path from "path";


export default class ZecaClient extends Client {
	commands: Array<Command>;
	utils: Utils;
	embed: typeof Embed;
	ownerID: string;
	guildID: string;
	statusInterval?: NodeJS.Timeout;

	constructor(token: string) {
		const clientOptions: ClientOptions = {
			auth: token,
			defaultImageFormat: "png",
			gateway: {
				getAllUsers: true,
				intents: [
					"ALL"
				],
			},
			collectionLimits: {
				messages: 100,
			},
		};

		super(clientOptions);
		this.commands = [];

		this.embed = Embed;
		this.ownerID = process.env.ownerID;
		this.guildID = process.env.guildID;

	}

	connect(): Promise<void> {
		return super.connect();
	}

	loadCommands(): void {
		for (const dir of fs.readdirSync(
			path.resolve(__dirname, "..", "commands"),
		)) {
			if (dir.endsWith(".ts") || dir.endsWith(".js")) {
				const cmd = require(`../commands/${dir}`).default;
				this.commands.push(new cmd(this));
			} else {
				for (const file of fs.readdirSync(
					path.resolve(__dirname, "..", "commands", dir),
				)) {
					if (file.endsWith(".ts") || file.endsWith(".js")) {
						const command = require(`../commands/${dir}/${file}`).default;
						this.commands.push(new command(this));
					}
				}
			}
		}

		console.log("\x1b[32m[CLIENT] Os comandos foram carregados.");
	}
	loadEvents(): void {
		for (const file of fs.readdirSync(
			path.resolve(__dirname, "..", "events"),
		)) {
			if (file.endsWith(".ts") || file.endsWith(".js")) {
				const event = new (require(`../events/${file}`).default)(this);
				const eventName = file.split(".")[0] as keyof ClientEvents;

				if (eventName === "ready") {
					super.once("ready", (...args) => event.run(...args));
				} else {
					super.on(eventName, (...args) => event.run(...args));
				}
			}
		}
	}
	updateSlash(): void {
		const cmds = [];
		const map = Array.from(this.commands);
		for (const command of Object(map)) {
			cmds.push({
				name: command.name,
				description: command.description,
				options: command.options,
				permissions: command.permissions,
				type: command.type || 1,
				autocomplete: command.autocomplete || false,
			});
		}
		this.application.bulkEditGuildCommands(this.guildID, cmds);
		console.log("\x1b[32m[CLIENT] Os slash commands foram atualizados");
	}
}
