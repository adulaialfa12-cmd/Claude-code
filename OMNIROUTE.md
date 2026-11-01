# OmniRoute in Claude Code

[OmniRoute](https://github.com/cheaper-inference/OmniRoute) is a free, local AI gateway: one address
(`http://localhost:20128/v1`) that forwards AI requests to the providers you connect, and switches to a
backup if one fails. `.mcp.json` in this folder connects it to Claude Code as a tool server, so Claude can
check health, quotas and costs, list models, and send requests through it (110 tools).

`.mcp.json` holds **no secrets**. Your key is read from an environment variable on your own computer.

## One-time setup (on your own computer)

1. Install Node.js 22 or newer from <https://nodejs.org>.
2. Install OmniRoute:
   ```bash
   npm install -g omniroute
   ```
3. Start it (keep this window open):
   ```bash
   omniroute
   ```
4. The dashboard opens at <http://localhost:20128>. The default first password is `CHANGEME`, which is
   publicly known, so **change it right away** in Dashboard → Settings → Security. Then:
   - **Providers**: add the AI accounts or API keys you want to use.
   - **API Keys**: create an OmniRoute key and copy it.
5. Save the key as an environment variable, then open a **new** terminal:
   - Mac/Linux, add to `~/.zshrc` or `~/.bashrc`:
     ```bash
     export OMNIROUTE_API_KEY="paste-your-key-here"
     ```
   - Windows (PowerShell):
     ```powershell
     setx OMNIROUTE_API_KEY "paste-your-key-here"
     ```
6. In this project folder, start Claude Code (`claude`) and approve the `omniroute` server when asked.
   Check it with `/mcp`. It should show **omniroute: connected**.

## Notes

- OmniRoute must be running (step 3) for its tools to return live data.
- Never commit your key. It belongs only in the environment variable.
- Only connect providers whose terms allow this use. The OmniRoute dashboard marks some free tiers as
  "avoid"; skip those so a provider doesn't suspend the account your channel depends on.
- In Claude Code cloud sessions, `omniroute` isn't installed, so this server will show as failed there.
  That's harmless.
