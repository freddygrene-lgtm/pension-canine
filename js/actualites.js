// Chargement automatique des actualités depuis les fichiers markdown
async function loadActualites() {
  try {
    // Cette fonction sera appelée au chargement de la page
    const response = await fetch('/actualites.json');
    if (!response.ok) {
      console.log('Pas encore d\'actualités');
      return;
    }
    
    const actualites = await response.json();
    const container = document.getElementById('actualites-container');
    
    if (!container) return;
    
    // Filtrer les actualités actives et les trier par date
    const actives = actualites
      .filter(a => a.active)
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
          ${actu.body}
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erreur chargement actualités:', error);
  }
}

// Charger les actualités au chargement de la page
document.addEventListener('DOMContentLoaded', loadActualites);