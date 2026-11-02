# Veridian Zenith — Official Portal

A high-end, mystical Nordic-inspired digital realm showcasing the artifacts and technologies forged by Veridian Zenith. Built with React 19, TypeScript, Tailwind CSS v4, and Framer Motion. Features a Skills page with technical expertise, work experience, and downloadable resume.

The forge lives on [git.gay](https://git.gay/Veridian-Zenith), a Forgejo instance; the site reads repository and activity data from its API.

## ☄ Getting Started

```bash
# Clone the repository
git clone https://git.gay/Veridian-Zenith/verz.group.git
cd verz.group

# Install dependencies
bun i

# Configure Firebase (local development)
cp .env.example .env
# Fill in the VITE_FIREBASE_* values from your Firebase project settings

# Start the forge (development server)
bun run dev

# Etch the final runes (production build)
bun run build

# Deploy to Firebase (hosting + Firestore rules)
bun run deploy
```

## ⚡ Deployment (CI)

CI runs as **Forgejo Actions**. Forgejo only reads `.forgejo/workflows`, so the workflows live there:

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `ci.yml` | push / pull request to `main` | install, lint, build |
| `firebase-deploy.yml` | push to `main`, manual | build and deploy hosting + Firestore rules via `firebase-tools` |

Both target the `ubuntu-latest` label of a Docker `forgejo-runner` (the label a default registration provides). Forgejo only runs workflows when a runner is registered for the repository or instance — if git.gay has none, either register a `forgejo-runner` or use the manual path below.

Required repository secrets:

| Secret | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web config (build-time env) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
| `VITE_FIREBASE_APP_ID` | Firebase web config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase web config |
| `FIREBASE_SERVICE_ACCOUNT_MAIN_WEBSITE_BA2DA` | Service account JSON key used to deploy |

### Setting the secrets

Enter them by hand under **Settings → Actions → Secrets** in the repository. git.gay does not issue the fine-grained tokens that the Actions-secrets API expects, so the web UI is the supported path here.

| Secret | Value to paste |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `.env`, same key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `.env`, same key |
| `VITE_FIREBASE_PROJECT_ID` | `.env`, same key |
| `VITE_FIREBASE_STORAGE_BUCKET` | `.env`, same key |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `.env`, same key |
| `VITE_FIREBASE_APP_ID` | `.env`, same key |
| `FIREBASE_SERVICE_ACCOUNT_MAIN_WEBSITE_BA2DA` | the whole of `service-account.json`, on one line |

`VITE_FIREBASE_MEASUREMENT_ID` is optional: `src/firebase.ts` never reads it.

Until these exist the deploy workflow stops at its **Verify required secrets** step and names every missing secret, so a push cannot half-deploy.

### Recovering the values

The Firebase web config is public client configuration. Two ways back:

- **From the deployed bundle**, which needs no project permissions: fetch the live `assets/index-*.js`, follow the `assets/ContactPage-*.js` reference inside it, and read `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` and `appId` out of the inlined config object.
- **From the project**, with the CLI:

```bash
gcloud auth application-default login
firebase apps:list --project main-website-ba2da
firebase apps:sdkconfig web <appId> --project main-website-ba2da
```

Map the printed snippet into `.env`: `apiKey` → `VITE_FIREBASE_API_KEY`, `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`, `projectId` → `VITE_FIREBASE_PROJECT_ID`, `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`, `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`, `appId` → `VITE_FIREBASE_APP_ID`, `measurementId` → `VITE_FIREBASE_MEASUREMENT_ID`.

The deploy credential is a service-account JSON key, which can simply be re-minted:

```bash
gcloud iam service-accounts list --project main-website-ba2da
gcloud iam service-accounts keys create service-account.json \
  --iam-account=<service-account-email> --project main-website-ba2da
```

If those calls report that the IAM API is disabled, enable it first:

```bash
gcloud services enable iam.googleapis.com --project main-website-ba2da
```

Check which roles it holds, and add the two a deploy needs if they are missing:

```bash
gcloud projects get-iam-policy main-website-ba2da \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:<service-account-email>" \
  --format="table(bindings.role)"

gcloud projects add-iam-policy-binding main-website-ba2da \
  --member="serviceAccount:<service-account-email>" \
  --role="roles/firebasehosting.admin"
gcloud projects add-iam-policy-binding main-website-ba2da \
  --member="serviceAccount:<service-account-email>" \
  --role="roles/firebaserules.admin"
```

Delete `service-account.json` once it is stored as a secret; it should never be committed.

### Manual deploy

With `gcloud auth application-default login` done, `firebase-tools` v15 picks up Application Default Credentials directly — CI tokens (`firebase login:ci`) were removed in v15 and are not supported:

```bash
bun run deploy   # vite build && firebase deploy --only hosting,firestore
```

The contact form writes to the `contactMessages` Firestore collection; its security rules (`firestore.rules`) allow anyone to create well-formed messages while keeping them unreadable to clients. Spam is mitigated server-side by schema/length validation and client-side by a honeypot field.

## 📄 Pages

- **Home**: Hero section with floating text and particle system
- **About**: Philosophy and license information
- **Projects**: Showcase of digital artifacts with interactive cards
- **AUR**: Arch User Repository packages with installation guide
- **Stats**: git.gay forge index and organization stats
- **Tracker**: Forge activity feed (Forgejo `activities/feeds`)
- **Skills**: Technical expertise, work experience, education, and resume download
- **Contact**: Professional profile, functional contact form, Discord community integration

## ⚙️ License
This project is licensed under the OSL-3.0 (Open Software License 3.0). See the [LICENSE](LICENSE) file for details.
