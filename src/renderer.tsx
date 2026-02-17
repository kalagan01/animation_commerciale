import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NeoImpact - Solution d'animation commerciale et pilotage d'activité terrain" />
        <title>NeoImpact Animation Commerciale</title>
        
        {/* TailwindCSS via CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* FontAwesome Icons */}
        <link 
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" 
          rel="stylesheet" 
        />
        
        {/* Custom CSS */}
        <link href="/static/css/style.css" rel="stylesheet" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
})
