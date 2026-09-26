import Client from "../structures/Client";
import {
    Interaction,
    CommandInteraction,
    ComponentInteraction,
    AutocompleteInteraction,
    InteractionOptionsWithValue,
    TextChannel
} from "oceanic.js";
import CommandContext from "../structures/CommandContext";

export default class InteractionCreate {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async run(interaction: Interaction) {
        if (interaction instanceof AutocompleteInteraction) {
            await this.handleAutocompleteInteraction(interaction);
        } else if (interaction instanceof CommandInteraction) {
            await this.handleCommandInteraction(interaction);
        } else if (interaction instanceof ComponentInteraction) {
            await this.handleComponentInteraction(interaction);
        }
    }

    private async handleAutocompleteInteraction(interaction: AutocompleteInteraction) {
        if (!interaction.member) return;

        const cmd = this.client.commands.find(c => c.name === interaction.data.name);
        if (!cmd) throw new Error("<!> Comando não encontrado");

        const options = interaction.data.options.raw as InteractionOptionsWithValue[];
        const focusedField = options.find(o => o.focused);

        cmd.runAutoComplete?.(interaction, focusedField!.value as string, options);
    }

    private async handleCommandInteraction(interaction: CommandInteraction) {
        const cmd = this.client.commands.find(c => c.name === interaction.data.name);
        if (!cmd) throw new Error("<!> Comando não encontrado");

        const ctx = new CommandContext(this.client, interaction);
        cmd.execute(ctx);
    }

    private async handleComponentInteraction(interaction: ComponentInteraction) {
        const customID = interaction.data.customID;

        switch (true) {
            case customID === "delmsgeval":
                await this.handleDeleteMessageEvaluation(interaction);
                break;
            default:
                break;
        }
    }



    private async handleDeleteMessageEvaluation(interaction: ComponentInteraction) {
        if (interaction.member?.id !== this.client.ownerID) return;
        (interaction.channel as TextChannel)?.messages.get(interaction.message.id).delete();
    }


}
