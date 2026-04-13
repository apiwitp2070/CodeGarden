# Design System Strategy: The Nocturnal Architect

## 1. Overview & Creative North Star
This design system is built upon the **"Nocturnal Architect"** creative north star. It moves away from the flat, utilitarian "SaaS" look and instead embraces the aesthetic of high-end, bespoke integrated development environments (IDEs) and editorial technical journals. 

The goal is to provide a "quiet" interface where the code—the user’s craft—is the hero. We achieve this through **Atmospheric Depth**: rather than using lines to define space, we use shifts in light and density. By utilizing intentional asymmetry (e.g., placing a high-density code block against a wide-margin editorial description), we create a layout that feels curated rather than generated.

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is a sophisticated interplay of deep navies (`#060e20`) and desaturated emeralds (`#75daa8`). It is designed to reduce eye strain while maintaining a high-end, premium feel.

### The "No-Line" Rule
Standard UI relies on 1px solid borders to separate sections. **In this system, 1px solid borders are prohibited for structural sectioning.** Boundaries must be defined through:
*   **Background Shifts:** Transitioning from `surface` to `surface-container-low`.
*   **Negative Space:** Using the spacing scale to create mental boundaries.
*   **Tonal Transitions:** Soft gradients between containers to imply a change in context.

### Surface Hierarchy & Nesting
Think of the UI as physical layers of tinted glass. Use the `surface-container` tiers to create hierarchy:
*   **Foundation:** Global background uses `surface`.
*   **Secondary Content:** Sidebars or secondary feeds use `surface-container-low`.
*   **Primary Focus:** Code editors or main cards use `surface-container-high` to "lift" the content toward the user.
*   **Deep Nesting:** Elements inside a card (like a specific function definition) should drop "down" into `surface-container-lowest` to create a "recessed" look.

### The "Glass & Gradient" Rule
To avoid the "flat box" look, floating elements (modals, dropdowns, tooltips) must use **Glassmorphism**.
*   **Token:** `surface-container-highest` at 80% opacity.
*   **Effect:** Apply a `backdrop-blur` (12px–20px). This allows the deep navy tones to bleed through, ensuring the UI feels cohesive and integrated.
*   **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` to `primary-container`. This adds "soul" and a soft glow that mimics a backlit high-end keyboard.

## 3. Typography: Editorial Technicality
We utilize a three-font system to balance technical precision with editorial authority.

*   **Display & Headlines (Manrope):** Large, wide, and authoritative. Use `display-lg` and `headline-md` for landing pages and snippet titles to give the platform a "journal" feel.
*   **Body & Titles (Inter):** The workhorse. Clean and highly legible. Use `body-md` for descriptions and `title-sm` for UI labels.
*   **Labels & Metadata (Space Grotesk):** Its quirky, geometric nature is perfect for the "developer tool" aesthetic. Use `label-md` for tags, language indicators, and timestamps.
*   **Code (JetBrains Mono - Implicit):** Not in the JSON but required for the "code sharing" context. Use for all code blocks to maintain the professional developer aesthetic.

## 4. Elevation & Depth
Depth is a functional tool, not just a decoration. 

### The Layering Principle
Avoid traditional structural lines. Instead, stack the surface-container tiers. A `surface-container-lowest` card sitting on a `surface-container-low` section creates a natural "sink" for content, drawing the eye inward without the clutter of borders.

### Ambient Shadows
For floating elements where a shadow is required for clarity:
*   **Blur:** 32px to 64px.
*   **Color:** Use a tinted version of `on-surface` at 4–8% opacity (avoid pure black shadows). This mimics natural ambient light in a dark environment.

### The "Ghost Border" Fallback
If a border is absolutely necessary for accessibility (e.g., input fields), use a **Ghost Border**:
*   **Token:** `outline-variant` at 15% opacity. It should be felt more than seen.

## 5. Components

### Buttons
*   **Primary:** Gradient from `primary` to `primary_container`. Text color `on_primary`. Subtle 4px outer glow using `primary` at 20% opacity.
*   **Secondary:** `surface_container_high` with a `ghost border` of `primary`.
*   **Tertiary:** No background. Text color `primary`. Uses `surface_bright` on hover.

### Input Fields & Search
*   **Container:** `surface_container_lowest`.
*   **Border:** None. Use a 2px bottom-accent of `primary` only when focused.
*   **Typography:** `body-md` for input text, `label-sm` for floating labels.

### Code Cards & Lists
*   **Constraint:** **Forbid the use of divider lines.** 
*   **Separation:** Use `surface-container-low` for the list background and `surface-container-high` for the individual item on hover.
*   **Radius:** Use `lg` (0.5rem) for main cards and `md` (0.375rem) for internal elements like chips.

### Chips (Language & Tags)
*   **Style:** `surface-container-highest` background with `on-surface-variant` text.
*   **Active State:** `primary-container` background with `on-primary-container` text.
*   **Shape:** Full pill (`full` / 9999px).

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins for snippet descriptions to create an editorial feel.
*   **Do** leverage `primary_dim` for icons to keep them from being too "loud" against the dark background.
*   **Do** ensure code syntax highlighting uses the desaturated emerald (`primary`) as the anchor color.

### Don't:
*   **Don't** use 100% white (#FFFFFF) for text. Use `on_surface` or `on_surface_variant` to maintain the "muted" tone.
*   **Don't** use standard "drop shadows" with high opacity.
*   **Don't** use sharp corners. Stick to the `md` and `lg` roundedness scale to keep the "soft nocturnal" feel.
*   **Don't** use a divider line when 24px of whitespace could do the same job.