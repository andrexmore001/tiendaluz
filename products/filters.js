// Toggle para mostrar/ocultar filtros en móvil
document.addEventListener('DOMContentLoaded', function() {
    const filtrosToggle = document.querySelector('.filtros-toggle');
    const asideFiltros = document.querySelector('aside.filtros');
    const overlay = document.createElement('div');
    overlay.className = 'filtros-overlay';
    document.body.appendChild(overlay);
    
  const contenedorPrincipal = document.querySelector('.contenedor-principal');
  const botonExpandir = document.createElement('button');
  
  // Crear botón para expandir filtros
  botonExpandir.className = 'boton-expandir-filtros';
  botonExpandir.innerHTML = '<i class="fas fa-sliders-h"></i>';
  asideFiltros.insertAdjacentElement('afterend', botonExpandir);
  
  // Botón cerrar en desktop
  const cerrarDesktop = document.querySelector('.cerrar-filtros-desktop');
  
  // Toggle para colapsar/expandir en desktop
  cerrarDesktop?.addEventListener('click', function() {
    asideFiltros.classList.toggle('colapsado');
    contenedorPrincipal.classList.toggle('filtros-colapsados');
  });
  
  // Botón para expandir cuando está colapsado
  botonExpandir.addEventListener('click', function() {
    asideFiltros.classList.remove('colapsado');
    contenedorPrincipal.classList.remove('filtros-colapsados');
  });
  
  // Resto del código para móvil (se mantiene igual)
  overlay.className = 'filtros-overlay';
  document.body.appendChild(overlay);
   
    // Eventos para mostrar/ocultar
    filtrosToggle?.addEventListener('click', function() {
        asideFiltros.classList.add('visible');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    });
    
    overlay.addEventListener('click', function() {
        asideFiltros.classList.remove('visible');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    });
    
    cerrarBtn.addEventListener('click', function() {
        asideFiltros.classList.remove('visible');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    });
    
    // Cerrar al hacer clic en un enlace (opcional)
    asideFiltros.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            asideFiltros.classList.remove('visible');
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        });
    });
});