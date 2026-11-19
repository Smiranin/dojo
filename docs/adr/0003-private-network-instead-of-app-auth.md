# Rely on a private network (Tailscale) instead of authentication in the app

**Status:** accepted

The server has no login screen and no API tokens. It is reachable only inside the owner's Tailscale network, which the phone and the Mac both join; Tailscale also provides HTTPS, which an installable web app needs. For a single user this removes a whole class of code (accounts, sessions, token storage on the phone) and avoids exposing the Sensei, which spends the owner's subscription limits, to the public internet at all. The trade-off is that the server must never be bound to a public interface or tunnel; if the Dojo ever needs to be reachable outside the private network, an auth layer has to be added first.

## Considered Options

- **Tailscale, no in-app auth** (chosen): private by construction, HTTPS included, nothing to maintain.
- **Public tunnel (Cloudflare Tunnel, ngrok) with a password or access gateway**: works from any device without a client, but makes the server public and adds an auth component.
- **In-app authentication on a public server**: the most code for the least benefit for one user.
