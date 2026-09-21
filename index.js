const {
    Client,
    GatewayIntentBits,
    ChannelType,
    PermissionsBitField,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
client.login(TOKEN);
const TICKET_CATEGORY_ID = "1508046271561334845";

const ROLES = {
    builder: "1508199216927740175",
    owner: "1508037091450421368",
    admin: "1508056834856976516",
    staff: "1508056950120779827"
};

const farms = {
    kelp: [
        "Mauschu Beginner",
        "Mauschu Newbie",
        "Mauschu Advanced",
        "Mauschu Premium"
    ],

    stash: [
        "Basic Stash",
        "Advanced Stash",
        "Premium Stash"
    ],

    bonemeal: [
        "Bonemeal Starter",
        "Bonemeal Advanced"
    ],

    tnt: [
        "TNT Starter",
        "TNT Advanced"
    ],

    sweetberry: [
        "Sweet Berry Beginner",
        "Sweet Berry Pro"
    ]
};

client.once("ready", async () => {
    console.log(`${client.user.tag} is online`);

    const command = await client.application.commands.create({
        name: "farmshop",
        description: "Send the farm shop panel"
    });

    console.log(`Command registered: ${command.name}`);
});

client.on("interactionCreate", async interaction => {

    // Slash Command
    if (interaction.isChatInputCommand()) {

        if (interaction.commandName === "farmshop") {

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("🛒 Farm Purchase")
                .setDescription(
                    "Click the button below to start your farm order.\n\n" +
                    "You will first select a farm category and then choose the specific farm.\n\n" +
                    "A private ticket will be created automatically."
                );

            const button = new ButtonBuilder()
                .setCustomId("buy_farm")
                .setLabel("Purchase Farm")
                .setEmoji("🛒")
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(button);

            return interaction.reply({
                embeds: [embed],
                components: [row]
            });
        }
    }

    // Purchase Button
    if (interaction.isButton()) {

        if (interaction.customId === "buy_farm") {

            const menu = new StringSelectMenuBuilder()
                .setCustomId("farm_category")
                .setPlaceholder("Select a Farm Category")
                .addOptions([
                    {
                        label: "Kelp Farms",
                        value: "kelp",
                        emoji: "🌿"
                    },
                    {
                        label: "Stashes",
                        value: "stash",
                        emoji: "📦"
                    },
                    {
                        label: "Bone Meal Farms",
                        value: "bonemeal",
                        emoji: "🦴"
                    },
                    {
                        label: "TNT Farms",
                        value: "tnt",
                        emoji: "💥"
                    },
                    {
                        label: "Sweet Berry Farms",
                        value: "sweetberry",
                        emoji: "🍓"
                    }
                ]);

            const row = new ActionRowBuilder()
                .addComponents(menu);

            return interaction.reply({
                content: "Select a category:",
                components: [row],
                ephemeral: true
            });
        }
    }

    // Category Selection
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "farm_category"
    ) {

        const category = interaction.values[0];

        const options = farms[category].map(farm => ({
            label: farm,
            value: `${category}|${farm}`
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId("farm_choice")
            .setPlaceholder("Select a Farm")
            .addOptions(options);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        return interaction.update({
            content: "Select the farm you want to purchase:",
            components: [row]
        });
    }

    // Farm Selection
    if (
        interaction.isStringSelectMenu() &&
        interaction.customId === "farm_choice"
    ) {

        const [category, farmName] =
            interaction.values[0].split("|");

        const ticket = await interaction.guild.channels.create({
            name: `farm-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,

            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                },
                {
                    id: ROLES.builder,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: ROLES.owner,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: ROLES.admin,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: ROLES.staff,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }
            ]
        });

        await ticket.send(
            `<@&${ROLES.builder}> <@&${ROLES.owner}> <@&${ROLES.admin}> <@&${ROLES.staff}>`
        );

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🛒 New Farm Order")
            .addFields(
                {
                    name: "Customer",
                    value: `<@${interaction.user.id}>`
                },
                {
                    name: "Category",
                    value: category
                },
                {
                    name: "Selected Farm",
                    value: farmName
                },
                {
                    name: "Order Status",
                    value: "Pending"
                }
            )
            .setTimestamp();

        await ticket.send({
            embeds: [embed]
        });

        return interaction.update({
            content: `✅ Your order ticket has been created: ${ticket}`,
            components: []
        });
    }
});

client.login(TOKEN);