<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Store data (products, settings, promos) lives as JSON docs in the `store_data` table, read publicly in the browser via `src/lib/cloud.ts`; writes only via `saveStoreData` server fn. Why: one place to change persistence, no RLS write paths for anonymous visitors.
- Admin panel auth is a server-checked password (secret `ADMIN_PASSWORD`) that returns a signed 2h token kept in sessionStorage; every admin server fn verifies it. Why: password never ships to the browser, no user accounts needed.
- Orders go to the `orders` table only through `submitOrder` (validated server fn); reading requires the admin token. Why: customers' orders stay private.
