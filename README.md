# icon-check

[![npm](https://img.shields.io/npm/v/@njweber/icon-check)](https://www.npmjs.com/package/@njweber/icon-check) [![downloads](https://img.shields.io/npm/dm/@njweber/icon-check)](https://www.npmjs.com/package/@njweber/icon-check) [![CI](https://github.com/nwebersoftware/icon-check/actions/workflows/ci.yml/badge.svg)](https://github.com/nwebersoftware/icon-check/actions/workflows/ci.yml)


**Audit a PNG app icon against the App Store / Google Play rules** — dependency-free, runs anywhere.

Icons are the sneakiest rejection: the app works, but the *artwork* fails review. `icon-check` reads
the PNG header and flags the things reviewers bounce:

- **App Store:** 1024×1024, square, and **no alpha channel** (the classic rejection).
- **Google Play:** adaptive-icon foregrounds want transparency and enough density.

## Usage

```bash
npx @njweber/icon-check ./assets/icon.png
npx @njweber/icon-check ./assets/adaptive-icon.png --android
```

(Published as `@njweber/icon-check`, like the rest of the family. The unscoped `icon-check`
on npm is a legacy alias pinned at 0.1.0 — use the scoped name.)

```
icon-check — app icon audit
file: ./assets/icon.png

✓ png  1024×1024, has alpha
✓ square  square
! ios-size  1024×1024 (App Store size)
✗ ios-alpha  has an alpha channel — the App Store icon must have NO transparency

FAIL — 1 blocking issue.
```

Exit codes: `0` ok (warnings allowed) · `1` blocking issue · `2` bad input.

## Why it matters

“The app icon can’t be transparent nor contain an alpha channel.” — a two-day review bounce over a
transparency channel you can’t even see. Background: <https://booleanbuild.com/posts/app-icon-rejections.html>.

## Family

- [`store-check`](https://github.com/nwebersoftware/store-check) — Android (16 KB page size)
- [`ipa-check`](https://github.com/nwebersoftware/ipa-check) — iOS `.ipa` submission audit

## GitHub Action

```yaml
- uses: nwebersoftware/icon-check@main
  with:
    path: assets/icon.png
    # android: "true"   # check the adaptive-icon foreground instead
```

## Follow along

More of this at **https://booleanbuild.com** — the tools hub, plus write-ups on store
rejections, CI, build gates, and shipping TestFlight builds without EAS. New posts land
roughly twice a month. Subscribe: https://booleanbuild.com/#subscribe

## License

MIT.
