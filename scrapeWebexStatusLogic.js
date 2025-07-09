const puppeteer = require('puppeteer');
const cheerio = require('cheerio'); // Importa Cheerio

async function scrapeWebexStatusLogic() {
    const url = 'https://status.webex.com/commercial/status';
    let browser;

    // Objeto para almacenar toda la información que se exportará como JSON
    const scrapedData = {
        openIncidents: [],
        services: [],
        timestamp: new Date().toISOString() // Añade una marca de tiempo de cuándo se hizo el scraping
    };

    try {
        console.error('[INFO] scrapedData.timestamp:'+scrapedData.timestamp);
        // Inicia una nueva instancia de Chromium (headless significa sin interfaz visual)
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        });
        const page = await browser.newPage();

        // Configura un User-Agent para simular un navegador real
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navega a la URL y espera a que la red esté inactiva (indicando que el contenido dinámico ha cargado)
        console.error(`[INFO] Navegando a ${url}...`); // Usamos console.error para logs que no son el JSON final
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        // Acepta las cookies si aparece el banner
        /*try {
            const acceptButton = await page.$('#onetrust-accept-btn-handler'); // Selector del botón de aceptar cookies
            if (acceptButton) {
                console.error('[INFO] Aceptando cookies...');
                await acceptButton.click();
                await page.waitForTimeout(1000); // Pequeña espera para que desaparezca el banner
            }
        } catch (cookieError) {
            console.error('[INFO] No se encontró el banner de cookies o ya fue aceptado.');
        }*/

        // Obtener el HTML completo de la página después de que se haya cargado dinámicamente
        const fullHTML = await page.content();
        console.error('[INFO] cargado HTML');
        // Cargar el HTML en Cheerio para un fácil análisis
        const $ = cheerio.load(fullHTML);
        console.error('[INFO] cargado HTML en cheerio');

        const categories = [];
        const openIncidents = [];
        const services = [];
        
        let openIncident = $('.collapse-title-wrap.bg-incident .collapse-title').text().trim();

        openIncidents.push({
            desc: openIncident
        });

        console.error('[INFO] openIncident: '+openIncident);

        // Coloco la primeraa categoría
        // Categorías principales
        $('.component-row .parent-component').each((i, element) => {
            const serviceName = $(element).find('.component-name').text().trim();
            const serviceStatus = $(element).find('.parent-component-status .component-span').text().trim();
            const statusClasses = $(element).find('.parent-component-status .component-span').attr('class').split(' ');
            const statusClass = statusClasses[1];
            
            const nivel = 1;

            if (serviceName && serviceStatus) { // Asegurarse de que se extrajo información
                categories.push({
                    name: serviceName,
                    status: serviceStatus,
                    nivel: nivel,
                    statusClass : statusClass
                });
                console.error('[INFO] serviceName: '+serviceName);
                console.error('[INFO] serviceStatus: '+serviceStatus);

            }
        });
        console.error(' -------- ');
        //services.push(categories[0]);

        /*$('.sub_service_item').each((i, element) => {
            const serviceName = $(element).find('.sub_service_item_status_name').text().trim();
            let clasesIcon = $(element).find('.sub_service_item_status_icon').attr('class').split(' ');
            const serviceStatus = $(element).find('.sub_service_item_status_category').text().trim();
            const nivel = 2;
            const statusIcon = clasesIcon[0];

            if (serviceName && serviceStatus) { // Asegurarse de que se extrajo información
                services.push({
                    name: serviceName,
                    status: serviceStatus,
                    nivel: nivel,
                    statusIcon : statusIcon
                });
                console.error('[INFO] serviceName: '+serviceName);
                console.error('[INFO] serviceStatus: '+serviceStatus);
            }
        });*/
        // Coloco la primera categoría
        //services.push(categories[1]);

        scrapedData.openIncidents = openIncidents;
        scrapedData.services = categories;
        //scrapedData.services = services;
        

    } catch (error) {
        console.error("[ERROR] Error durante el scraping:", error);
    } finally {
        console.error(' ---------- ');
        
        if (browser) {
            await browser.close(); // Asegúrate de cerrar el navegador
            console.error('[INFO] cerrar nav ');
        }
    }
    // Imprime el objeto JSON final a la salida estándar (con 2 espacios de indentación para legibilidad)
    //console.log(JSON.stringify(scrapedData, null, 2));
    return scrapedData;
}

//scrapeWebexStatusLogic();
module.exports = { scrapeWebexStatusLogic }; // Exporta la función para usarla en server.js
