# Vite and NodeJS based PWA template

## Quickstart guide

1. Clone the repo,
2. replace some strings (see below),
3. add two png icons (see below),
4. run `npm i` and then
5. `npm run dev` to start a dev server.

### Strings to replace

- #TITLE# - printable name of the app
- #DESCRIPTION# - short description of the app
- #THEME_COLOR# - (manifest) theme color (used in titlebar)
- #BG_COLOR# - manifest background color (used in pwa splash screen)
- #ORIENTATION# - manifest orientation, https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation
- #NAME# - hyphenated name of the app used as repo name
- #AUTHOR# - responsible git user

### Icons to add

To work out of the box, the icons should be PNG-files and they should be placed in `public/images`.

One needs to be called "icons-192" and the other "icons-512".

They should both be a square of 192 or 512 pixels respectively.

Both are needed for the manifest.

The smaller one is also used as favicon.

## Further topics

### Developing

After setup, run `npm run dev` to start a dev server that will respond to changes made to files in the `src/` directory.

### Linting

An opinionated ESLint config is included.
To check and automatically fix some issues, run `npm run lint`.

### Building for production

Run `npm run build` to build a production-ready version of your app.
The output of this will be placed inside the `docs/` directory.

To serve a current production build locally, use `npm run preview`.

#### Deploying

The intended hosting environment is a github page.

The build output is placed inside a directory called "docs", because a github repository can be configured to serve a corresponding page from the project root or a directory called docs in the root and as we want to serve a minified version of the app, while somewhat maintaining order, we chose the latter option.

The current state of your app can be build and deployed in one step using `npm run deploy`, which will run a _bash_ script.
Note that this script will stash and then possibly re-apply uncommitted changes to the working directory.