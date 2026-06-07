# Decision & Alignment Agent Prototype

Static LAN-viewable prototype for three hackathon demo directions:

1. Copilot Native Flow
2. Executive Command Center
3. MCP App Widget Flow

Run locally:

```bash
python3 -m http.server 4173 --bind 0.0.0.0 --directory /Users/mattgraves/Documents/hackathon-enterprise/prototype
```

Current LAN base URL:

- `http://192.168.1.123:4173`

Direct routes:

- Copilot native: `http://192.168.1.123:4173/?version=copilot&step=0`
- Executive command center: `http://192.168.1.123:4173/?version=command&step=0`
- MCP app widget: `http://192.168.1.123:4173/?version=widget&step=0`
- Command Center lab: `http://192.168.1.123:4173/command-center.html?concept=atlas&step=0`
- Command Center theater: `http://192.168.1.123:4173/command-center.html?concept=theater&step=0`
- Command Center flight deck: `http://192.168.1.123:4173/command-center.html?concept=flight&step=0`

Use the `Advance flow` button to walk each concept through:

1. Ask
2. Analyze
3. Confirm
4. Govern

Recommended judging order:

1. Start with Copilot native to prove the required Microsoft 365 Copilot Chat surface.
2. Switch to Command Center to show the premium Alignment Map and governed registry state.
3. Close with MCP App Widget to show how the creative visual experience can live near the agent interaction.
4. Use the Command Center lab when the room wants to compare all three premium executive concepts quickly.
