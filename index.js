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
const TICKET_CATEGORY_ID = "1508046271561334845";

const ROLES = {
    builder: "1508199216927740175",
    owner: "1508037091450421368",
    admin: "1508056834856976516",
    staff: "1508056950120779827"
};

const farms = {
    autocrafter: [
        "🧰 Auto TNT Crafter V1 = 5M (5 Crafters)",
        "🧰 Auto TNT Crafter V2 = 20M (15 Crafters)",
        "🦴 Auto Boneblock/Bonemeal Crafter V1 = 20M (15 Crafters)",
        "🦴 Auto Boneblock/Bonemeal Crafter V2 = 40M (30 Crafters)"
    ],

    sweetberry: [
        "🫐 Sweet Berries V1 = 180M",
        "🫐 Sweet Berries V2 = 250M"
    ],

    kelp: [
        "🪵 IKEA V1 Full = 50M → 25M/HR",
        "🌿 Mauschu Newbie = 20M → 12M/HR",
        "🌿 Mauschu Beginner = 40M → 20M/HR",
        "🌿 EtZ V1 = 115M → 6000+ Bone Blocks/Hour",
        "🌿 Mauschu Inter = 125M → 35M/HR",
        "🌿 Mauschu Advanced = 250M → 45M/HR",
        "⚡ Mauschu V7 = 400M → 60M/HR",
        "⚡ Mauschu V8 = 600M → 70M/HR",
        "⚡ Mauschu V9 = 800M → 85M/HR",
        "👑 Mauschu V10 = 1B → 300M/HR",
        "🍔 McD Kelp (240 Smokers) = 220M",
        "🍟 McD Kelp (1680 Smokers) = 550M",
        "🥭 Mango67 V1 Kelp Farm = 60M (Not Filled) (400 Smokers)",
        "🥭 Mango67 V1 Kelp Farm = 90M (Filled) (400 Smokers)",
        "🥭 Mango67 V2 Kelp Farm = 270M (Not Filled) (1000+ Smokers)",
        "🥭 Mango67 V2 Kelp Farm = 300M (Filled) (1000+ Smokers)",
        "🥭 Mango67 VX Kelp Farm = Custom Order",
        "📦 Shulker Loader = 2M Each"
    ],

    stash: [
        "🎨 Any Color Stash = 20M",
        "🎰 Gambling Stash = 5M",
        "⚔️ Re-Gear Stash = 10M",
        "🔮 AMETHYST DESIGN = 35M",
        "🐦‍⬛ BLACKSTONE DESIGN = 70M",
        "👑 ROYAL JAPAN DESIGN = 80M",
        "⬛ SPAWNER DESIGN = 90M",
        "🦴 BLACKSTONE X SKULL DESIGN = 100M",
        "🗝️ ANCIENT STONE DESIGN = 120M",
        "🎴 BLACKSTONE GAMBLE BASE = 125M",
        "🧧 RED DOJO DESIGN = 130M",
        "🪙 COPPER PEARL GAMBLE ROOM = 140M",
        "🌍 MUD DESIGN = 150M",
        "🥢 JAPANESE BLACKSTONE STASH DESIGN = 220M"
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
        label: "Auto Crafter",
        value: "autocrafter",
        emoji: "🧰"
    },
    {
        label: "Sweet Berry Farms",
        value: "sweetberry",
        emoji: "🫐"
    },
    {
        label: "Kelp Farms",
        value: "kelp",
        emoji: "🌿"
    },
    {
        label: "Stashes",
        value: "stash",
        emoji: "📦"
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
