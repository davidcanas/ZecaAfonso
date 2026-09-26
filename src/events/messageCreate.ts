import Client from "../structures/Client";
import { Message } from "oceanic.js";
import CommandContext from "../structures/CommandContext";

export default class MessageCreate {
	client: Client;
	userMessages: Map<string, { timestamps: number[] }>;

	constructor(client: Client) {
		this.client = client;
		this.userMessages = new Map();
	}

	async run(message: Message) {
		const prefix = "-";

		if (message.author.bot) return;

		const userId = message.author.id;
		const now = Date.now();


		if (message.channel.type === 1) return;

		if (message.content.startsWith("<@!734297444744953907>") || message.content.startsWith("<@734297444744953907>")) {
			const msg = message.content.slice(prefix.length).split(/ +/);

			message.content = `${prefix}ask ${msg.slice(1).join(" ")}`;

		}

		if (!message.content.startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).split(/ +/);
		const cmd = args.shift()?.toLowerCase();

		if (!cmd) return;

		const command = this.client.commands.find(
			(c) => c.name === cmd || c.aliases?.includes(cmd),
		);

		if (command) {
			const ctx = new CommandContext(this.client, message, args);
			command.execute(ctx);
		}

	}

}
