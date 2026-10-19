# RHINO mobile updates
- [x] Add payer/optional recipient inputs, strict MoMo validation, phone-only PIN instructions and 90-second demo timeout; verified both providers, receipts, timeout, 24 tests and clean build.
- [x] Fix checkout TS7030 and verify tests and the automatic build result (20 tests passed; build OK).
- [x] Build PRO bundle catalogue, full-screen checkout, demo payment states, receipts and locally saved mock purchases.
- [x] Connect email and Google account access through Lovable Cloud (completed in the previous purchase-flow update).
- [x] Verify phone/network rules, purchase outcomes, persistence and mobile layout; real payment requests and data delivery remain unavailable in demo mode.
- [x] Adapt all nine existing content screens and shared bottom navigation to 375px; no tenth content screen exists.
- [x] Add manifest, icons and install button without offline caching.
- [x] Add Capacitor Android configuration targeting API 36; APK compilation requires Android Studio outside this sandbox.
- [x] Verify mobile and desktop screens, install fallback, demo deposit/withdrawal flow, configuration tests and clean build signals.