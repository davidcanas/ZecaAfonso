import "dotenv/config";
import ZecaClient from "./structures/Client";

process.on("uncaughtException", (error) => {
	console.error(error);
});

process.on("unhandledRejection", (error) => {
	console.error(error);
});

const client = new ZecaClient(process.env.TOKEN);

client.loadCommands();
client.loadEvents();
client.connect();

export default client;