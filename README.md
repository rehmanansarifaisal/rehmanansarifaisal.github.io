# Qalb e Mast website

Responsive, multi-page static website for Qalb e Mast.

## Open locally
Open `index.html` in a browser. No build step or package installation is required. The pages are static HTML/CSS/JavaScript. Internet access is used for YouTube thumbnail images and opening YouTube/social links.

## Videos
`pages/videos.html` contains all 18 records supplied in `Individual_Video_JSON.zip`, including exact title, publish date, video URL, duration and thumbnail URL. `assets/data/videos.json` keeps the normalized source metadata for future edits. Cards link directly to each supplied YouTube watch URL. One source record (`Nad-e-Ali a.s Female Version`) is marked private in the supplied metadata, so public playback may not be available for it.

## Branding and contact
The supplied Qalb e Mast emblem is used in the header, home hero, footer and favicon set. Social links: YouTube, Facebook, Instagram and TikTok. Contact email: qalbemast@gmail.com. WhatsApp: +92 323 2926011.

## Design notes
The layout uses responsive breakpoints for mobile, tablet and desktop, simplified navigation, minimal charcoal/ivory/gold styling, readable type, touch-friendly controls, and reduced-motion support. It does not load the previous GSAP or Three.js effects.
