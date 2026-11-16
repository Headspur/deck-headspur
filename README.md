# Headspur HTML / CSS

Open index.html in a browser. No build step or framework is required.

The page follows [Deck Web (198:341)](https://www.figma.com/design/hVEhCqzLfeqtqSklJKsueH/Headspur-Website---2026-Deck?node-id=198-341), including the Celio hero, statistics, client grid, Growth services, Premium Work, Deliverables & Cadence, Ways of Working, Success Stories, and contact footer.

Stylesheets live in assests/css/, JavaScript in assests/js/, and local artwork in assests/images/deck-artwork/. Google Sans Flex loads from Google Fonts with Arial as a fallback. Figma asset download URLs are not used at runtime.

Report rows start closed and neutral. Ways of Working follows the reference site: Communication starts open, and selecting a different practice displays its description inside the pill while closing the previous one. Weekly is selected and highlighted by default, with its report content shown initially. The hero starts with Celio from the current frame and rotates through Neopalms and KapKids. The carousel advances every three seconds, pauses while hovered or focused, and respects reduced motion. Arrows appear only on hover; keyboard navigation and swipe remain supported. The Pause control is hidden. Premium Work glows appear only on hover.

Vanilla JavaScript powers the mobile menu, reporting tabs, accordions, and enquiry dialog. The footer form opens an email draft. The service enquiry form retains its existing Mailchimp integration.

Premium Work descriptions and outcome labels follow https://bejewelled-liger-35c5e1.netlify.app/.
