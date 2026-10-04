import localtunnel from 'localtunnel';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({
      port: 5173,
      local_host: '127.0.0.1',
      subdomain: 'taller3d-sims',
    });
    console.log(`\n========================================`);
    console.log(`TUNEL PUBLICO ACTIVO Y ESTABLE:`);
    console.log(`URL: ${tunnel.url}`);
    console.log(`========================================\n`);

    tunnel.on('close', () => {
      console.log('El túnel se cerró. Reconectando en 3 segundos...');
      setTimeout(startTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Error en el túnel:', err);
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('Fallo al abrir túnel, reintentando con subdominio aleatorio...');
    try {
      const fallbackTunnel = await localtunnel({
        port: 5173,
        local_host: '127.0.0.1',
      });
      console.log(`\n========================================`);
      console.log(`TUNEL FALLBACK ACTIVO:`);
      console.log(`URL: ${fallbackTunnel.url}`);
      console.log(`========================================\n`);

      fallbackTunnel.on('close', () => {
        setTimeout(startTunnel, 3000);
      });
    } catch (e) {
      console.error(e);
      setTimeout(startTunnel, 5000);
    }
  }
}

startTunnel();
