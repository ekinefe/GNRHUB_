# Credits and third-party licenses

The site's own code is under the project [LICENSE](LICENSE). Everything below stays under its authors' licenses. Licenses were read from the installed packages (`node_modules/<pkg>/package.json`) on 2026-10-16.

## Code shipped to the browser
| Package | Version | License |
|---|---|---|
| React, React DOM | 18.3.1 | MIT |
| React Router | 7.13.0 | MIT |
| Motion / Framer Motion | 12.34.3 | MIT |
| Lucide icons (`lucide-react`) | 0.475.0 | ISC |
| clsx | 2.1.1 | MIT |
| tailwind-merge | 3.4.1 | MIT |
| html2pdf.js (brand book editor, off at launch) | 0.14.0 | MIT |
| Supabase JS (sign-in, hidden at launch) | 2.98.0 | MIT |
| GSAP | 3.14.2 | GSAP "Standard 'no charge'" license (<https://gsap.com/standard-license>): free to use, including commercially, but not an open-source license; it may not be used to build tools that compete with Webflow's visual animation builder. A personal portfolio is fine. |

Build and test tools (not shipped): Vite, Tailwind CSS (MIT), Vitest, Testing Library, ESLint.

## React Bits components
`TextType`, `FuzzyText` and `DecryptedText` in `frontend/src/shared/animations/` are adapted from [React Bits](https://github.com/DavidHDev/react-bits) by David Haz, licensed **MIT + Commons Clause**: free to use in an application or website, including commercially, **but the components themselves may not be sold, sublicensed or redistributed alone, in a bundle or as a ported version.** Each adapted file carries a header with the copyright notice. Because this repository is public, keep those three files as part of the app only and do not publish or package them separately.

## Fonts (self-hosted, `frontend/public/fonts/`)
- **JetBrains Mono**, (c) The JetBrains Mono Project Authors, SIL Open Font License 1.1
- **Space Grotesk**, (c) The Space Grotesk Project Authors, SIL Open Font License 1.1

## Images
- `frontend/src/assets/AboutMe/avatar.jpg`: personal photo.
- `frontend/public/projects/gnrdigital.png` and `frontend/public/og.png`: made for this site.
