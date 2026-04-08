# Johanes Peter Vincentius Portfolio

A modern, interactive portfolio website built with Next.js and React, featuring smooth animations, responsive design, and a beautiful UI.

## 🌟 Features

- **Interactive UI** - Modern and responsive design with smooth animations
- **Dark/Light Mode** - Full theme support with seamless transitions
- **Snap Scrolling** - Smooth section-based navigation
- **Dynamic Carousels** - Interactive project and technology showcases
- **Responsive Design** - Optimized for all screen sizes
- **Custom Backgrounds** - Beautiful animated backgrounds
- **Accessibility** - ARIA labels and keyboard navigation support

## 🛠 Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Animations & 3D**:
  - Three.js
  - React Three Fiber
  - React Three Drei
  - react-fluid-distortion (Cursor-based fluid effects)
- **Carousel**: Embla Carousel
- **Icons**: React Icons, Lucide React

## 📱 Sections

1. **Profile**
   - Personal introduction
   - Social media links
   - Dynamic theme-aware styling

2. **Work Experience**
   - Professional history
   - Role descriptions
   - Timeline presentation

3. **Projects**
   - Interactive project cards
   - GitHub repository links
   - Project descriptions

4. **Technologies**
   - Categorized tech stack
   - Interactive carousel
   - Linked documentation

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/JohanesPeterV/johanespetervincentius.git
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Development

- **Development Mode**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm run start`
- **Linting**: `npm run lint`

## 📦 Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # Reusable components
├── sections/        # Main page sections
│   ├── profile/     # Profile section
│   ├── projects/    # Projects showcase
│   ├── technologies/# Tech stack
│   └── work-experience/ # Work history
└── styles/          # Global styles
```

## 🎨 Customization

- Base color palettes live in `src/registry/registry-base-colors.ts`
- Runtime theme resolution lives in `src/lib/theme-colors.ts`
- CSS variables are applied by `src/components/theme-switcher.tsx`
- Animations can be modified in respective component files
- Content can be updated in the respective section files

## 🎨 Color System

This project uses semantic color tokens instead of component-level palette picks.

### Source of truth

- `src/registry/registry-base-colors.ts`: base theme definitions and per-theme token values
- `src/lib/theme-colors.ts`: helpers for resolving the active theme and deriving hex values for non-CSS consumers
- `src/app/globals.css`: default CSS variable fallback values

### Usage rules

- Use semantic utilities such as `bg-background`, `text-foreground`, `bg-card`, `border-border`, and `text-muted-foreground`
- Use `primary` for interactive emphasis, active states, and brand-highlighted text
- Use `secondary` for quiet interactive surfaces and alternate sections
- Use `muted` and `muted-foreground` for supporting UI, placeholders, and low-emphasis metadata
- Use `accent` for hover and transient emphasis surfaces, not as a second brand color
- Use `destructive` only for dangerous actions and error states
- Avoid hardcoded Tailwind palette classes such as `text-blue-500`, `bg-slate-200`, and `border-white/20` in app code
- Avoid raw hex, `rgb()`, or `hsl()` in app UI unless a browser API or canvas/WebGL integration requires it

### Gradients and effects

- Build gradients from semantic tokens when possible, for example `from-foreground via-primary to-muted-foreground`
- For WebGL and metadata colors, resolve from `getThemeColorValues` or `getFluidThemeColors` instead of duplicating registry lookup logic
- If a component needs a new visual role, prefer extending the semantic token model before adding one-off colors in the component

### Quick examples

```tsx
<div className="bg-card text-card-foreground border border-border" />

<button className="bg-primary text-primary-foreground hover:bg-primary/90" />

<p className="text-muted-foreground" />

<div className="bg-gradient-to-r from-foreground via-primary to-muted-foreground" />
```

## 📄 License

MIT License - feel free to use this code for your own portfolio!

## 🔗 Links

- [Live Demo](https://johanespetervincentius.com)
- [GitHub Repository](https://github.com/JohanesPeterV/johanespetervincentius)
- [LinkedIn](https://www.linkedin.com/in/johanes-vincentius-714b311a4)
