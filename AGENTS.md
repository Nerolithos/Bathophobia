# Repository workflow

After completing authorized changes, run `npm test` and `npm run build`. When both pass, automatically create a local Git commit for the completed changes, as authorized by the owner. Include this exact trailer:

Co-authored-by: Codex <codex@openai.com>

Keep unrelated user changes out of the commit.
