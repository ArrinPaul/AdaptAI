# AdaptAI — Track A Detailed Execution Tracker

> **Current Active Branch:** `track-A`  
> **Role:** Person A (Frontend / DOM / Extension UI)  
> **Strategy:** Sub-task execution with immediate incremental merges to `main` for Track B parallel consumption.

### Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

---

## 📌 Track A Execution Schedule

### Sub-Task A1: Onboarding UI & Storage Setup
| Status | Task | Target Files |
| :---: | :--- | :--- |
| `[ ]` | Build interactive preference form (Visual, Cognitive, Audio) | `extension/onboarding/onboarding.html`, `onboarding.css` |
| `[ ]` | Implement form handler & save to `chrome.storage.local` | `extension/onboarding/onboarding.js` |
| `[ ]` | **Merge Point A1**: Push clean onboarding baseline to `main` | `Git` |

### Sub-Task A2: DOM Scraper & Trigger Setup
| Status | Task | Target Files |
| :---: | :--- | :--- |
| `[ ]` | Implement DOM Scraper (`h1-h3`, `p`, cap 2000 chars) | `extension/content.js` |
| `[ ]` | Wire extension click / keybind trigger payload | `extension/content.js`, `extension/background.js` |
| `[ ]` | **Merge Point A2**: Push scraper baseline to `main` | `Git` |

### Sub-Task A3: Accessibility Floating Toolbar & TTS
| Status | Task | Target Files |
| :---: | :--- | :--- |
| `[ ]` | Inject bottom-right UI toolbar (🔊 Read Aloud, 🎤 Voice Action) | `extension/content.js`, `extension/styles.css` |
| `[ ]` | Implement `window.speechSynthesis` text-to-speech engine | `extension/content.js` |
| `[ ]` | **Merge Point A3**: Push toolbar baseline to `main` | `Git` |

### Sub-Task A4: Transformation Engine & Mock Execution
| Status | Task | Target Files |
| :---: | :--- | :--- |
| `[ ]` | Apply `cssUpdates` to `:root` DOM style | `extension/content.js` |
| `[ ]` | Swap paragraph `innerText` with `simplifiedText[]` | `extension/content.js` |
| `[ ]` | Validate complete mock flow locally | `extension/content.js` |
| `[ ]` | **Merge Point A4**: Final Track A integration merge to `main` | `Git` |

---

## 🔄 Git Push Skeleton Protocol

Execute these commands after completing each sub-task (A1, A2, A3, A4):

```bash
git add .
git commit -m "feat(track-A): complete Sub-Task A<X>"
git checkout main
git merge track-A
git push origin main
git checkout track-A
```
