## [1.1.2](https://github.com/Tommmciu/cookie-extractor/compare/v1.1.1...v1.1.2) (2026-04-13)



## [1.1.1](https://github.com/Tommmciu/cookie-extractor/compare/v1.1.0...v1.1.1) (2026-04-13)


### Bug Fixes

* simplify cookie extraction in Chrome - remove unnecessary store lookup ([ffe28c8](https://github.com/Tommmciu/cookie-extractor/commit/ffe28c82031bb43e997b332b648f38613813036b))



# [1.1.0](https://github.com/Tommmciu/cookie-extractor/compare/8cd45c081ad4a5a83dd22f1ed42b3b92e4b09313...v1.1.0) (2026-04-13)


### Bug Fixes

* add [@available](https://github.com/available)(macOS 11.0, *) to SafariWebExtensionHandler ([c63acd1](https://github.com/Tommmciu/cookie-extractor/commit/c63acd121a1050aa3291f45f2dd21d7d07ac7f67))
* correct Safari app archive path in workflow ([4a3b973](https://github.com/Tommmciu/cookie-extractor/commit/4a3b973f36e64fbf761fded78f5f45b21c63a0ad))
* move <all_urls> to host_permissions (MV3 requires separate key) ([6fa3817](https://github.com/Tommmciu/cookie-extractor/commit/6fa3817a1da22499c7eb103c0093c360299c8b90))
* query cookies using tab's storeId (Safari uses persistent-2 not persistent-1) ([847080f](https://github.com/Tommmciu/cookie-extractor/commit/847080f6c65286280e2c9ec50dbed5254ab965ab))
* request host permissions at runtime to trigger Safari permission dialog ([a055295](https://github.com/Tommmciu/cookie-extractor/commit/a055295582bbebbe444c9bcfe812f7341fceee1a))
* resolve Safari build failures in CI - fix deployment target and disable code signing ([d8e7152](https://github.com/Tommmciu/cookie-extractor/commit/d8e71524be7eb7e9c9bfb1be2e635dfe945825be))
* set macOS deployment target to 26 ([a1dec24](https://github.com/Tommmciu/cookie-extractor/commit/a1dec24277129e8bbe0d565ea3750b688b1566fc))
* tighten URL regex and clarify executeScript Promise propagation ([15fc202](https://github.com/Tommmciu/cookie-extractor/commit/15fc2027f3e3f39c8197a708f50b025b893afe0c))
* use execCommand copy via scripting.executeScript instead of sendNativeMessage ([722355f](https://github.com/Tommmciu/cookie-extractor/commit/722355fab5aba53c2e54e30a4351708cda22417c))
* use native messaging for clipboard write to bypass WebContent sandbox ([f9d7974](https://github.com/Tommmciu/cookie-extractor/commit/f9d7974eb75cba6c8b8204d4af3e3a18024c4452))
* use scripting.executeScript for clipboard write, add URL and empty-cookie guards ([75b52b1](https://github.com/Tommmciu/cookie-extractor/commit/75b52b181a0ea02caa8d9d3e22da636ebe8793f6))


### Features

* add artifact upload steps ([9dab456](https://github.com/Tommmciu/cookie-extractor/commit/9dab4569ba1c9ab03e2865c3afe1cad7c076cb9f))
* add build script for Chrome extension ([c8e4958](https://github.com/Tommmciu/cookie-extractor/commit/c8e4958243acd52fb92fba06ff1b62eb030a09fc))
* add Chrome extension build step ([e28dca1](https://github.com/Tommmciu/cookie-extractor/commit/e28dca1f37d43cb8d48c7a41ac7a65b423115ac1))
* add implementation plan for Safari Cookie Extractor ([8cd45c0](https://github.com/Tommmciu/cookie-extractor/commit/8cd45c081ad4a5a83dd22f1ed42b3b92e4b09313))
* add release job with semantic versioning ([fc636e1](https://github.com/Tommmciu/cookie-extractor/commit/fc636e1fb6a7b31a6ef35f2a61f3adb0a19e4184))
* add Safari extension build step to CI/CD workflow ([7eb003a](https://github.com/Tommmciu/cookie-extractor/commit/7eb003a044b0d96649ca6b6f3bd0c68c87228649))
* configure manifest with cookies permissions and remove popup ([ccb0714](https://github.com/Tommmciu/cookie-extractor/commit/ccb0714bc6fae14f32bac91644b52db8bc1d5871))
* create Chrome extension manifest ([3db7269](https://github.com/Tommmciu/cookie-extractor/commit/3db72690eeeb2e87436e35477add4f946aba3204))
* create Chrome popup UI and script ([d70f2ce](https://github.com/Tommmciu/cookie-extractor/commit/d70f2ce956e01008e7dc59caf67597c5bec28e9e))
* implement cookie copy with badge confirmation in background script ([52195d5](https://github.com/Tommmciu/cookie-extractor/commit/52195d56236be7d64d19f0d9a2a964de4541ca79))
* update background.js to support Chrome popup messaging ([f75f0ec](https://github.com/Tommmciu/cookie-extractor/commit/f75f0ec6964bd7d763d5964fa319a71c39a818b8))



