# icon-check

**Audit a PNG app icon against the App Store / Google Play rules** — dependency-free, runs anywhere.

Icons are the sneakiest rejection: the app works, but the *artwork* fails review. `icon-check` reads
the PNG header and flags the things reviewers bounce:

- **App Store:** 1024×1024, square, and **no alpha channel** (the classic rejection).
- **Google Play:** adaptive-icon foregrounds want transparency and enough density.

## Usage

```bash
npx github:nwebersoftware/icon-check ./assets/icon.png
npx github:nwebersoftware/icon-check ./assets/adaptive-icon.png --android
```

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

## License

MIT.
