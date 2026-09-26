import Client from "../structures/Client";

export default class ready {
	client: Client;

	constructor(client: Client) {
		this.client = client;
	}

	async run() {
		const activities = [
			"CT é quem mais ordena",
			"CT >>>>> ALL",
		];

		let i = 0;
		this.client.statusInterval = setInterval(async () => {
			this.client.editStatus("online", [
				{
					name: `${activities[i++ % activities.length]}`,
					type: 2,
				},
			]);
		}, 15000);

		console.log("\x1b[32m[CLIENT] O client foi conectado com sucesso");

		this.client.updateSlash();


	}
}
