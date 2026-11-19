# Guia de Interfaces Financeiras

Guia metodológico, em formato de website, para o desenvolvimento de interfaces financeiras acessíveis ao público idoso e resistentes à engenharia social.

Trabalho de Conclusão de Curso — Bacharelado em Sistemas de Informação, IFSULDEMINAS Campus Machado, 2026.
Autores: Leonardo Brandão e Endrio Emanuel Ferreira Soares. Orientação: Prof.ª Dr.ª Daniela Augusta Guimarães Dias.

## Estrutura

```
index.html            página do guia (todo o conteúdo é HTML estático)
404.html              página de erro
assets/css/styles.css estilos
assets/js/boot.js     aplica o tamanho de texto salvo antes da renderização
assets/js/app.js      interações: menu, filtro de diretrizes, antes/depois, checklist, busca
assets/img/           ícones do app e imagem de compartilhamento (og-image.png)
favicon.svg / .ico    ícone da aba
site.webmanifest      manifesto (ícones, cores)
robots.txt / sitemap.xml
vercel.json           redirecionamento do endereço antigo e cabeçalhos de segurança
```

Sem framework e sem etapa de build: HTML5, CSS3 e JavaScript puro. A única dependência externa são as fontes do Google Fonts.

## Rodar localmente

Os caminhos são absolutos (`/assets/...`), então abra por um servidor, não com duplo clique:

```
python -m http.server 8000
```

e acesse http://localhost:8000.

## Publicar na Vercel

1. Importe este repositório em vercel.com → **Add New → Project**.
2. Em *Framework Preset* escolha **Other**; deixe *Build Command* e *Output Directory* vazios.
3. Publique.

Depois de saber o domínio final, troque `https://guia-interfaces-financeiras.vercel.app` pelo endereço real em `index.html` (canonical, `og:url`, `og:image`, `twitter:image` e JSON-LD), `robots.txt` e `sitemap.xml`.
