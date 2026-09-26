import { Member, TextChannel } from "oceanic.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import Client from "../structures/Client";
import path from "node:path";

export default class guildMemberAdd {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async run(member: Member) {
        const background = await loadImage(
            path.join(process.cwd(), "assets/welcome.png")
        );

        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(background, 0, 0);

        /*  TO-REMEMBER: Coord centro da porta
         * X ≈ 887
         * Y ≈ 585
         */

        const avatarSize = 150;
        const avatarX = 887;
        const avatarY = 585;

        const avatar = await loadImage(
            member.user.avatarURL("png", 256)
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(
            avatarX,
            avatarY,
            avatarSize / 2 + 8,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
            avatarX,
            avatarY,
            avatarSize / 2,
            0,
            Math.PI * 2
        );
        ctx.clip();

        ctx.drawImage(
            avatar,
            avatarX - avatarSize / 2,
            avatarY - avatarSize / 2,
            avatarSize,
            avatarSize
        );

        ctx.restore();

        const username = member.user.globalName || member.user.username;

        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textWidth = ctx.measureText(username).width;
        const boxWidth = textWidth + 50;
        const boxHeight = 50;
        const boxX = avatarX - boxWidth / 2;
        const boxY = avatarY + avatarSize / 2 + 25;

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";

        ctx.beginPath();
        ctx.roundRect(
            boxX,
            boxY,
            boxWidth,
            boxHeight,
            12
        );
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(
            username,
            avatarX,
            boxY + boxHeight / 2
        );

        ctx.font = "bold 42px Arial";
        ctx.fillStyle = "#ffffff";

        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;

        ctx.fillText(
            "BEM-VINDO(A)!",
            avatarX,
            avatarY - avatarSize / 2 - 45
        );

        ctx.shadowBlur = 0;

        const textChannel = this.client.guilds
            .get(member.guildID)!
            .channels
            .get(process.env.WLCM_ID!) as TextChannel;

        await textChannel.createMessage({
            content: `<a:welcome:1553428391850414150> ${member.user.mention}`,
            embeds: [
                new this.client.embed()
                    .setColor("RANDOM")
                    .setImage("attachment://welcome_to_ect.png")
            ],
            files: [{
                name: "welcome_to_ect.png",
                contents: canvas.toBuffer("image/png"),
            }]
        });
    }
}