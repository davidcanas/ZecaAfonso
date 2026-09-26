import { exec } from "child_process";
import Command from "../../structures/Command";
import Client from "../../structures/Client";
import CommandContext from "../../structures/CommandContext";
import { Constants } from "oceanic.js";

export default class Shell extends Command {
  constructor(client: Client) {
    super(client, {
      name: "shell",
      description: "Executa algo",
      category: "Admin",
      aliases: ["execute"],
      options: [
        {
          name: "prompt",
          type: Constants.ApplicationCommandOptionTypes.STRING,
          description: "O código a executar.",
          required: true,
        },
      ],
    });
  }

  async execute(ctx: CommandContext): Promise<void> {
    if (ctx.author.id !== this.client.ownerID) {
        ctx.sendMessage({
            content: "Não tens acesso a esse comando!",
            flags: 1 << 6,
        });
        return;
    }
    const code = ctx.args.join(" ");

    exec(code, async (error, stdout) => {
      try {
        const outputType = error || stdout;
        let output = outputType;
        if (!output.toString().length) output = "O comando não retornou nada";
 
        if (
          output.toString().includes(process.env.TOKEN) 
        ) {
          ctx.sendMessage(
            "⚠ Não posso enviar o output asseguir aqui dado que ele contem dados privados. Ele foi enviado na DM do owner"
          );
          this.client.users.get(this.client.ownerID).createDM()
            .then(async (dm) => {
              await dm.createMessage({content:`\`\`\`ansi\n${output}\n\`\`\``});
            });
          return;
        }
        return ctx.sendMessage({
          content: "```js\n" + output + "\n```",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  label: "🚮 Apagar Shell",
                  customID: "delmsgeval",
                },
              ],
            },
          ],
        });
      } catch (err) {
        ctx.sendMessage({
          content: "Erro: " + err,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  label: "🚮 Apagar Erro",
                  customID: "delmsgeval",
                },
              ],
            },
          ],
        });
      }
    });
  }
}