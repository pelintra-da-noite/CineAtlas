# CineAtlas

CineAtlas é um site interativo que te deixa descobrir um filme aleatório de qualquer país do mundo, clicando num globo 3D.  
Perfeito para explorar cinema mundial sem teres de passar horas a escolher.

**Live:** https://cine-atlas.com  

---

## Funcionalidades

- **Globo 3D interativo** usando [Globe.gl] e [Three.js]  
- **Randomizer de países** (botão de dado ao lado do switch de tema)  
- **Sugestões de filmes** por país via API do TMDB (através de funções serverless na Vercel)  
- **Dark / Light mode** com toggle + ícones minimalistas (lua/sol)  
- 🇵🇹🇬🇧 **Suporte a múltiplos idiomas:**  
  - Interface em **Português (pt-PT)**  
  - Interface em **Inglês (en-US)**
- **Easter eggs visuais:** neve em países como Antártida / Gronelândia  
- Link direto para pesquisa do filme no **Letterboxd**  
- Botão de **Copy** para copiar rapidamente o par “País → Filme (Ano)”

---

## Stack & Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **3D / Globo:**
  - [Three.js](https://threejs.org/)
  - [Globe.gl](https://github.com/vasturiano/globe.gl)
- **APIs & Backend:**
  - [The Movie Database (TMDB)](https://www.themoviedb.org/)  
  - Funções serverless via **Vercel** (`/api/discover`, `/api/credits`)
- **Infraestrutura & Deploy:**
  - [Vercel](https://vercel.com/)
  - Ligado a repositório **GitHub**

---

## Estrutura do Projeto

```text
/
├─ index.html           # Estrutura principal da página
├─ styles.css           # Estilos globais do site
├─ script.js            # Lógica do globo, TMDB, popup, temas, etc.
├─ /assets
│  ├─ favicon.png       # Favicon do site
│  └─ cineatlas-cover.jpg  # Imagem para partilhas (Open Graph / Twitter)
└─ /api
   ├─ discover.js       # Função serverless que chama o TMDB /discover
   └─ credits.js        # Função serverless que busca os créditos (realizador)
