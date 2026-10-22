# AGENTS

## Package manager

Always use `pnpm` for installing dependencies and running scripts (never `npm`).

- Install: `pnpm install`
- Run scripts: `pnpm <script>` (e.g. `pnpm build`, `pnpm dev`)
- Avoid running multiple instances of `pnpm run dev` in different ports, ask the user if there's currently running an instance of the app in dev mode.

## Build / checks

- Build: `pnpm build`
- Sass check: `pnpm check:sass`
- Color contrast check: `pnpm test:contrast`

# Code

- Sass code should use tokens over direct values
- Web components are divided in two catergories:
    1. Behavior web components: their goal is to provide initialization logic, attach event handlers. They don't render of manage the DOM, instead apply shared logic to ensure no new elements of the same type are left with no interaction.
    2. UI web components: their goal is handle complex UI mutations using Lit to reduce final use complexity. Light DOM is preferred over Shadow DOM to use the global styling instead of repeating styles.

- The code is always written in English regardless of the interaction in the chat.