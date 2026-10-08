
document.documentElement.classList.add('js');
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:.14, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el,i){
      el.style.transitionDelay=(Math.min(i%4,4)*60)+'ms';
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});
  }

  // Flip cards (touch, click + keyboard)
  document.querySelectorAll('.card').forEach(function(card){
    function toggle(){
      var flipped=card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    }
    card.addEventListener('click', function(e){
      // Les liens du verso restent utilisables sans retourner la carte.
      if(e.target.closest('a')) return;
      toggle();
    });
    card.addEventListener('keydown', function(e){
      if(e.target.closest('a')) return;
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
    });
    card.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(e){ e.stopPropagation(); });
    });
  });

  // Mobile menu
  var mb=document.getElementById('menuBtn'), mnav=document.getElementById('mobileMenu');
  function setMenu(open){
    mb.setAttribute('aria-expanded', String(open));
    mnav.classList.toggle('open', open);
    mb.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  }
  if(mb && mnav){
    mb.addEventListener('click', function(e){ e.stopPropagation(); setMenu(mb.getAttribute('aria-expanded')!=='true'); });
    mnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') setMenu(false); });
    document.addEventListener('click', function(e){
      if(mnav.classList.contains('open') && !mnav.contains(e.target) && !mb.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function(){ if(window.innerWidth>960) setMenu(false); });
  }

  // Accordion "Oui mais"
  document.querySelectorAll('.obj-q').forEach(function(btn){
    var panel=document.getElementById(btn.getAttribute('aria-controls'));
    var obj=btn.closest('.obj');
    btn.addEventListener('click', function(){
      var open=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded', String(!open));
      obj.setAttribute('data-open', String(!open));
      panel.style.maxHeight = open ? '0px' : (panel.scrollHeight+'px');
    });
  });
  window.addEventListener('resize', function(){
    document.querySelectorAll('.obj[data-open="true"] .obj-a').forEach(function(p){
      p.style.maxHeight=p.scrollHeight+'px';
    });
  });
})();
