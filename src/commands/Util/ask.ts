import Command from "../../structures/Command";
import Client from "../../structures/Client";
import CommandContext from "../../structures/CommandContext";
import fs from "fs";
import path from "path";
import { Constants } from "oceanic.js";

export default class askGPT extends Command {
    constructor(client: Client) {
        super(client, {
            name: "ask",
            description: "Faz uma questão à IA.",
            category: "Util",
            aliases: ["gemini", "perguntar"],
            options: [
                {
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    name: "pergunta",
                    description: "A pergunta a fazer à inteligência artificial",
                    required: true
                }
            ],
        });
    }

    async execute(ctx: CommandContext): Promise<void> {

        await ctx.defer();


        const linksPath = path.resolve(__dirname, "../../../assets/data/links.json");
        const linksData = fs.readFileSync(linksPath, "utf-8");
        const linksJson = JSON.parse(linksData);
        const usefulLinks = linksJson.map(link => `${link.name} - ${link.value}`).join(", ");

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `${process.env.AI_KEY}`
        };

        const userMessagesPath = path.resolve(__dirname, "../../../assets/data/system_context.txt");
        const userMessages = fs.readFileSync(userMessagesPath, "utf-8").split("\n").filter(line => line.trim());

        const fainaPath = path.resolve(__dirname, "../../../assets/data/codigo_faina.txt");
        const fainaMessages = fs.readFileSync(fainaPath, "utf-8").split("\n").filter(line => line.trim());

        const timestamp = new Date().toISOString();
        const messages = userMessages.map(content => ({
            text: content
                .replace("{member_name}", ctx.member.nick || ctx.member.user.globalName)
                .replace("{channel_id}", ctx.channel.id)
                .replace("{channel_category}", ctx.channel.parent?.name || "Sem categoria")
                .replace("{useful_links}", usefulLinks)
                .replace("{timestamp}", timestamp)
        }));
        messages.push(...fainaMessages.map(content => ({ text: content })));
        messages.push({ text: `\nMensagem a responder: "${ctx.args.join(" ")}"` });

        const parts = [];
        parts.push(...messages.map(msg => ({ text: msg.text })));

        const data = {
            "model": process.env.AI_MODEL,
            "contents": {
                "role": "user",
                "parts": parts
            },
            "generationConfig": {
                "maxOutputTokens": 600,
                "temperature": 0.3,
                "thinkingConfig": {
                    "thinkingLevel": "minimal"
                },
            },
        };

        const response = await fetch(process.env.AI_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });

        const json = await response.json();
        console.log(json);
        if (!json.candidates) {
            ctx.sendMessage({ content: `Ocorreu um erro ao processar a tua pergunta. Tenta novamente mais tarde!\n#- Erro: \`${json.error.message}\``, flags: 1 << 6 });
            console.log(json.error.message);
            return;
        }

        const embed = new this.client.embed()
            .setColor("RANDOM")
            .setDescription(json.candidates[0].content.parts[0].text);
        ctx.sendMessage({ embeds: [embed] });
    }
}