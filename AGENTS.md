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

- Mount the shared safe-area-aware bottom navigation once in the root layout; screens reserve its height through AppFrame so every route stays clear of it.
- Use manifest-only PWA installation with a browser prompt and manual fallback; do not add offline caching or an app-shell service worker.
- Capacitor loads the HTTPS hosted TanStack Start application because SSR output is not a static Android web bundle; Android SDK targets live in android/variables.gradle.
