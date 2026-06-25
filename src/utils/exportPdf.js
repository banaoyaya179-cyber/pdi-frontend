/**
 * Export PDF via window.print() avec styles dédiés
 * Fonctionne sans dépendances externes
 */
export const exporterRapportPDF = (titre, contenuId) => {
  const style = document.createElement('style');
  style.id = 'print-style';
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      #${contenuId}, #${contenuId} * { visibility: visible; }
      #${contenuId} {
        position: absolute;
        left: 0; top: 0;
        width: 100%;
        font-family: Arial, sans-serif;
        font-size: 12px;
      }
      .no-print { display: none !important; }
      .card { border: 1px solid #ddd !important; margin-bottom: 16px; }
      .badge { border: 1px solid #999; padding: 2px 6px; border-radius: 4px; }
      @page {
        size: A4;
        margin: 15mm;
      }
    }
  `;
  document.head.appendChild(style);

  const originalTitle = document.title;
  document.title = titre;

  window.print();

  document.title = originalTitle;
  const el = document.getElementById('print-style');
  if (el) el.remove();
};
