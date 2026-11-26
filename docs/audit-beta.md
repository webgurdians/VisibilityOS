# Free audit beta
## Scope
Technical readiness is distinct from observed AI visibility. No numeric score or live recommendation claim without evidence.
## Release gates
- Restrict URLs to public HTTP(S), ports 80/443; reject credentials, IP literals and non-public DNS answers. Pin validated addresses at connection time and validate every redirect. Bound response size, redirects, concurrency and time.
- Respect robots policies; report blocked, failed and untested separately. Never execute untrusted page scripts.
- Add durable rate limits and global quotas before public requests; fail closed if unavailable.
- Record HTTP status, final URL, timestamp and evidence for each check. Missing HTML does not prove absence from search indexes.
- Test DNS rebinding, IPv4/IPv6 private ranges, redirect chains, oversized responses, timeouts, malformed HTML and inaccessible pages.
- Keep customer audit data separate from public Observatory. No personal data or research publication without appropriate consent.
- Confirm production migration state before linking to Observatory. No production migrations in this PR.
- Add provider runners only after billing and quotas are verified. Label API samples by model and surface, not consumer product rankings.
## Initial pilot
Greenfield Financials, followed by owned sites. Confirm target services before defining commercial prompts.
## Preview
The initial landing page is deliberately noindex and does not accept submissions. Enable navigation and indexing only after release gates pass.
