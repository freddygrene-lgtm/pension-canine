// Fonction pour convertir Markdown basique en HTML
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Parser le front matter YAML des fichiers .md
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) return null;
  
  const frontMatter = match[1];
  const body = match[2];
  
  const data = {};
  const lines = frontMatter.split('\n');
  
  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Enlever les guillemets
      value = value.replace(/^["']|["']$/g, '');
      
      // Convertir les booléens
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      data[key] = value;
    }
  });
  
  data.body = body.trim();
  return data;
}

// Liste des fichiers markdown à charger
// IMPORTANT : Vous devez mettre à jour cette liste quand vous ajoutez des actualités
const actuFiles = [
  'actualites/2026-05-11-encore-quelques-places-disponible-cet-été.md',
];

// Chargement automatique des actualités depuis les fichiers .md
async function loadActualites() {
  try {
    const container = document.getElementById('actualites-container');
    if (!container) return;

    // Charger tous les fichiers markdown
    const promises = actuFiles.map(file => 
      fetch(file)
        .then(response => {
          if (!response.ok) throw new Error(`Fichier ${file} non trouvé`);
          return response.text();
        })
        .then(content => parseFrontMatter(content))
        .catch(error => {
          console.error(`Erreur chargement ${file}:`, error);
          return null;
        })
    );

    const actualites = (await Promise.all(promises)).filter(a => a !== null);
    
    if (actualites.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--gris);">Aucune actualité pour le moment.</p>';
      return;
    }
    
    // Filtrer les actualités actives et trier par date
    const actives = actualites
      .filter(a => a.active === true)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (actives.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--gris);">Aucune actualité pour le moment.</p>';
      return;
    }
    
    // Générer le HTML pour chaque actualité
    container.innerHTML = actives.map(actu => `
      <div style="background:white;border-radius:var(--radius);padding:28px;box-shadow:var(--shadow);border-left:5px solid ${actu.color}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span style="font-size:2rem">${actu.icon}</span>
          <h3 style="font-family:'Playfair Display',serif;font-size:1.4rem;color:${actu.color};margin:0">${actu.title}</h3>
        </div>
        <div style="color:var(--gris);font-size:0.95rem;line-height:1.7">
          <p>${markdownToHtml(actu.body)}</p>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erreur chargement actualités:', error);
    const container = document.getElementById('actualites-container');
    if (container) {
      container.innerHTML = '<p style="text-align:center;color:var(--gris);">Erreur de chargement des actualités.</p>';
    }
  }
}

// Charger les actualités au chargement de la page
document.addEventListener('DOMContentLoaded', loadActualites);
