import { NextResponse } from "next/server";
import {
  verifyDiscordSignature,
  InteractionType,
  InteractionResponseType,
} from "@/lib/discord-interactions";

export const dynamic = "force-dynamic";

const DEFAULT_DISCORD_PUBLIC_KEY =
  process.env.NODE_ENV !== "production"
    ? "13a75f2198e156aa6e73de8ce3f43f013dafe86a64a5a1acee36a1a74c6f789e"
    : "";

export async function GET() {
  const publicKey = process.env.DISCORD_PUBLIC_KEY || DEFAULT_DISCORD_PUBLIC_KEY;
  return NextResponse.json({
    status: "ok",
    service: "Nova Discord Interactions Endpoint",
    configured: Boolean(publicKey),
    note: "Discord sends HTTP POST requests here for slash commands and interaction webhooks.",
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  const rawBody = await req.text();
  const publicKey = process.env.DISCORD_PUBLIC_KEY || DEFAULT_DISCORD_PUBLIC_KEY;

  if (!publicKey) {
    console.error("DISCORD_PUBLIC_KEY is not configured.");
    return new NextResponse("Server configuration error: DISCORD_PUBLIC_KEY missing", {
      status: 500,
    });
  }

  const isValid = verifyDiscordSignature({
    body: rawBody,
    signature,
    timestamp,
    publicKey,
  });

  if (!isValid) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  let interaction: {
    type?: number;
    data?: {
      name?: string;
      options?: Array<{ name: string; value: unknown }>;
    };
    member?: { user?: { username?: string } };
    user?: { username?: string };
  };

  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  // Discord PING verification (Type 1)
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // Application Commands / Slash Commands (Type 2)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name?.toLowerCase() || "";
    const username = interaction.member?.user?.username || interaction.user?.username || "there";

    switch (commandName) {
      case "ping":
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Pong! 🏓 Nova bot interactions are online and responsive.",
          },
        });

      case "nova":
      case "help":
      case "info":
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: [
              `Hey **${username}**! 👋 Welcome to **Nova Studio**.`,
              "",
              "We build AI-powered web services, automation workflows, and high-performance digital tools.",
              "",
              "🔗 **Quick Links:**",
              "• **Website**: https://nova.allskyfares.com",
              "• **Portfolio**: https://nova.allskyfares.com/portfolio",
              "• **Start a Project**: https://nova.allskyfares.com/#contact",
            ].join("\n"),
          },
        });

      case "services":
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: [
              "🛠️ **Nova Core Capabilities:**",
              "",
              "• **Full-Stack Web Development**: Modern Next.js apps with clean architecture.",
              "• **Workflow Automation**: CRM, webhook dispatchers, and business logic pipelines.",
              "• **AI & Integration Engineering**: Custom assistants, LLM pipelines, and secure APIs.",
              "• **Cloud Deployment & Security**: Hardened production hosting and identity flows.",
              "",
              "Get in touch at https://nova.allskyfares.com/#contact",
            ].join("\n"),
          },
        });

      case "status":
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "🟢 **Nova Platform Status**: All systems operational (https://nova.allskyfares.com).",
          },
        });

      case "contact":
      case "inquire":
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "📬 Submit your project inquiry at: https://nova.allskyfares.com/#contact — our team will get back to you promptly!",
          },
        });

      default:
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Hello ${username}! Command \`/${commandName}\` acknowledged. Visit https://nova.allskyfares.com to explore our platform.`,
          },
        });
    }
  }

  // Fallback for unhandled interaction types
  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "Interaction received.",
    },
  });
}
