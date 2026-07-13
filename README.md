# 🍿 [Codex Drive Nebula](https://github.com/lrpli/goindex-theme-acrou)

A [Cloudflare Workers](https://workers.cloudflare.com/) backend + Vue 2 single-page frontend that turns a Google Drive folder into a fast, browsable file index — no server to maintain, no storage costs beyond your own Drive.

This theme is based on [yanzai/goindex](https://github.com/yanzai/goindex/), forked and maintained here as `lrpli/goindex-theme-acrou`.

## How it's put together

| Piece | Location | What it does |
| --- | --- | --- |
| Worker backend | [`go2index/index.js`](./go2index/index.js) | Runs on Cloudflare Workers. Talks to the Google Drive API (list/download/proxy files, auth, per-folder password protection) and serves the initial HTML shell. |
| SPA frontend | [`src/`](./src) | Vue 2 app (Bulma + element-ui) that renders the actual file browser, players, and viewers. Built with `vue-cli-service` and published to a CDN; the worker's HTML shell loads it by version. |

## ✨ Features

- 🗂 Multi-drive switching, folder navigation with breadcrumbs
- 📁 In-browser file management — create folders, rename, move, and delete (mkdir/rename/move/delete all proxy through the worker)
- ⭐ Local library tools — favorites, recently opened, filter by type, sort by name/date/size (stored in `localStorage`, no backend needed)
- 🔐 Per-folder password protection (HTTP-style auth handled by the worker)
- 🎨 Grid and list view modes with file-type previews
- 🎯 Paginated/infinite-scroll loading, page-level caching (back/forward doesn't re-fetch)
- 🌐 i18n — English, Simplified Chinese, Traditional Chinese
- 🛠 Markdown / HTML rendering (drop a `README.md` or `HEAD.md` in a folder and it renders above/below the listing — works as a lightweight blog)
- 🖥 Video playback ([plyr](https://github.com/sampotts/plyr), `.vtt` subtitles, pluggable external player API)
- 🎧 Audio playback with a persistent player bar ([APlayer](https://github.com/MoePlayer/APlayer))
- 🚀 Static frontend + edge worker — no origin server, scales with Cloudflare's network

## Demo

🚀 [https://chill.aicirou.workers.dev/](https://chill.aicirou.workers.dev/)

## Quick Deployment

1. Open the builder: https://goindex-builder-acrou.glitch.me
2. Authenticate and copy the generated worker code
3. Paste it into a new [Cloudflare Workers](https://www.cloudflare.com/) script and deploy

## Manual Deployment

1. Enable the [Google Drive API](https://console.developers.google.com/apis/api/drive.googleapis.com/overview) on a Google Cloud project
2. Create an [OAuth client ID](https://console.developers.google.com/apis/credentials/oauthclient)
3. Install [rclone](https://rclone.org/downloads/) locally
4. Use rclone to obtain a `refresh_token`
5. Download [`go2index/index.js`](https://github.com/lrpli/goindex-theme-acrou/tree/main/go2index) and fill in your `client_id`, `client_secret`, and `refresh_token`
6. Deploy the script to [Cloudflare Workers](https://www.cloudflare.com/)

## Frontend development

The frontend is a standard `vue-cli` project.

```bash
npm install     # requires Node.js 20+ (dart-sass needs >=20.19)
npm run serve   # local dev server with hot reload
npm run build   # production build -> dist/
npm run lint    # eslint
```

Theme colors, spacing, and shared design tokens live in [`src/assets/style/theme/acrou/index.scss`](./src/assets/style/theme/acrou/index.scss) as CSS custom properties (`--g2-*`); the worker's HTML shell reuses the same variables, so restyling the SCSS keeps both surfaces in sync.

## Options

Configure these in your worker's `themeOptions` (see [`setting.js`](./public/setting.js) / worker config).

### Video

| Option       | Type                       | Default                                                      | Description                                                  |
| ------------ | -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `api`        | String                     | `''`                                                         | External video player api. When this value is not null, all of the following options do not work |
| `autoplay`   | Boolean                    | `true`                                                       | When set to true, the video plays automatically, depending on whether the browser supports it |
| `invertTime` | Boolean                    | `false`                                                      | Display the current time as a countdown rather than an incremental counter |
| `controls`   | Array, Function or Element | `['play-large', 'restart', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'download', 'fullscreen']` | Which buttons are displayed in the control bar. See [CONTROLS.md](https://github.com/sampotts/plyr/blob/master/CONTROLS.md#using-default-controls) |
| `settings`   | Array                      | `['quality', 'speed', 'loop']`                               | Which settings to show in the menu |

More options: plyr [documentation](https://github.com/sampotts/plyr#options).

### Audio

| Option      | Type    | Default    | Description                                                  |
| ----------- | ------- | ---------- | ------------------------------------------------------------ |
| `container` | String  | `.aplayer` | Not user-configurable |
| `fixed`     | Boolean | `true`     | Not user-configurable |
| `autoplay`  | Boolean | `false`    | Audio autoplay |
| `loop`      | String  | `'all'`    | Player loop mode: `'all'`, `'one'`, `'none'` |
| `order`     | String  | `'list'`   | Play order: `'list'`, `'random'` |
| `preload`   | String  | `'auto'`   | `'none'`, `'metadata'`, `'auto'` |
| `volume`    | Number  | `0.7`      | Default volume — the player remembers the user's own choice once they change it |
| `audios`    | Array   | `[]`       | Preset playlist |

More options: APlayer [documentation](https://aplayer.js.org/#/home?id=options).

### Library

| Option              | Type    | Default              | Description                                          |
| ------------------- | ------- | --------------------- | ----------------------------------------------------- |
| `enable`             | Boolean | `true`                | Show the filter/sort/favorites/history toolbar        |
| `default_filter`     | String  | `'all'`                | Initial file-type filter                               |
| `default_sort`       | String  | `'name-asc'`            | Initial sort order                                      |
| `max_recent`         | Number  | `12`                   | How many recently opened files to remember              |
| `menu_default_open`  | Boolean | `false`                | Whether the favorites/history panel starts expanded     |
| `storage_key`        | String  | `'go2index-library'`   | `localStorage` key used to persist favorites/history    |

## Change log

### Unreleased

- UI refresh — light theme with an indigo accent across the navbar, breadcrumb, file grid/list, toolbars, and footer
- Replace native `prompt()`/`confirm()` for create/rename/move/delete/password with styled element-ui dialogs
- Replace deprecated `node-sass` with `sass` (dart-sass); regenerate `package-lock.json` to drop dead mirror URLs that broke fresh installs

### v2.0.10

- Fix CDN chunk path host for `dist/app.js` (avoid white screen)
- Release hotfix build for jsDelivr `lrpli/goindex-theme-acrou`

### v2.0.9

- Add local library tools (filter, sort, favorites, recent)
- Add configurable `themeOptions.library` in worker settings
- Improve SPA list usability on mobile and search results

### v2.0.8

- Fix image file actions not working
- Fix misjudged file format for images
- Fix more than 10 drives not working
- Fix some operations in the search list not working
- Fix text cache content not refreshing
- Add default video player ([plyr](https://github.com/sampotts/plyr))
- Add audio player ([APlayer](https://github.com/MoePlayer/APlayer))
- Add copy button to the video page
- Add [NProgress](https://github.com/rstacruz/nprogress)
- Add language cache cleanup
- Add "shortcut can't download" tip
- Markdown renders as HTML by default
- Drop prefetch/preload of lazy-loaded chunks in CI
- Drop Font Awesome 5

<details>
<summary>Earlier fixes and additions</summary>

- Add clean file cache
- Support for custom video player (API)
- Grid mode shows an icon when no preview is available
- Adjust the `HEAD.md` render position
- Fix files without a preview not being downloadable by clicking
- Fix file names that couldn't be opened
- Fix page-switching falling back to the previous page while loading
- Convert to a single-page application (SPA)
- Add page-level caching (browser back/forward doesn't refetch)
- Add HTTP basic auth per drive letter
- Add grid view mode (file preview)
- Add paginated loading
- Add i18n
- Add HTML rendering, folder/file description rendering
- Add optional configuration, quick deployment support
- Add PDF online preview
- Replace the text editor
- Fix URL-encoding issues
- Add multi-disk switching, version detection
- Optimize search results and page display

</details>

## Star History

<a href="https://star-history.com/#lrpli/goindex-theme-acrou&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lrpli/goindex-theme-acrou&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=lrpli/goindex-theme-acrou&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=lrpli/goindex-theme-acrou&type=Date" />
 </picture>
</a>

## License

[MIT](LICENSE)
