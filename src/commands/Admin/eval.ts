import Command from "../../structures/Command";
import Client from "../../structures/Client";
import CommandContext from "../../structures/CommandContext";
import { Constants } from "oceanic.js";

export default class Eval extends Command {
	constructor(client: Client) {
		super(client, {
			name: "eval",
			description: "Descrição não definida",
			category: "Admin",
			aliases: ["execute"],
			options: [
				{
					name: "input",
					type: Constants.ApplicationCommandOptionTypes.STRING,
					description: "Descrição não definida",
					required: true,
				},
			],
		});
	}

	async execute(ctx: CommandContext): Promise<void> {
		try {
			if (ctx.author.id !== this.client.ownerID) {
				ctx.sendMessage({
					content: "Não tens acesso a esse comando!",
					flags: 1 << 6,
				});
				return;
			}
			const texto = ctx.args.join(" ");

			if (!texto) {
				ctx.sendMessage(`<@${ctx.author.id}> Escreve algo para ser executado!`);
				return;
			}
			
			const start = process.hrtime();

			let code = eval(texto);
			if (code instanceof Promise) code = await code;
			if (typeof code !== "string")
				code = require("util").inspect(code, {
					depth: 0,
				});

			if (
				code.includes(process.env.TOKEN)
			) {
				ctx.sendMessage(
					"⚠ Não poderei enviar o codigo asseguir aqui porque ele contem dados privados. Ele foi enviado na DM do owner",
				);
				this.client.users.get(this.client.ownerID)
					.createDM()
					.then(async (dm) => {
						await dm.createMessage({ content: `\`\`\`js\n${code}\n\`\`\`` });
					});
				return;
			}
			const stop = process.hrtime(start);

			const evalBed = new this.client.embed()
				.setTitle("Eval Executado:")
				.setDescription(
					`\`\`\`js\n${code}\n\`\`\`\n**Tempo de Execução:**\n\`\`\`\n${
						(stop[0] * 1e9 + stop[1]) / 1e6
					}ms \n\`\`\``,
				)

				.setColor("GREEN");
			ctx.sendMessage({
				embeds: [evalBed],
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								style: 4,
								label: "🚮 Apagar Eval",
								disabled: false,
								customID: "delmsgeval",
							},
						],
					},
				],
			});
		} catch (e) {

			const errBed = new this.client.embed()
				.setTitle("Ocorreu um erro:")
				.setDescription(`\`\`\`js\n${e}\n\`\`\``)
				.setColor("RED");
			ctx.sendMessage({
				embeds: [errBed],
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								style: 2,
								label: "🚮 Apagar Erro",
								disabled: false,
								customID: "delmsgeval",
							},
						],
					},
				],
			});
		}
	}
}
