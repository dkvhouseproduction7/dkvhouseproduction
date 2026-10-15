(() => {
  const $ = id => document.getElementById(id);
  const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = {
    PKK:{title:'PKK',full:'Projek Kreatif & Kewirausahaan',number:'01 / PKK',description:'Dokumentasi proyek, praktik, ide usaha, dan proses kewirausahaan siswa DKV.',intro:'Ruang khusus untuk proses, kolaborasi, dan hasil proyek PKK.'},
    FDVD:{title:'FDVD',full:'Fotografi & Videografi',number:'02 / FDVD',description:'Cerita dalam visual melalui fotografi, videografi, produksi, dan penyuntingan media.',intro:'Kumpulan foto dan video hasil praktik serta proyek siswa.'},
    DGP:{title:'DGP',full:'Desain Grafis Percetakan',number:'03 / DGP',description:'Portofolio desain grafis, poster, identitas visual, tata letak, dan karya percetakan siswa.',intro:'Galeri khusus karya desain grafis dan praktik percetakan.'}
  };
  const key=(new URLSearchParams(location.search).get('kategori')||'PKK').toUpperCase();
  const info=categories[key]||categories.PKK;
  document.title=info.title+' | DKV SMKN 7 Kabupaten Tangerang';
  $('categoryKicker').textContent=info.number+' / DOKUMENTASI';
  $('categoryTitle').innerHTML=esc(info.title)+' <span>— '+esc(info.full)+'.</span>';
  $('categoryDescription').textContent=info.description;
  $('categoryNumber').textContent=info.number;
  $('galleryHeading').innerHTML='Foto & <span>video.</span>';
  $('galleryIntro').textContent=info.intro;
  $('year').textContent=new Date().getFullYear();
  $('menuToggle').addEventListener('click',()=>{const n=$('mainNav');n.classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',n.classList.contains('open')?'true':'false')});
  const cfg=window.DKV_CONFIG||{};
  const configured=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.includes('YOUR-PROJECT')&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
  const sb=configured&&window.supabase?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  function mediaMarkup(item){if(item.youtube_url){let id='';try{const u=new URL(item.youtube_url);if(u.hostname.includes('youtu.be'))id=u.pathname.slice(1);else id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop()}catch{}return id?`<iframe class="gallery-media" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="${esc(item.title)}" loading="lazy" allowfullscreen></iframe>`:'<div class="gallery-media"></div>'}if(!item.media_url)return '<div class="gallery-media"></div>';if(item.media_type==='video'||(item.media_type||'').startsWith('video/'))return `<video class="gallery-media" controls preload="metadata" src="${esc(item.media_url)}"></video>`;return `<img class="gallery-media" src="${esc(item.media_url)}" alt="${esc(item.title)}" loading="lazy">`}
  async function load(){const grid=$('categoryGallery');if(!sb){grid.innerHTML='<div class="empty-state"><h3>Galeri belum terhubung</h3><p>Pastikan URL dan public key Supabase di config.js sudah benar.</p></div>';$('categoryCount').textContent='0 konten';return}grid.innerHTML='<div class="empty-state"><h3>Memuat dokumentasi…</h3><p>Mohon tunggu sebentar.</p></div>';const {data,error}=await sb.from('content').select('*').eq('published',true).eq('category',key).order('event_date',{ascending:false});if(error){grid.innerHTML='<div class="empty-state"><h3>Dokumentasi belum dapat dimuat</h3><p>Periksa koneksi Supabase dan kebijakan akses konten.</p></div>';$('categoryCount').textContent='Galeri tidak tersedia';return}const items=data||[];$('categoryCount').textContent=items.length+' konten ditampilkan';if(!items.length){grid.innerHTML='<div class="empty-state"><div class="empty-icon">▧</div><h3>Belum ada konten '+esc(key)+'</h3><p>Konten kategori '+esc(key)+' yang dipublikasikan admin akan tampil di halaman ini.</p></div>';return}grid.innerHTML=items.map(x=>`<article class="gallery-card">${mediaMarkup(x)}<div class="gallery-info"><small>${esc(x.category)} · ${esc(x.event_date||'')}</small><h3>${esc(x.title)}</h3><p>${esc(x.description||'')}</p></div></article>`).join('')}
  $('refreshCategory').addEventListener('click',load);load();
})();