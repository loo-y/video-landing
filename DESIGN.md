# Design System: Trip.com Tour
## 1. Visual Theme & Atmosphere
Trip.com Tour is a professional, information-dense travel booking platform for package tours (group tours & private tours). The design prioritizes clarity, trust, and conversion — structured layouts present complex itinerary and pricing data in a scannable hierarchy.
The foundation is pure white (`#FFFFFF`) surfaces with **Trip Blue** (`#2C61FE`) as the singular brand accent — used for primary CTAs, active states, links, and brand moments. Text uses near-black (`#121826`) rather than pure black, creating a slightly warmer reading experience.
Typography uses **TRIPGEOM** — a proprietary geometric sans-serif set globally via `--default-font-family: TRIPGEOM-REGULAR`. Font weight is controlled by standard Tailwind utility classes: `font-bold`, `font-medium`, and default (regular). The font is confident and neutral, suited for data-heavy travel content.
What distinguishes Trip.com Tour's visual language is its **navy-tinted shadow system**. The primary card shadow uses `rgba(15,41,77,0.12)` — a deep navy tint rather than pure black — creating depth that feels institutional and trustworthy rather than generic. Combined with conservative border-radius (4px buttons, 8px cards, 12px panels), the interface feels structured and reliable.
The layout is a **fixed 1160px two-column design**: a 740px content column on the left and a 408px sticky booking panel on the right. This is not a responsive grid — it is a desktop-first, fixed-width architecture.
**Key Characteristics:**
- Pure white canvas with Trip Blue (`#2C61FE`) as singular brand accent
- TRIPGEOM geometric sans-serif, weight via standard Tailwind classes (`font-bold` / `font-medium` / default)
- Dual token system: `--smtcColor*` (primary) and `--coreColor*` (legacy)
- Navy-tinted card shadows: `rgba(15,41,77,0.12)` — not pure black
- Conservative border-radius: 4px buttons, 8px cards, 12px panels
- Fixed 1160px width, two-column layout
- Near-black text (`#121826`) — not pure `#000000`
- Information-dense: tables, tabs, fee breakdowns, itinerary timelines
## 2. Color Palette & Roles
### Primary Brand
- **Trip Blue** (`#2C61FE`): `--smtcColorBgBrandFilled` / `--smtcColorTextBrand` — primary CTA, active tabs, links, brand accent
- **Trip Blue Tinted** (`#F1F5FF`): `--smtcColorBgBrandTintedLow` — selected tab bg, product tag bg
- **Trip Blue Border** (`#C6D7FF`): `--smtcColorBorderBrand` — brand border (light)
- **Trip Blue Border Bold** (`#2C61FE`): `--smtcColorBorderBrandBold` — active tab border
- **Rate Blue** (`#173CD2`): `--smtcColorBgRateFilled` / `--smtcColorTextRate` — rating badges
### Text Scale
- **Near Black** (`#121826`): `--smtcColorTextPrimary` / `--coreColorBlack` — primary text
- **Secondary** (`#4F5563`): `--smtcColorTextSecondary` / `--coreColorSecondaryBlack` — subtitles, metadata
- **Tertiary** (`#6F7685`): `--smtcColorTextTertiary` / `--coreColorTertiaryBlack` — tertiary text, placeholders
- **Disabled** (`#B9BEC7`): `--smtcColorTextDisabled` / `--coreColorGray` — disabled states
- **White** (`#FFFFFF`): `--smtcColorTextContentWhite` — text on dark/brand backgrounds
### Semantic Colors
- **Notice Orange** (`#C74401`): `--smtcColorTextNotice` / `--smtcColorBgNoticeFilled` — booking limits, important notices
- **Warning Red** (`#D02C2A`): `--smtcColorTextWarning` / `--smtcColorBgWarning` — high-severity warnings, errors
- **Discount Pink** (`#D81E60`): `--smtcColorTextDiscount` / `--smtcColorBgDiscountFilled` — savings, discounts, favorites
- **Success Cyan** (`#047C88`): `--smtcColorTextEncourage` / `--smtcColorBgSuccessFilled` — success, encouragement
- **Marketing Purple** (`#6D4DF8`): `--smtcColorTextMarketing` / `--coreColorPurple` — marketing labels
- **Coins Gold** (`#966A00`): `--smtcColorTextCoins` — trip coins
- **TripBest Brown** (`#673114`): `--smtcColorTextTripBest` / `--coreColorTripBestBrown` — TripBest badges
### Surface & Background
- **White** (`#FFFFFF`): `--smtcColorBgSurface` — main surface, dialogs, cards
- **Container Gray** (`#F6F7FA`): `--smtcColorBgContainer` / `--smtcColorBgSurfaceSecondary` — info tips, unselected tabs
- **Page Gray** (`#EBEDF1`): `--smtcColorBgPage` — page background, dividers
- **Scrim** (`rgba(0,0,0,0.64)`): `--smtcColorBgScrim` — modal overlay
- **Skeleton** (`rgba(111,118,133,0.16)`): `--coreColorPlaceholderGray` — shimmer loading bg
- **Notice Tinted** (`#FDF5F2`): `--smtcColorBgNoticeTintedLow` — notice-level background
- **Discount Tinted** (`#FFF3F6`): `--smtcColorBgDiscountTintedHigh` — discount tag bg
- **Success Tinted** (`#EDFAFB`): `--smtcColorBgSuccessTintedHigh` — success background
- **Disabled Filled** (`#B9BEC7`): `--smtcColorBgDisabledFilled` — disabled button bg
- **TripBest Tinted** (`rgba(255,226,200,0.32)`): `--smtcColorBgTripBestTinted`
### Border & Divider
- **Info Divider** (`#D4D7DE`): `--smtcColorDividerInfo` — table borders, section dividers
- **Form Divider** (`#D4D7DE`): `--smtcColorDividerForm` — form separators
- **Tertiary Gray** (`#D4D7DE`): `--coreColorTertiaryGray` — tab separators, input borders
- **Error Border** (`#FFC8C0`): `--smtcColorBorderError`
- **Notice Border** (`#FFCAB0`): `--smtcColorBorderNotice`
- **Success Border** (`#A9E4EA`): `--smtcColorBorderSuccess`
- **Discount Border** (`#FCC8D0`): `--smtcColorBorderDiscount`
- **Disabled Border** (`#D4D7DE`): `--smtcColorBorderDisabled`
### Alias Tokens
- `--black-10`: `#121826` — widely used as primary text alias in older components
- `--border-date`: `#dadfe6` — calendar date borders
- `--28_TertiaryBlack`: `#8592a6` — calendar tertiary text
- `--mark-gray`: `rgba(0,0,0,0.6)` — watermark overlay
## 3. Typography Rules
### Font Family
- **Default**: `TRIPGEOM-REGULAR` (set globally via `--default-font-family` CSS variable)
- **Iconfont**: `trip_tour_online_common` (loaded from CDN)
### Tailwind Usage
Font weight is controlled by standard Tailwind utility classes. The deprecated `font_TRIPGEOM_BOLD` / `font_TRIPGEOM_MEDIUM` / `font_TRIPGEOM_REGULAR` custom classes are legacy and should not be used in new code.
```html
<!-- Current standard (use these) -->
<div class="font-bold">Bold heading</div>
<div class="font-medium">Medium label</div>
<div>Regular body (default weight)</div>
```
**Important**: In `detail.input.css`, `.font-medium` is overridden to `font-weight: 600` (not the Tailwind default 500).
### Hierarchy
| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Product Title (new) | 28px | `font-bold` | 36px | Main page heading |
| Section Heading | 28px | `font-bold` | 34px | Expenses, Itinerary, Guidelines |
| Product Title (old) | 24px | `font-bold` | 34px | Legacy title style |
| Modal Title | 20px | `font-bold` | 26px | Dialog section headings |
| Secondary Heading | 18px | `font-bold` | 24px | CTA text, day titles, sub-headings |
| Body Emphasis | 16px | `font-medium` | 22px | Sub-section titles, button text |
| Body | 14px | (default) | 22px / 21px | Detail content, table data, labels |
| Tooltip | 13px | (default) | 18px | Tooltip-only size |
| Small / Tag | 12px | `font-medium` | 18px / 16px | Badges, tags, tax labels |
### Principles
- **Three weight stops**: default (regular) → `font-medium` (600) → `font-bold`. No thin/light weights.
- **`font-medium` = 600**: This project overrides Tailwind's default 500 to 600 for `.font-medium`.
- **No negative letter-spacing**: Unlike Airbnb, Trip.com Tour uses default letter-spacing throughout.
- **Line height is explicit**: Always specified via `leading-[Npx]`, never left to browser default.
## 4. Component Stylings
### Buttons
**Primary CTA (Footer Book Now)**
```
min-w-[165px] px-1 h-[56px] rounded-[4px]
bg-[var(--smtcColorBgBrandFilled)]
text-[var(--smtcColorTextWhite)] text-[18px] leading-[24px]
font-bold cursor-pointer
```
- Hover: `hover:bg-[var(--smtcColorBgBrandFilled)]/90`
- Disabled: `bg-[var(--smtcColorBgDisabledFilled)] cursor-not-allowed`
**Secondary CTA (In-page Actions)**
```
rounded-[4px] px-4 py-2
bg-[var(--smtcColorBgBrandFilled)]
text-[var(--smtcColorTextContentWhite)] text-[16px] leading-[22px]
font-medium cursor-pointer
```
### Cards & Containers
**Basic Info Card**
```
bg-[var(--coreColorContentWhite)] rounded-[8px]
shadow-[0_8px_20px_0_rgba(15,41,77,0.12)]
px-4 py-4 gap-4 min-h-[465px]
```
**Hover Card / Popover Content**
```
bg-[var(--coreColorContentWhite)] rounded-lg
shadow-[0_8px_20px_0_rgba(15,41,77,0.12)]
p-4 border-none max-h-[600px] overflow-y-auto
```
**Dialog / Modal**
```
z-[101] rounded-[8px]
bg-[var(--smtcColorBgSurface)] border-transparent
pl-6 pr-6 pb-6 pt-[1.125rem]
max-h-[912px] overflow-hidden
```
### Tabs / Segment Control
**Fee Type Tabs (old)**
```
/* Default */
border border-solid border-[var(--smtcColorDividerInfo)]
px-8 py-3 rounded-[4px] cursor-pointer
/* Active */
border-[var(--smtcColorBorderBrandBold)]
bg-[var(--smtcColorBgBrandTintedLow)]
text-[var(--smtcColorTextBrand)]
/* Disabled */
cursor-not-allowed text-[var(--smtcColorTextPlaceholder)]
```
### Rating Badge (Asymmetric)
```
rounded-[13px_0_13px_13px]
bg-[var(--smtcColorBgRateFilled)]
h-[26px] px-[6px]
font-medium
text-[var(--smtcColorTextContentWhite)]
```
### Discount Badge (Split Design)
```
/* Left half */
rounded-[2px_0_0_2px]
bg-[var(--smtcColorBgDiscountTintedHigh)]
text-[var(--smtcColorTextDiscount)]
/* Right half */
rounded-[0_2px_2px_0]
bg-[var(--smtcColorTextDiscount)]
text-[var(--smtcColorTextWhite)]
```
### Coupon / Product Tag
```
rounded-[2px] px-[6px] py-[4px]
bg-[var(--smtcColorBgBrandTintedHigh)]
text-nowrap text-[12px] leading-[16px]
```
### Info Tip Block
```
bg-[var(--smtcColorBgSurfaceSecondary)]
rounded-[4px] px-4 py-2
flex flex-col gap-1
```
### Provider / Notice Tip
```
bg-[var(--smtcColorBgNoticeFilled)]/8
rounded-[4px] p-4
text-[var(--coreColorOrange)] text-[16px] leading-[22px]
flex gap-2
```
### IM Contact Block
```
bg-[var(--smtcColorBgSurface)]
border-[0.5px] border-solid border-[var(--coreColorTertiaryGray)]
rounded-[4px] px-[20px] py-[16px]
```
### Dividers
```
/* Full-width line */
w-full h-[1px] bg-[var(--smtcColorDividerInfo)]
/* Dotted table border */
border-b border-dotted border-[var(--smtcColorDividerInfo)]
/* Vertical separator */
w-[1px] h-[10px] bg-[var(--coreColorTertiaryGray)]
```
### Skeleton / Shimmer Loading
```
bg-[var(--coreColorPlaceholderGray)]
shimmer-bg animate-[shimmer_1.5s_infinite_linear]
h-6 w-full
```
## 5. Layout Principles
### Page Structure
- **Max content width**: `max-w-[1160px] min-w-[1160px] mx-auto`
- **Two-column**: Left content `w-[740px]` (old) / `w-[754px]` (new) + Right panel `w-[408px]`
- **Right panel**: Sticky via `react-stickynode`, bounded by content bottom
- **Fixed footer**: `fixed bottom-0 left-0 right-0 w-[100vw] z-[99]`
- **Footer inner**: `w-[1160px] mx-auto`
### Spacing System
**Common Padding:**
| Value | Context |
|-------|---------|
| `p-4` (16px) | Cards, hover cards, table cells |
| `p-6` (24px) | Dialog/modal content |
| `px-4 py-2` | Table cells, info tips |
| `px-[20px] py-[16px]` | IM section, GetItinerary |
| `px-[24px]` | Middle content area (new) |
| `px-8 py-3` | Tab buttons |
| `px-[6px] py-[4px]` | Small badges, product tags |
**Common Gap Values:**
| Value | Context |
|-------|---------|
| `gap-1` (4px) | Icon + text pairs |
| `gap-2` (8px) | Footer price elements, tip lines |
| `gap-4` (16px) | Card spacing, fee items, accordion content |
| `gap-[20px]` | BasicInfoNew sections, info list items |
| `gap-[24px]` | TitleHeader main gap |
| `gap-[44px]` | Main content sections (Itinerary → Expenses → Guidelines) |
**Section Heading Bottom Margin**: `mb-[20px]` (consistent across Expenses, BookingGuidelines, ItineraryInfo)
### Z-Index Hierarchy
| Value | Element |
|-------|---------|
| `z-[101]` | Dialogs, modal overlays |
| `z-[100]` | Vendor hover cards, booking popovers |
| `z-[99]` | Footer bar, price detail hovers |
| `z-10` | Internal elements, flash overlays |
| `z-[3]` | Sticky nav inner |
| `z-0` | Sticky nav outer |
| `-z-10` | Background elements, placeholders |
## 6. Depth & Elevation
| Level | Shadow | Use |
|-------|--------|-----|
| Flat (Level 0) | No shadow | Page background, text blocks, inline content |
| Nav (Level 1) | `0 4px 12px 0 rgba(0,0,0,0.05)` | Sticky navigation bar |
| Nav Scrolled (Level 1.5) | `0 2px 20px 0 rgba(0,0,0,0.1)` | Sticky navigation when scrolled |
| Card (Level 2) | `0 8px 20px 0 rgba(15,41,77,0.12)` | Info cards, hover cards, vendor popovers |
| Popover (Level 3) | `0 4px 16px 0 rgba(69,88,115,0.2)` | Dropdowns, price popovers, calendar overlay |
| Footer (Special) | `0 -2px 10px rgba(0,0,0,0.2)` | Fixed footer — negative Y for upward shadow |
| Emphasis (Animated) | `0 20px 40px -4px rgba(7,20,60,0.35)` | Peak of emphasize animation keyframe |
**Shadow Philosophy**: Trip.com Tour uses a **navy-tinted shadow system**. The primary card shadow at `rgba(15,41,77,0.12)` — a deep navy rather than neutral black — gives elevated surfaces a professional, institutional quality associated with the travel industry. The popover shadow shifts to `rgba(69,88,115,0.2)` — a blue-gray tint at higher opacity for interactive overlays that demand attention.
### Border Radius Scale
| Value | Context |
|-------|---------|
| `2px` | Discount/coupon tags, product tags, small badges, active indicators |
| `4px` | CTA buttons, tab buttons, info tips, tables, IM sections, tooltips, inputs |
| `8px` | Primary cards, dialogs, nav bar, comment review, offline toolbar |
| `12px` | Travel option panel (sticky right), middle content area (new design) |
| `13px 0 13px 13px` | Rating score badge — asymmetric (top-right sharp corner) |
| `50%` / `full` | Favorite button, dot indicators, circular elements |
## 7. Animation & Transitions
### Keyframe Animations (defined in `detail.input.css`)
**Image Carousel Progress**
```css
@keyframes image-carousel-progress {
    0% { width: 0 }
    100% { width: 100% }
}
```
**Border Flash** — draws attention to booking panel
```css
@keyframes border-flash {
    0%, 100% { border-color: transparent; border-width: 4px }
    50% { border-color: #3264FF; border-width: 4px }
}
```
**Emphasize** — subtle scale + shadow pulse on booking panel
```css
@keyframes emphasize {
    0%, 100% {
        box-shadow: 0 8px 20px 0 rgba(7,20,60,0.12);
        transform: scale(1);
        border-color: transparent;
    }
    50% {
        box-shadow: 0 20px 40px -4px rgba(7,20,60,0.35);
        transform: scale(1.01);
        border-color: rgba(7,20,60,0.2);
    }
}
```
**Shimmer** — skeleton loading sweep
```css
@keyframes shimmer {
    0% { background-position: -200% 0 }
    100% { background-position: 200% 0 }
}
```
### Transition Patterns
- **Opacity fade**: `transition-opacity duration-300` (general), `duration-[2000ms]` (slow fade)
- **Collapse/expand**: `transition-all duration-500` on itinerary day sections
- **Color change**: `transition-colors` on interactive buttons
- **Spinner**: `animate-spin` on loading button icon
## 8. Responsive Behavior
### Current Strategy
Trip.com Tour uses a **fixed-width desktop layout** — not a responsive grid system.
- **Content width**: Fixed at `1160px` (`max-w-[1160px] min-w-[1160px]`)
- **Breakpoint**: Single `@media screen and (max-width: 1552px)` adjusts left margin
- **No mobile layout**: Desktop-only rendering
### Sticky Behavior
- **Navigation bar**: Sticks to top via `react-stickynode`, gains shadow when scrolled
- **Right booking panel**: Sticky with configurable top offset and bottom boundary
- **Footer**: Fixed at viewport bottom (`fixed bottom-0`)
### Overflow Handling
- **Booking panel**: `overflow-y-scroll overflow-x-hidden scrollbar-hide` with `max-h-[calc(100vh-136px)]`
- **Text truncation**: `line-clamp-1` for single-line ellipsis
- **Scrollbar hiding**: `.scrollbar-hide` utility class (hides scrollbar across browsers)
## 9. Do's and Don'ts
### Do
- Use CSS variables (`--smtcColor*`, `--coreColor*`) for all colors via `bg-[var(--token)]` / `text-[var(--token)]`
- Use standard Tailwind font weight classes: `font-bold`, `font-medium`, or default (regular)
- Remember `font-medium` = `font-weight: 600` in this project (overridden in detail.input.css)
- Use navy-tinted shadows `rgba(15,41,77,0.12)` for card elevation — never pure black on cards
- Use 4px radius for buttons/inputs, 8px for cards/dialogs, 12px for panels
- Keep page content within `1160px` max-width with `mx-auto`
- Use `--smtcColorTextPrimary` (`#121826`) for text — not pure black
- Use explicit `leading-[Npx]` for all text elements
- Apply opacity via Tailwind modifier: `bg-[var(--token)]/80`
### Don't
- Don't use pure black (`#000000`) for text — always use `#121826`
- Don't hardcode hex colors inline — use CSS variable tokens
- Don't use `rgba(0,0,0,*)` shadows on cards — use navy-tinted `rgba(15,41,77,*)`
- Don't use border-radius > 12px on rectangular elements (this is not Airbnb's rounded style)
- Don't create responsive/mobile layouts — the current architecture is fixed 1160px
- Don't use deprecated `font_TRIPGEOM_*` custom utility classes — use standard `font-bold` / `font-medium`
- Don't use `font-medium` without understanding it maps to `font-weight: 600` in this project
- Don't introduce new color values — extend the `--smtcColor*` / `--coreColor*` token system
- Don't use large z-index values beyond the established hierarchy (max `z-[101]`)
## 10. Agent Prompt Guide
### Quick Color Reference
| Role | Variable | Hex |
|------|----------|-----|
| Background | `--smtcColorBgSurface` | `#FFFFFF` |
| Text | `--smtcColorTextPrimary` | `#121826` |
| Secondary text | `--smtcColorTextSecondary` | `#4F5563` |
| Tertiary text | `--smtcColorTextTertiary` | `#6F7685` |
| Brand accent | `--smtcColorBgBrandFilled` | `#2C61FE` |
| Brand tint | `--smtcColorBgBrandTintedLow` | `#F1F5FF` |
| Disabled | `--smtcColorBgDisabledFilled` | `#B9BEC7` |
| Notice | `--smtcColorTextNotice` | `#C74401` |
| Warning | `--smtcColorTextWarning` | `#D02C2A` |
| Discount | `--smtcColorTextDiscount` | `#D81E60` |
| Success | `--smtcColorTextEncourage` | `#047C88` |
| Card shadow | — | `0 8px 20px 0 rgba(15,41,77,0.12)` |
| Popover shadow | — | `0 4px 16px 0 rgba(69,88,115,0.2)` |
| Divider | `--smtcColorDividerInfo` | `#D4D7DE` |
| Container bg | `--smtcColorBgContainer` | `#F6F7FA` |
### Example Component Prompts
- "Create an info card: white background (`--smtcColorBgSurface`), 8px radius, navy shadow `0 8px 20px 0 rgba(15,41,77,0.12)`, p-4. Title at 28px `font-bold` in `--smtcColorTextPrimary`, body at 14px default weight in `--smtcColorTextSecondary`."
- "Build a CTA button: `--smtcColorBgBrandFilled` background, white text, 4px radius, h-[56px], 18px `font-bold`. Disabled state uses `--smtcColorBgDisabledFilled` with `cursor-not-allowed`."
- "Design a fee tab bar: horizontal flex with gap-3. Each tab: border + 4px radius. Active tab: `--smtcColorBorderBrandBold` border, `--smtcColorBgBrandTintedLow` bg, `--smtcColorTextBrand` text. Default: `--smtcColorDividerInfo` border."
- "Create a rating badge: asymmetric radius `rounded-[13px_0_13px_13px]`, `--smtcColorBgRateFilled` bg, white text, h-[26px], px-[6px], `font-medium`."
- "Build a notice tip block: `--smtcColorBgNoticeFilled` at 8% opacity background, 4px radius, p-4, `--coreColorOrange` text at 16px, flex with gap-2 for icon + content."
- "Design a discount badge (split): Left half `rounded-[2px_0_0_2px]` with `--smtcColorBgDiscountTintedHigh` bg and `--smtcColorTextDiscount` text. Right half `rounded-[0_2px_2px_0]` with `--smtcColorTextDiscount` bg and white text. Both at 12px."
- "Create skeleton loading: `--coreColorPlaceholderGray` background with `shimmer-bg` class and `animate-[shimmer_1.5s_infinite_linear]`. Use rounded rectangles matching content layout dimensions."
### Iteration Guide
1. Start with white surface — the content structure provides visual interest
2. Trip Blue (`#2C61FE`) is the singular brand accent — CTAs, active states, links only
3. Near-black (`#121826`) for text — use the token `--smtcColorTextPrimary`
4. Navy-tinted shadows `rgba(15,41,77,0.12)` for cards — always this tint, never pure black
5. Conservative radius: 4px for actions, 8px for containers, 12px for panels
6. TRIPGEOM font with 3 weight stops via Tailwind: `font-bold`, `font-medium`, default
7. Fixed 1160px width — no responsive breakpoints needed
8. Use `--smtcColor*` tokens first, fall back to `--coreColor*` only when needed
