const fs = require('fs');
const path = require('path');

const express = require('express');
const axios = require('axios');
// Importa la lógica de scraping que ya tienes.
// Asegúrate de que la ruta al archivo sea correcta.
const { scrapeWebexStatusLogic } = require('./scrapeWebexStatusLogic'); // <-- CAMBIA ESTO SI TU ARCHIVO SE LLAMA DIFERENTE

const app = express();
// Render te asignará un puerto, o usaremos el 3000 para pruebas locales.
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    const data = await scrapeWebexStatusLogic();

    const jsonData = {
      updatedAt: new Date().toISOString(),
      data
    };

    const outputPath = path.join(__dirname, 'docs', 'webexStatus.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    const historyPath = path.join(__dirname, 'docs', 'webexHistory.json');

    let history = [];
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch (err) {
      console.log('No existing history, creating new one.');
    }

    // Agregar entrada de hora actual (en UTC)
    history.push({
      timestamp: new Date().toISOString()
    });

    // Mantener solo los últimos 100 registros
    history = history.slice(-100);

    // Guardar historial
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
    

    console.log('✅ JSON generado y guardado en docs/webexStatus.json');
  } catch (err) {
    console.error('❌ Error en scraping:', err);
    process.exit(1);
  }
})();
