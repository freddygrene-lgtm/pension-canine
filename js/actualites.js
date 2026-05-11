// Fonction pour convertir Markdown basique en HTML
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Parser le fichier actualites.md
function parseActualitesMD(content) {
  const actualites = [];
  
  // Découper par le séparateur ---ACTU---
  const blocks = content.split('---ACTU---');
  
  // On ignore le premier bloc (avant la première actualité)
  for (let i = 1; i < blocks.length; i += 2) {
    if (i + 1 >= blocks.length) break;
    
    const headerBlock = blocks[i].trim();
    const contentBlock = blocks[i + 1].trim();
    
    // Parser les métadonnées
    const data = {};
    const lines = headerBlock.split('\n');
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Enlever les guillemets si présents
        value = value.replace(/^["']|["']$/g, '');
        
        // Convertir les booléens
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        data[key] = value;
      }
    });
    
    // Extraire le contenu (tout ce qui est après ---ACTU--- jusqu'au prochain commentaire ou fin)
    const bodyMatch = contentBlock.match(/^([\s\S]*?)(?:<!--|$)/);
    if (bodyMatch) {
      data.body = bodyMatch[1].trim();
    }
    
    // Ajouter seulement si on a au minimum un titre
    if (data.title) {
      actualites.push(data);
    }
  }
  
  return actualites;
}

// Chargement automatique des actualités depuis actualites.md
async function loadActualites() {
  try {
    const container = document.getElementById('actualites-container');
    if (!container) return;

    // Charger le fichier actualites.md
    const response = await fetch('actualites.md');
    if (!response.ok) {
      throw new Error('Fichier actualites.md non trouvé');
    }
    
    const content = await response.text();
    const actualites = parseActualitesMD(content);
    
    if (actualites.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--gris);">Aucune actualité pour le moment.</p>';
      return;
    }
    
    // Filtrer les actualités actives et trier par date (plus récent en premier)
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
