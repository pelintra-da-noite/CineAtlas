# CineAtlas

CineAtlas is an interactive website that lets you discover a random film from any country in the world by clicking on a 3D globe.
Perfect for exploring world cinema without having to spend hours choosing.

**Live:** https://cine-atlas.com  

---

## Features

- **Interactive 3D Globe** using [Globe.gl] and [Three.js]
- **Country Randomizer** (dice button next to the theme switch)
- **Film Suggestions** by country via TMDB API (through serverless functions in Vercel)
- **Dark/Light Mode** with toggle + minimalist icons (moon/sun)
- **Multi-language support:**
  - **Portuguese (pt-PT)** interface
  - **English (en-US)** interface
- **Visual Easter eggs:** snow in countries like Antarctica/Greenland
- Direct link to search for the film on **Letterboxd**

---

## Stack & Technologies

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **3D / Globe:**
  - [Three.js](https://threejs.org/)
  - [Globe.gl](https://github.com/vasturiano/globe.gl)
- **APIs & Backend:**
  - [The Movie Database (TMDB)](https://www.themoviedb.org/)
  - Serverless functions via **Vercel** (`/api/discover`, `/api/credits`)
- **Infrastructure & Deployment:**
  - [Vercel](https://vercel.com/)
  - Linked to **GitHub** repository

---

## Project Structure

```text
/
├─ index.html           # Main page structure
├─ styles.css           # Global site styles
├─ script.js            # Globe logic, TMDB, popup, themes, etc.
├─ /assets
│  ├─ favicon.png       # Favicon of the site
│  └─ cineatlas-cover.jpg  # Image for sharing (Open Graph / Twitter)
└─ /api
   ├─ discover.js       # Serverless function that calls TMDB /discover
   └─ credits.js        # Serverless function that retrieves credits (director)
