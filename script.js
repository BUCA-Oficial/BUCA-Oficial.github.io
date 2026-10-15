const businesses = [
  {
    id:1,name:"La Hamburguesería",category:"Restaurante",type:"restaurante",zone:"Bucaramanga",
    rating:4.8,reviews:124,address:"Cra. 27 # 45-12, Bucaramanga",hours:"Lun - Dom · 11:00 a.m. - 10:00 p.m.",
    tags:["Comida rápida","Domicilio"],emoji:"🍔",
    image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    description:"Hamburguesas artesanales, combos y opciones para compartir. Consulta el menú y contacta directamente al negocio."
  },
  {
    id:2,name:"Café Del Alba",category:"Cafetería",type:"cafetería",zone:"Floridablanca",
    rating:4.7,reviews:98,address:"Cl. 34 # 28-10, Floridablanca",hours:"Lun - Sáb · 7:00 a.m. - 9:00 p.m.",
    tags:["Café","Desayunos"],emoji:"☕",
    image:"https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
    description:"Café, desayunos y productos de panadería en un espacio tranquilo para pasar el rato."
  },
  {
    id:3,name:"Estilo Urbano",category:"Tienda de ropa",type:"ropa",zone:"Bucaramanga",
    rating:4.6,reviews:67,address:"Cra. 33 # 48-27, Bucaramanga",hours:"Lun - Sáb · 9:00 a.m. - 7:00 p.m.",
    tags:["Ropa","Accesorios"],emoji:"👕",
    image:"https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80",
    description:"Moda urbana, prendas y accesorios para diferentes estilos y edades."
  },
  {
    id:4,name:"Dulce Tentación",category:"Pastelería",type:"pastelería",zone:"Bucaramanga",
    rating:4.9,reviews:87,address:"Cl. 42 # 27-15, Bucaramanga",hours:"Lun - Dom · 8:00 a.m. - 9:00 p.m.",
    tags:["Postres","Panadería"],emoji:"🥐",
    image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    description:"Postres, tortas y productos de panadería para cualquier ocasión."
  },
  {
    id:5,name:"Artesanías Santander",category:"Artesanías",type:"artesanía",zone:"Girón",
    rating:4.8,reviews:51,address:"Carrera 26 # 30-18, Girón",hours:"Lun - Dom · 10:00 a.m. - 7:00 p.m.",
    tags:["Hecho a mano","Regalos"],emoji:"🎨",
    image:"https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
    description:"Productos artesanales y detalles hechos por emprendedores locales."
  },
  {
    id:6,name:"Tapicería El Profe",category:"Tapicería",type:"tapicería",zone:"Piedecuesta",
    rating:4.7,reviews:43,address:"Cl. 9 # 12-30, Piedecuesta",hours:"Lun - Vie · 8:00 a.m. - 6:00 p.m.",
    tags:["Muebles","Restauración"],emoji:"🛋️",
    image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    description:"Tapizado, restauración y reparación de muebles para hogar y negocio."
  }
];

const categories = [
  ["🍴","Restaurantes","restaurante"],
  ["☕","Cafeterías","cafetería"],
  ["🛍️","Tiendas y Comercio","ropa"],
  ["🔧","Servicios","servicio"],
  ["👕","Moda y Accesorios","ropa"],
  ["🛋️","Hogar y Decoración","tapicería"],
  ["🎨","Artesanías","artesanía"],
  ["🚗","Mecánica Automotriz","mecánica"]
];

const businessGrid = document.getElementById("businessGrid");
const trendingGrid = document.getElementById("trendingGrid");
const categoryGrid = document.getElementById("categoryGrid");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const zoneFilter = document.getElementById("zoneFilter");
const sortFilter = document.getElementById("sortFilter");

function loadFavorites(){
  try{
    const saved = JSON.parse(localStorage.getItem("bucaFavorites") || "[]");
    return new Set(Array.isArray(saved) ? saved.map(Number).filter(Number.isFinite) : []);
  }catch{
    return new Set();
  }
}

function loadSession(){
  try{
    const saved = JSON.parse(localStorage.getItem("bucaSession") || "null");
    return saved && typeof saved.name === "string" && typeof saved.email === "string" ? saved : null;
  }catch{
    return null;
  }
}

function loadHistory(){
  try{
    const saved = JSON.parse(localStorage.getItem("bucaHistory") || "[]");
    return Array.isArray(saved) ? saved.map(Number).filter(Number.isFinite) : [];
  }catch{
    return [];
  }
}

let favorites = loadFavorites();
let currentUser = loadSession();
let profileTab = "favorites";
let pendingAuthAction = null;

function normalizeText(value){
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderProfile(){
  if(!currentUser) return;
  const profileGrid = document.getElementById("profileGrid");
  const items = profileTab === "favorites"
    ? businesses.filter(b=>favorites.has(b.id))
    : loadHistory().map(id=>businesses.find(b=>b.id===id)).filter(Boolean);
  const emptyMessage = profileTab === "favorites"
    ? "Aún no tienes favoritos. Guarda un negocio con el botón de corazón."
    : "Tu historial aparecerá aquí cuando consultes negocios.";

  profileGrid.innerHTML = items.length
    ? items.map(businessCard).join("")
    : `<p class="empty-state">${emptyMessage}</p>`;
  document.querySelectorAll("[data-profile-tab]").forEach(button=>{
    const selected = button.dataset.profileTab === profileTab;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  observeReveals();
}

function updateAccountUi(){
  const profileSection = document.getElementById("perfil");
  const profileLink = document.getElementById("profileLink");
  document.getElementById("loginBtn").textContent = currentUser ? "Mi perfil" : "Acceder";
  profileLink.hidden = !currentUser;
  if(!currentUser) profileSection.hidden = true;
  if(currentUser){
    document.getElementById("profileName").textContent = currentUser.name;
    document.getElementById("profileEmail").textContent = currentUser.email;
    renderProfile();
  }
}

function showProfile(tab=profileTab){
  if(!currentUser) return;
  profileTab = tab === "history" ? "history" : "favorites";
  document.getElementById("perfil").hidden = false;
  document.querySelectorAll(".nav-links a").forEach(link=>link.classList.remove("active"));
  document.getElementById("profileLink").classList.add("active");
  renderProfile();
  document.getElementById("perfil").scrollIntoView({behavior:"smooth",block:"start"});
}

function setAuthMode(mode){
  const registering = mode === "register";
  document.getElementById("loginForm").hidden = registering;
  document.getElementById("accountForm").hidden = !registering;
  document.getElementById("authTitle").textContent = registering ? "Crea tu cuenta" : "Inicia sesión";
  document.querySelectorAll("[data-auth-mode]").forEach(button=>{
    const selected = button.dataset.authMode === mode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}

function openAuthModal(trigger, action=null){
  pendingAuthAction = action;
  setAuthMode("login");
  openModal("authModal", trigger);
}

function completeSignIn(name, email){
  currentUser = {name: name || email.split("@")[0], email};
  try{localStorage.setItem("bucaSession", JSON.stringify(currentUser))}catch{}
  updateAccountUi();
  const action = pendingAuthAction;
  pendingAuthAction = null;
  closeModal("authModal");
  if(action === "favorites") showProfile("favorites");
  else toast("Sesión de demostración iniciada.");
}

function recordHistory(id){
  const history = [id, ...loadHistory().filter(previousId=>previousId!==id)].slice(0,20);
  try{localStorage.setItem("bucaHistory", JSON.stringify(history))}catch{}
  if(currentUser && profileTab === "history" && !document.getElementById("perfil").hidden) renderProfile();
}

function renderCategories(){
  categoryGrid.innerHTML = categories.map(c => `
    <button class="category-card" data-type="${c[2]}">
      <span class="category-icon">${c[0]}</span>
      <strong>${c[1]}</strong>
      <small>${businesses.filter(b=>b.type===c[2]).length || "Sin"} ${businesses.filter(b=>b.type===c[2]).length === 1 ? "negocio" : businesses.filter(b=>b.type===c[2]).length ? "negocios" : "ejemplos"} de muestra</small>
    </button>
  `).join("");

  [...new Set(businesses.map(b=>b.category))].forEach(category=>{
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function businessCard(b){
  const fav = favorites.has(b.id);
  return `
    <article class="business-card reveal">
      <div class="card-image" role="img" aria-label="Imagen de ${b.name}" style="background-image:url('${b.image}')">
        <button class="favorite ${fav ? "active":""}" data-fav="${b.id}" aria-label="${fav ? "Quitar de" : "Guardar en"} favoritos: ${b.name}" aria-pressed="${fav}">${fav ? "♥":"♡"}</button>
      </div>
      <div class="card-body">
        <div class="card-title">
          <div class="logo-mini">${b.emoji}</div>
          <div>
            <h3>${b.name}</h3>
            <div class="card-category">${b.category}</div>
          </div>
        </div>
        <div class="rating"><span>★</span> ${b.rating} <small>(${b.reviews} reseñas)</small></div>
        <div class="tags">${b.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        <div class="card-info">⌖ ${b.address}<br>◷ ${b.hours}</div>
        <div class="card-actions">
          <button class="view-btn" data-view="${b.id}">Ver más</button>
          <button class="contact-btn" data-contact="${b.name}">◉ Contactar</button>
        </div>
      </div>
    </article>
  `;
}

function render(list = businesses){
  businessGrid.innerHTML = list.length
    ? list.slice(0,6).map(businessCard).join("")
    : `<p class="empty-state">No encontramos negocios con esos criterios. Prueba con otra búsqueda o zona.</p>`;
  const trend = [...businesses].sort((a,b)=>b.rating-a.rating).slice(0,3);
  trendingGrid.innerHTML = trend.map(businessCard).join("");
  resultCount.textContent = `${list.length} ${list.length === 1 ? "negocio encontrado" : "negocios encontrados"}`;
  businessGrid.setAttribute("aria-live", "polite");
  if(document.getElementById("perfil").hidden) document.querySelector('.nav-links a[href="#inicio"]').classList.add("active");
  observeReveals();
}

function getFilteredBusinesses(){
  const term = normalizeText(searchInput.value.trim());
  const category = categoryFilter.value;
  const zone = zoneFilter.value;
  const sort = sortFilter.value;

  let filtered = businesses.filter(b=>{
    const searchable = normalizeText(`${b.name} ${b.category} ${b.type} ${b.tags.join(" ")} ${b.description} ${b.zone} ${b.address}`);
    const matchTerm = !term || searchable.includes(term);
    const matchCategory = category === "all" || normalizeText(b.category) === normalizeText(category);
    const matchZone = zone === "all" || b.zone === zone;
    return matchTerm && matchCategory && matchZone;
  });

  if(sort === "rating") filtered.sort((a,b)=>b.rating-a.rating);
  if(sort === "name") filtered.sort((a,b)=>a.name.localeCompare(b.name));

  return filtered;
}

function applyFilters({scroll=true}={}){
  render(getFilteredBusinesses());
  if(scroll) document.getElementById("negocios").scrollIntoView({behavior:"smooth",block:"start"});
}

function saveFavorites(){
  try{
    localStorage.setItem("bucaFavorites", JSON.stringify([...favorites]));
  }catch{
    toast("No se pudieron guardar los favoritos en este navegador.");
  }
}

document.addEventListener("click", e=>{
  const favBtn = e.target.closest("[data-fav]");
  if(favBtn){
    if(!currentUser){
      openAuthModal(favBtn, "favorites");
      return;
    }
    const id = Number(favBtn.dataset.fav);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    saveFavorites();
    render(getFilteredBusinesses());
    if(!document.getElementById("perfil").hidden) renderProfile();
    toast(favorites.has(id) ? "Guardado en favoritos ❤️" : "Quitado de favoritos");
  }

  const viewBtn = e.target.closest("[data-view]");
  if(viewBtn){
    const b = businesses.find(x=>x.id === Number(viewBtn.dataset.view));
    recordHistory(b.id);
    openBusiness(b);
  }

  const contact = e.target.closest("[data-contact]");
  if(contact){
    toast(`Aún no hay un teléfono de contacto para ${contact.dataset.contact}.`);
  }

  const quick = e.target.closest("[data-search]");
  if(quick){
    searchInput.value = quick.dataset.search;
    applyFilters();
  }

  const cat = e.target.closest(".category-card");
  if(cat){
    const type = cat.dataset.type;
    searchInput.value = type;
    categoryFilter.value = "all";
    applyFilters();
  }

  if(e.target.closest("#favoritesLink")){
    e.preventDefault();
    if(!currentUser){
      openAuthModal(e.target.closest("#favoritesLink"), "favorites");
    }else{
      showProfile("favorites");
    }
    document.querySelector(".nav-links").classList.remove("open");
    document.getElementById("menuBtn").setAttribute("aria-expanded", "false");
    document.getElementById("menuBtn").setAttribute("aria-label", "Abrir menú");
  }

  const profileTabButton = e.target.closest("[data-profile-tab]");
  if(profileTabButton) showProfile(profileTabButton.dataset.profileTab);

  const authModeButton = e.target.closest("[data-auth-mode]");
  if(authModeButton) setAuthMode(authModeButton.dataset.authMode);

  if(e.target.closest("#profileLink")){
    e.preventDefault();
    showProfile(profileTab);
  }

  if(e.target.closest("#locationBtn, #searchLocationBtn")){
    zoneFilter.focus();
    zoneFilter.scrollIntoView({behavior:"smooth",block:"center"});
    document.getElementById("negocios").scrollIntoView({behavior:"smooth",block:"start"});
  }

  if(e.target.closest("#notificationBtn")){
    toast("No tienes notificaciones nuevas.");
  }

  if(e.target.closest("[data-close]")){
    closeModal(e.target.closest("[data-close]").dataset.close);
  }

  if(e.target.classList.contains("modal-backdrop")){
    closeModal(e.target.parentElement.id);
  }

  if(e.target.closest(".nav-links a") && !e.target.closest("#favoritesLink")){
    document.querySelector(".nav-links").classList.remove("open");
    document.getElementById("menuBtn").setAttribute("aria-expanded", "false");
    document.getElementById("menuBtn").setAttribute("aria-label", "Abrir menú");
  }
});

document.getElementById("searchBtn").addEventListener("click", applyFilters);
searchInput.addEventListener("keydown", e=>{ if(e.key==="Enter") applyFilters(); });
document.getElementById("applyFilters").addEventListener("click", applyFilters);

document.getElementById("registerBtn").addEventListener("click", e=>openModal("registerModal", e.currentTarget));
document.getElementById("ctaRegister").addEventListener("click", e=>openModal("registerModal", e.currentTarget));
document.getElementById("loginBtn").addEventListener("click", e=>{
  if(currentUser) showProfile("favorites");
  else openAuthModal(e.currentTarget);
});

document.getElementById("loginForm").addEventListener("submit", e=>{
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const email = String(formData.get("email")).trim().toLowerCase();
  completeSignIn(email.split("@")[0], email);
  e.currentTarget.reset();
});

document.getElementById("accountForm").addEventListener("submit", e=>{
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim().toLowerCase();
  completeSignIn(name, email);
  e.currentTarget.reset();
});

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  currentUser = null;
  try{localStorage.removeItem("bucaSession")}catch{}
  document.getElementById("perfil").hidden = true;
  document.getElementById("profileLink").hidden = true;
  document.getElementById("loginBtn").textContent = "Acceder";
  document.querySelectorAll(".nav-links a").forEach(link=>link.classList.remove("active"));
  document.querySelector('.nav-links a[href="#inicio"]').classList.add("active");
  toast("Has cerrado sesión.");
  document.getElementById("inicio").scrollIntoView({behavior:"smooth",block:"start"});
});

document.getElementById("registerForm").addEventListener("submit", e=>{
  e.preventDefault();
  closeModal("registerModal");
  e.target.reset();
  toast("Demostración: la solicitud no se envió a un servidor.");
});

document.getElementById("menuBtn").addEventListener("click", e=>{
  const isOpen = document.querySelector(".nav-links").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", String(isOpen));
  e.currentTarget.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

let activeModal = null;
let modalTrigger = null;

function openModal(id, trigger=document.activeElement){
  activeModal = document.getElementById(id);
  modalTrigger = trigger;
  activeModal.classList.add("open");
  activeModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  activeModal.querySelector(".close-btn").focus();
}

function closeModal(id){
  const modal = document.getElementById(id);
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  activeModal = null;
  if(id === "authModal") pendingAuthAction = null;
  document.body.style.overflow = "";
  if(modalTrigger?.isConnected) modalTrigger.focus();
}

document.addEventListener("keydown", e=>{
  if(!activeModal) return;
  if(e.key === "Escape"){
    closeModal(activeModal.id);
    return;
  }
  if(e.key !== "Tab") return;

  const focusable = [...activeModal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if(e.shiftKey && document.activeElement === first){
    e.preventDefault();
    last.focus();
  }else if(!e.shiftKey && document.activeElement === last){
    e.preventDefault();
    first.focus();
  }
});

function openBusiness(b){
  document.getElementById("modalContent").innerHTML = `
    <div class="detail-cover" role="img" aria-label="Imagen de ${b.name}" style="background-image:url('${b.image}')"></div>
    <div class="detail-head">
      <div class="logo-mini">${b.emoji}</div>
      <div>
        <h2 id="businessModalTitle">${b.name}</h2>
        <div class="card-category">${b.category} · ${b.zone}</div>
      </div>
    </div>
    <div class="rating"><span>★</span> ${b.rating} · ${b.reviews} reseñas</div>
    <p style="line-height:1.7;color:#52657a;font-size:13px">${b.description}</p>
    <div class="detail-actions">
      <button class="primary-btn" onclick="toast('Este negocio aún no tiene un teléfono de contacto cargado.')">WhatsApp</button>
      <a class="outline-btn map-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
    </div>
    <div class="detail-list">
      <div class="detail-item"><strong>📍 Dirección</strong>${b.address}</div>
      <div class="detail-item"><strong>🕐 Horario</strong>${b.hours}</div>
      <div class="detail-item"><strong>🏷️ Categoría</strong>${b.category}</div>
      <div class="detail-item"><strong>📱 Contacto</strong>Disponible próximamente</div>
    </div>
  `;
  openModal("businessModal");
}

function toast(message){
  const el=document.getElementById("toast");
  el.textContent=message;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}

function observeReveals(){
  if(!("IntersectionObserver" in window)){
    document.querySelectorAll(".reveal").forEach(item=>item.classList.add("visible"));
    return;
  }
  const items=document.querySelectorAll(".reveal:not(.visible)");
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.08});
  items.forEach(i=>observer.observe(i));
}

renderCategories();
updateAccountUi();
render();
observeReveals();
