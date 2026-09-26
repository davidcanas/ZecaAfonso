import Command from "../../structures/Command";
import Client from "../../structures/Client";
import CommandContext from "../../structures/CommandContext";
import { Constants } from "oceanic.js";

const systemNames = {
    decimal: "Decimal",
    binary: "Binário",
    hexadecimal: "Hexadecimal",
    octal: "Octal",
};

export default class Convert extends Command {
    constructor(client: Client) {
        super(client, {
            name: "convert",
            description: "Comando de conversão entre sistemas",
            category: "Util",
            aliases: ["converter"],
            options: [
                {
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    name: "de",
                    description: "O sistema de numeração do valor",
                    required: true,
                    choices: [
                        {
                            name: "Decimal",
                            value: "decimal",
                        },
                        {
                            name: "Binário",
                            value: "binary",
                        },
                        {
                            name: "Hexadecimal",
                            value: "hexadecimal",
                        },
                        {
                            name: "Octal",
                            value: "octal",
                        },
                    ],
                },
                {
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    name: "valor",
                    description: "O valor a ser convertido",
                    required: true,
                },
            ],
        });
    }

    async execute(ctx: CommandContext): Promise<void> {

        const from = ctx.args[0];
        const value = ctx.args[1];

        if (!from || !value) {
            ctx.sendMessage({
                content: "❌ Por favor, fornece todos os argumentos necessários.",
                flags: 1 << 6,
            });
            return;
        }

        const bases = {
            decimal: 10,
            binary: 2,
            hexadecimal: 16,
            octal: 8,
        };

        const base = bases[from];

        const patterns = {
            decimal: /^\d+$/,
            binary: /^[01]+$/,
            octal: /^[0-7]+$/,
            hexadecimal: /^[0-9a-f]+$/i,
        };

        if (!patterns[from].test(value)) {
            ctx.sendMessage({
                content:
                    `❌ O valor \`${value}\` não é válido para o sistema **${systemNames[from]}**.`,
                flags: 1 << 6,
            });
            return;
        }

        const number = parseInt(value, base);

        if (isNaN(number)) {
            ctx.sendMessage({
                content: "❌ Não foi possível converter esse valor.",
                flags: 1 << 6,
            });
            return;
        }

        const embed = new this.client.embed()
            .setTitle("Conversão de Bases")
            .setColor("RANDOM")
            .addField(
                `<:text:1553412911823716497> Entrada`,
                `\`\`\`${value}\`\`\``,
                true
            )
            .addField(
                "📐 Sistema",
                `\`\`\`${systemNames[from]}\`\`\``,
                true
            );

        if (from !== "binary") {
            embed.addField(
                "0️⃣ Binário",
                `\`\`\`${number.toString(2)}\`\`\``
            );
        }

        if (from !== "octal") {
            embed.addField(
                "8️⃣ Octal",
                `\`\`\`${number.toString(8)}\`\`\``
            );
        }

        if (from !== "decimal") {
            embed.addField(
                "🔟 Decimal",
                `\`\`\`${number.toString(10)}\`\`\``
            );
        }

        if (from !== "hexadecimal") {
            embed.addField(
                "<:hexadecimal:1553412274398568448> Hexadecimal",
                `\`\`\`${number.toString(16).toUpperCase()}\`\`\``
            );
        }

        ctx.sendMessage({ embeds: [embed] });
    }
}