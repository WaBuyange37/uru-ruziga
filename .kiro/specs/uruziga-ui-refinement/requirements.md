# Requirements Document

## Introduction

The Uruziga language learning platform teaches the Kinyarwanda language and Umwero script. While the platform's core functionality is solid, the user interface suffers from visual complexity, excessive scrolling, inconsistent design patterns, and unclear navigation pathways. This creates cognitive overload for learners and distracts from the primary goal: learning the Umwero script.

This specification defines a comprehensive UI/UX refinement that transforms Uruziga from a cluttered information portal into a focused, modern language-learning platform. The refinement applies minimalist design principles, reduces page density by 30-50%, establishes a cohesive design system, and creates clear user pathways that reinforce the Learn → Practice → Improve → Continue loop.

**Critical Constraint**: This is a UI/UX-only specification. NO changes to database schemas, API contracts, Prisma models, authentication logic, OCR algorithms, translator logic, Supabase storage, lesson data, character mappings, font mappings, or scoring algorithms are permitted.

## Glossary

- **Design_System**: A collection of reusable UI components with consistent styling, spacing, and behavior patterns
- **Page_Density**: The amount of content and visual elements presented per viewport height, measured in scroll distance required
- **Visual_Complexity**: The cognitive load created by colors, fonts, borders, shadows, animations, and layout patterns
- **User_Pathway**: A clear sequence of actions that guides learners from one learning activity to the next
- **Minimalism**: A design philosophy that removes non-essential elements to focus attention on core functionality
- **Color_Palette**: The restricted set of three colors used throughout the platform (white background, black text, brown accent #8b4513)
- **Mobile_First**: A design approach that starts with mobile viewport constraints (320px) and scales up to desktop (1440px)
- **Educational_Focus**: Design decisions that prioritize learning outcomes over decorative or social features
- **Component**: A reusable UI element with consistent styling and behavior (Button, Card, SectionHeader, etc.)
- **Practice_Canvas**: The dedicated writing interface where learners practice Umwero script characters
- **Learner_Dashboard**: The personalized home page that answers "What should I do next?"
- **Mastery_Level**: The learner's competency level for a character or lesson (beginner, intermediate, advanced)
- **Progress_Bar**: A visual indicator showing completion percentage or mastery level
- **Empty_State**: A placeholder UI shown when no data exists, with clear guidance on next actions

## Requirements

### Requirement 1: Establish Design System Foundation

**User Story:** As a developer, I want a reusable design system, so that I can build consistent UI components across all pages.

#### Acceptance Criteria

1. THE Design_System SHALL define a Button component with variants (primary, secondary, ghost, danger)
2. THE Design_System SHALL define a Card component with consistent padding, border radius, and elevation
3. THE Design_System SHALL define a SectionHeader component with consistent typography hierarchy
4. THE Design_System SHALL define a PageContainer component with consistent max-width and responsive padding
5. THE Design_System SHALL define a ProgressBar component with percentage and mastery level display
6. THE Design_System SHALL define an EmptyState component with icon, message, and call-to-action
7. THE Design_System SHALL define a Modal component with consistent overlay, positioning, and close behavior
8. THE Design_System SHALL define a Badge component for status indicators (new, completed, mastery level)
9. WHEN any component renders, THE Design_System SHALL use only the Color_Palette (white, black, #8b4513)
10. WHEN any component renders on mobile, THE Design_System SHALL remain functional from 320px to 1440px viewport width

### Requirement 2: Reduce Practice Canvas Visual Complexity

**User Story:** As a learner, I want the Practice Canvas to be distraction-free, so that I can focus entirely on writing practice.

#### Acceptance Criteria

1. THE Practice_Canvas SHALL display only the character prompt, writing area, submit button, and minimal feedback during active practice
2. THE Practice_Canvas SHALL hide navigation menus, footers, and decorative elements while writing is in progress
3. THE Practice_Canvas SHALL use white background, black text, and brown accent colors only
4. THE Practice_Canvas SHALL collapse instruction panels into a single toggleable help button
5. WHEN a learner completes a character, THE Practice_Canvas SHALL show feedback in a non-intrusive overlay that does not block the next action
6. THE Practice_Canvas SHALL display progress (characters completed / total characters) in a compact top bar
7. THE Practice_Canvas SHALL provide a "Continue to Next Character" action within 1 click of completing feedback
8. THE Practice_Canvas SHALL reduce total page density by 40-50% compared to the current implementation

### Requirement 3: Simplify Learner Dashboard

**User Story:** As a learner, I want the Dashboard to immediately show me what to do next, so that I can continue learning without confusion.

#### Acceptance Criteria

1. THE Learner_Dashboard SHALL display a primary "Continue Learning" card as the first visible element
2. THE Learner_Dashboard SHALL show current progress summary (lessons completed, characters mastered, current streak) in a compact metrics section
3. THE Learner_Dashboard SHALL display recommended next lessons based on progress and mastery levels
4. THE Learner_Dashboard SHALL hide inactive or placeholder sections with no actionable content
5. WHEN no progress exists, THE Learner_Dashboard SHALL display an Empty_State with "Start Your First Lesson" call-to-action
6. THE Learner_Dashboard SHALL reduce total page height by 30-40% compared to the current implementation
7. THE Learner_Dashboard SHALL answer "What should I do next?" within 5 seconds of page load for new learners
8. THE Learner_Dashboard SHALL provide 1-click access to the next recommended lesson

### Requirement 4: Refactor Learn Page Structure

**User Story:** As a learner, I want the Learn page to clearly show lessons, characters, and my mastery progress, so that I can understand my learning path.

#### Acceptance Criteria

1. THE Learn_Page SHALL organize content into clear sections: Current Lesson, Available Lessons, Character Mastery
2. THE Learn_Page SHALL display each lesson as a Card component with title, description, progress bar, and start/continue button
3. THE Learn_Page SHALL display character mastery using Badge components (beginner, intermediate, advanced, mastered)
4. THE Learn_Page SHALL use collapsible sections for character details to reduce initial page density
5. THE Learn_Page SHALL highlight the current lesson with brown accent color and visual priority
6. THE Learn_Page SHALL reduce total page density by 30-40% compared to the current implementation
7. WHEN no lessons are available, THE Learn_Page SHALL display an Empty_State with clear guidance
8. THE Learn_Page SHALL render character lists in a responsive grid (1 column mobile, 2-3 columns tablet, 4-6 columns desktop)

### Requirement 5: Streamline Translator Interface

**User Story:** As a learner, I want the Translator to be simple and focused on vowels by default, so that I can quickly understand character mappings without overwhelming tables.

#### Acceptance Criteria

1. THE Translator SHALL display vowel mappings as the default view on page load
2. THE Translator SHALL collapse consonant combination tables into expandable sections
3. THE Translator SHALL use Card components for each vowel with Umwero character, Latin equivalent, and pronunciation guide
4. THE Translator SHALL provide a tabbed interface (Vowels, Consonants, Full Table) for navigation between views
5. THE Translator SHALL reduce the initial visible table size by 70-80% by showing only essential vowel mappings
6. THE Translator SHALL maintain all existing mapping data without modification
7. THE Translator SHALL render character mappings in responsive grids appropriate for mobile and desktop
8. THE Translator SHALL use the Color_Palette exclusively (no additional decorative colors)

### Requirement 6: Simplify Community Page

**User Story:** As a learner, I want the Community page to focus on educational discussions, so that I can engage with learning-focused content.

#### Acceptance Criteria

1. THE Community_Page SHALL display posts as Card components with consistent spacing and layout
2. THE Community_Page SHALL prioritize educational discussions over social media features (likes, shares)
3. THE Community_Page SHALL use minimal UI chrome (borders, shadows, decorative elements)
4. THE Community_Page SHALL provide clear post creation and reply actions with Button components
5. THE Community_Page SHALL reduce visual complexity by 40-50% compared to current implementation
6. WHEN no posts exist, THE Community_Page SHALL display an Empty_State encouraging first post creation
7. THE Community_Page SHALL render post lists in a single-column layout for readability
8. THE Community_Page SHALL use brown accent color for primary actions only (create post, reply)

### Requirement 7: Refactor Fund Page to Mission-Focused Design

**User Story:** As a visitor, I want the Fund page to explain the mission, impact, and support options clearly, so that I understand how to contribute without fake data.

#### Acceptance Criteria

1. THE Fund_Page SHALL display three sections only: Mission Statement, Impact Metrics, Support Options
2. THE Fund_Page SHALL remove all fake funding data, placeholder sponsors, and decorative testimonials
3. THE Fund_Page SHALL use Card components for each support tier with clear descriptions and benefits
4. THE Fund_Page SHALL display real impact metrics only (active learners, lessons created, cultural preservation efforts)
5. THE Fund_Page SHALL reduce total page height by 50-60% compared to current implementation
6. THE Fund_Page SHALL use brown accent color for donation call-to-action buttons only
7. WHEN real data is unavailable for a metric, THE Fund_Page SHALL omit the metric rather than display placeholder values
8. THE Fund_Page SHALL maintain cultural authenticity in mission description and imagery

### Requirement 8: Redesign Home Page with Focused Content

**User Story:** As a new visitor, I want the Home page to explain what Uruziga is and guide me to start learning, so that I understand the platform within 5 seconds.

#### Acceptance Criteria

1. THE Home_Page SHALL display exactly five sections: Hero, Continue Learning, Cultural Highlight, Featured Lessons, Getting Started Tutorials
2. THE Home_Page SHALL place the Hero section with platform tagline and primary call-to-action as the first visible element
3. THE Home_Page SHALL show "Continue Learning" section only for authenticated users with existing progress
4. THE Home_Page SHALL display Cultural Highlight in a Card component with image, description, and "Learn More" action
5. THE Home_Page SHALL display Featured Lessons as 3-4 cards maximum in a responsive grid
6. THE Home_Page SHALL reduce total page height by 40-50% compared to current implementation
7. THE Home_Page SHALL provide 1-click access to first lesson for new users from Hero section
8. THE Home_Page SHALL remove excessive marketing copy, decorative elements, and scrolling animations

### Requirement 9: Implement Consistent Typography Hierarchy

**User Story:** As a learner, I want text to be clear and readable at all viewport sizes, so that I can understand content without eye strain.

#### Acceptance Criteria

1. THE Design_System SHALL define heading styles (H1, H2, H3) with consistent font sizes, weights, and spacing
2. THE Design_System SHALL define body text styles (paragraph, small, caption) with consistent line height and letter spacing
3. THE Design_System SHALL ensure minimum 16px base font size for body text on mobile devices
4. THE Design_System SHALL use black text color only (no grays, no colored text except brown for accent links)
5. THE Design_System SHALL define maximum line length of 65-75 characters for paragraph text for optimal readability
6. THE Design_System SHALL ensure 1.5 minimum line height for body text and 1.2 minimum for headings
7. THE Design_System SHALL use consistent font family throughout the platform (modern sans-serif for UI, preserve custom font for Umwero script)
8. THE Design_System SHALL ensure text remains readable at 320px mobile viewport without horizontal scrolling

### Requirement 10: Establish Consistent Spacing System

**User Story:** As a developer, I want a consistent spacing scale, so that layouts feel cohesive and predictable.

#### Acceptance Criteria

1. THE Design_System SHALL define a spacing scale with 8px base unit (4px, 8px, 16px, 24px, 32px, 48px, 64px)
2. THE Design_System SHALL apply consistent padding to Card components (16px mobile, 24px desktop)
3. THE Design_System SHALL apply consistent margin between sections (32px mobile, 48px desktop)
4. THE Design_System SHALL apply consistent gap in grid layouts (16px mobile, 24px desktop)
5. THE Design_System SHALL ensure touch targets are minimum 44px height on mobile for accessibility
6. THE Design_System SHALL apply consistent border radius (4px small elements, 8px cards, 12px modals)
7. THE Design_System SHALL remove excessive whitespace that contributes to page density without improving readability
8. THE Design_System SHALL ensure spacing remains proportional and consistent across all viewport sizes

### Requirement 11: Create Responsive Layout System

**User Story:** As a learner on any device, I want the platform to work flawlessly, so that I can learn on mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE Design_System SHALL define breakpoints (mobile: 320px-767px, tablet: 768px-1023px, desktop: 1024px-1440px)
2. THE Design_System SHALL render single-column layouts on mobile for all content sections
3. THE Design_System SHALL render 2-column layouts on tablet for grid-based content (lessons, characters)
4. THE Design_System SHALL render 3-4 column layouts on desktop for grid-based content
5. THE Design_System SHALL ensure PageContainer max-width of 1440px for large desktop screens
6. THE Design_System SHALL apply responsive padding (16px mobile, 24px tablet, 32px desktop) to PageContainer
7. THE Design_System SHALL ensure navigation menus collapse to hamburger menu below 768px viewport width
8. THE Design_System SHALL ensure all interactive elements remain accessible and functional at 320px viewport width

### Requirement 12: Optimize Navigation and User Pathways

**User Story:** As a learner, I want clear navigation that guides me through the learning loop, so that I always know how to continue learning.

#### Acceptance Criteria

1. THE Navigation_System SHALL display primary navigation links (Home, Learn, Practice, Dashboard) prominently
2. THE Navigation_System SHALL highlight the current page in brown accent color
3. THE Navigation_System SHALL collapse secondary links (Community, Fund, Translator) into a "More" menu on mobile
4. THE Navigation_System SHALL provide a persistent "Continue Learning" action in the navigation bar for users with active progress
5. THE Navigation_System SHALL reduce navigation chrome (borders, backgrounds, shadows) to minimal styling
6. THE Navigation_System SHALL ensure 1-click access from any page to the next recommended learning action
7. THE Navigation_System SHALL display user authentication status clearly with login/logout actions
8. THE Navigation_System SHALL render as a sticky header on desktop and collapsible header on mobile

### Requirement 13: Implement Consistent Loading and Empty States

**User Story:** As a learner, I want clear feedback when content is loading or missing, so that I understand system state at all times.

#### Acceptance Criteria

1. THE Design_System SHALL define a loading spinner component with consistent size and brown accent color
2. THE Design_System SHALL display loading states for asynchronous content with spinner and "Loading..." message
3. THE Design_System SHALL define Empty_State component with icon, descriptive message, and primary call-to-action
4. THE Design_System SHALL display Empty_State for lessons when no lessons exist with "Start Your First Lesson" action
5. THE Design_System SHALL display Empty_State for progress when no progress exists with "Begin Learning" action
6. THE Design_System SHALL display Empty_State for community posts when no posts exist with "Create First Post" action
7. THE Design_System SHALL ensure Empty_State messages are educational and encouraging (not negative or technical)
8. THE Design_System SHALL ensure all loading and empty states use the Color_Palette exclusively

### Requirement 14: Reduce Animation and Visual Distractions

**User Story:** As a learner, I want a calm interface without excessive animations, so that I can focus on learning without distraction.

#### Acceptance Criteria

1. THE Design_System SHALL use transitions only for hover states and modal open/close (200ms duration maximum)
2. THE Design_System SHALL remove scrolling animations, parallax effects, and auto-playing content
3. THE Design_System SHALL use subtle hover states for interactive elements (opacity or border color change only)
4. THE Design_System SHALL remove bouncing, sliding, or rotating animations from buttons and cards
5. THE Design_System SHALL ensure focus states are visible for keyboard navigation (2px brown outline)
6. THE Design_System SHALL remove animated backgrounds, gradient animations, and decorative movements
7. THE Design_System SHALL respect user's prefers-reduced-motion setting for accessibility
8. THE Design_System SHALL ensure the interface feels calm, professional, and educational

### Requirement 15: Establish Component Documentation

**User Story:** As a developer, I want clear documentation for each design system component, so that I can use components correctly and consistently.

#### Acceptance Criteria

1. THE Design_System SHALL document each component with description, props, variants, and usage examples
2. THE Design_System SHALL provide code examples for each component showing proper implementation
3. THE Design_System SHALL document accessibility requirements for each component (ARIA labels, keyboard navigation)
4. THE Design_System SHALL document responsive behavior for each component across breakpoints
5. THE Design_System SHALL provide visual examples of each component variant (primary button, secondary button, etc.)
6. THE Design_System SHALL document color usage rules (when to use brown accent vs. black text)
7. THE Design_System SHALL document spacing and layout guidelines for component composition
8. THE Design_System SHALL maintain documentation in a dedicated design system file or Storybook instance

### Requirement 16: Maintain Cultural Authenticity in UI

**User Story:** As a learner, I want the UI to respect Kinyarwanda and Rwandan cultural context, so that the platform feels authentic and respectful.

#### Acceptance Criteria

1. THE Design_System SHALL preserve Umwero script font rendering without modification
2. THE Design_System SHALL use culturally appropriate imagery in Cultural Highlight sections
3. THE Design_System SHALL maintain respectful language in all empty states, error messages, and instructional text
4. THE Design_System SHALL ensure brown accent color (#8b4513) reflects earth tones associated with Rwandan culture
5. THE Design_System SHALL avoid western-centric idioms or cultural references in UI text
6. THE Design_System SHALL ensure character pronunciation guides remain accurate and unmodified
7. THE Design_System SHALL maintain educational tone that respects the learning of an indigenous script
8. THE Design_System SHALL consult with cultural experts if adding new imagery or cultural content

### Requirement 17: Ensure Accessibility Compliance

**User Story:** As a learner with accessibility needs, I want the platform to be usable with keyboard navigation and screen readers, so that I can learn regardless of disability.

#### Acceptance Criteria

1. THE Design_System SHALL ensure all interactive elements are keyboard accessible (tab navigation)
2. THE Design_System SHALL provide visible focus states for all interactive elements (2px brown outline)
3. THE Design_System SHALL ensure color contrast ratios meet WCAG AA standards (4.5:1 for body text, 3:1 for large text)
4. THE Design_System SHALL provide ARIA labels for icon-only buttons and interactive elements
5. THE Design_System SHALL ensure modal dialogs trap focus and provide escape key close functionality
6. THE Design_System SHALL ensure screen readers can announce page structure (headings, landmarks, lists)
7. THE Design_System SHALL ensure form inputs have associated labels and error messages
8. THE Design_System SHALL ensure the platform works with browser zoom up to 200% without breaking layouts

### Requirement 18: Optimize Performance for Low-Bandwidth Environments

**User Story:** As a learner in Rwanda with limited bandwidth, I want pages to load quickly, so that I can learn without frustration.

#### Acceptance Criteria

1. THE Design_System SHALL use CSS for all styling instead of JavaScript-based styling libraries where possible
2. THE Design_System SHALL minimize use of large images by optimizing file sizes and using modern formats (WebP)
3. THE Design_System SHALL lazy-load images below the fold to reduce initial page load time
4. THE Design_System SHALL minimize client-side JavaScript bundle size by using only essential libraries
5. THE Design_System SHALL use system fonts or efficiently loaded web fonts (no excessive font weights)
6. THE Design_System SHALL remove unused CSS and JavaScript through tree-shaking and minification
7. THE Design_System SHALL achieve Lighthouse performance score of 80+ on mobile networks
8. THE Design_System SHALL ensure core content is visible within 2 seconds on 3G connections

### Requirement 19: Implement Consistent Error Handling UI

**User Story:** As a learner, I want clear error messages when something goes wrong, so that I understand what happened and how to proceed.

#### Acceptance Criteria

1. THE Design_System SHALL define an error message component with icon, message, and retry action
2. THE Design_System SHALL display form validation errors inline with red text and error icon
3. THE Design_System SHALL display network errors in a non-intrusive toast notification at top of page
4. THE Design_System SHALL provide actionable error messages ("Try again" or "Contact support") rather than technical errors
5. THE Design_System SHALL ensure error states do not block the user from accessing other parts of the platform
6. THE Design_System SHALL log detailed technical errors to console while displaying user-friendly messages in UI
7. THE Design_System SHALL use red accent color sparingly and only for error states (preserve brown for primary actions)
8. THE Design_System SHALL ensure error messages are culturally appropriate and respectful in tone

### Requirement 20: Create Page Density Reduction Verification

**User Story:** As a product designer, I want to verify page density reduction targets are met, so that the refinement achieves measurable improvement.

#### Acceptance Criteria

1. THE UI_Refinement SHALL reduce Practice Canvas page height by 40-50% compared to baseline measurement
2. THE UI_Refinement SHALL reduce Learner Dashboard page height by 30-40% compared to baseline measurement
3. THE UI_Refinement SHALL reduce Learn Page height by 30-40% compared to baseline measurement
4. THE UI_Refinement SHALL reduce Translator page height by 70-80% (initial view with vowels only)
5. THE UI_Refinement SHALL reduce Community Page height by 40-50% compared to baseline measurement
6. THE UI_Refinement SHALL reduce Fund Page height by 50-60% compared to baseline measurement
7. THE UI_Refinement SHALL reduce Home Page height by 40-50% compared to baseline measurement
8. THE UI_Refinement SHALL measure page density as viewport heights required to reach footer at 1920x1080 resolution and 375x667 mobile resolution
