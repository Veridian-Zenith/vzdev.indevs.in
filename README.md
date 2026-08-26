# Veridian Zenith — Official Portal

A high-end, mystical Nordic-inspired digital realm showcasing the artifacts and technologies forged by Veridian Zenith. Built with React 19, TypeScript, Tailwind CSS v4, and Framer Motion. Features a Skills page with technical expertise, work experience, and downloadable resume.

## ☄ Getting Started

```bash
# Clone the repository
git clone https://github.com/Veridian-Zenith/vzdev.indevs.in.git
cd vzdev.indevs.in

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

Pushes to `main` trigger the **Firebase Deploy** workflow (`.github/workflows/firebase-deploy.yml`), which builds the site and deploys hosting + Firestore rules via `firebase-tools`.

Required GitHub Actions secrets:

| Secret | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web config (build-time env) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
| `VITE_FIREBASE_APP_ID` | Firebase web config |
| `FIREBASE_SERVICE_ACCOUNT_MAIN_WEBSITE_BA2DA` | Service account JSON key used to deploy |

The service account needs at least these IAM roles: **Firebase Hosting Admin** (`roles/firebasehosting.admin`) and **Firebase Rules Admin** (`roles/firebaserules.admin`). Note that CI tokens (`firebase login:ci`) were removed in firebase-tools v15 and are no longer supported.

The contact form writes to the `contactMessages` Firestore collection; its security rules (`firestore.rules`) allow anyone to create well-formed messages while keeping them unreadable to clients. Spam is mitigated server-side by schema/length validation and client-side by a honeypot field.

## 📄 Pages

- **Home**: Hero section with floating text and particle system
- **About**: Philosophy and license information
- **Projects**: Showcase of digital artifacts with interactive cards
- **AUR**: Arch User Repository packages with installation guide
- **Stats**: GitHub forge index and organization stats
- **Tracker**: Application tracking (placeholder)
- **Skills**: Technical expertise, work experience, education, and resume download
- **Contact**: Professional profile, functional contact form, Discord community integration

## ⚙️ License
This project is licensed under the OSL-3.0 (Open Software License 3.0). See the [LICENSE](LICENSE) file for details.
