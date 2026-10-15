(() => {
  const $ = (id) => document.getElementById(id);
  const cfg = window.DKV_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes('YOUR-PROJECT') && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
  const sb = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  let items = [], currentUser = null, activeFilter = 'all';
  $('year').textContent = new Date().getFullYear();
  function updateAdminClock(){
    const now=new Date();
    const clock=$('adminLiveClock'),date=$('adminLiveDate');
    if(clock)clock.textContent=now.toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour12:false});
    if(date)date.textContent=now.toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta',weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  }
  updateAdminClock();setInterval(updateAdminClock,1000);

  const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3200)}
  function notice(msg){$('adminNotice').textContent=msg||''}
  function openLogin(){ $('loginOverlay').classList.remove('hidden'); $('loginEmail').focus(); }
  function closeLogin(){ $('loginOverlay').classList.add('hidden'); }
  function openStudentLogin(){ $('studentLoginOverlay').classList.remove('hidden'); $('studentLoginEmail').focus(); }
  function closeStudentLogin(){ $('studentLoginOverlay').classList.add('hidden'); }
  $('openLogin').addEventListener('click',openLogin); $('studentLogin').addEventListener('click',openStudentLogin); $('closeLogin').addEventListener('click',closeLogin);
  $('closeStudentLogin').addEventListener('click',closeStudentLogin);
  $('loginOverlay').addEventListener('click',e=>{if(e.target===$('loginOverlay'))closeLogin()});
  $('studentLoginOverlay').addEventListener('click',e=>{if(e.target===$('studentLoginOverlay'))closeStudentLogin()});
  $('menuToggle').addEventListener('click',()=>{const n=$('mainNav');n.classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',n.classList.contains('open')?'true':'false')});
  document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=> $('mainNav').classList.remove('open')));
  document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeFilter=b.dataset.filter;renderGallery()}));
  $('refreshGallery').addEventListener('click',loadItems);
  document.querySelectorAll('[data-jump-filter]').forEach(b=>b.addEventListener('click',()=>{const f=b.dataset.jumpFilter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter===f));activeFilter=f;renderGallery();$('galeri').scrollIntoView({behavior:'smooth'});}));
  if(!sb){$('galleryGrid').innerHTML='<div class="empty-state"><div class="empty-icon">▧</div><h3>Website siap dikonfigurasi</h3><p>Galeri akan aktif setelah URL dan public key Supabase diisi pada file config.js.</p></div>'; $('loginMessage').textContent='Hubungkan project Supabase terlebih dahulu. Lihat README.md.';}
  async function loadItems(){if(!sb)return;const {data,error}=await sb.from('content').select('*').eq('published',true).order('event_date',{ascending:false});if(error){$('galleryGrid').innerHTML='<div class="empty-state"><h3>Galeri belum dapat dimuat</h3><p>Periksa pengaturan Supabase dan kebijakan database.</p></div>';return}items=data||[];renderGallery()}
  function mediaMarkup(item){if(item.youtube_url){let id='';try{const u=new URL(item.youtube_url);if(u.hostname.includes('youtu.be'))id=u.pathname.slice(1);else id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop()}catch{};return id?`<iframe class="gallery-media" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="${esc(item.title)}" loading="lazy" allowfullscreen></iframe>`:'<div class="gallery-media"></div>'}if(!item.media_url)return '<div class="gallery-media"></div>';if(item.media_type==='video'||(item.media_type||'').startsWith('video/'))return `<video class="gallery-media" controls preload="metadata" src="${esc(item.media_url)}"></video>`;return `<img class="gallery-media" src="${esc(item.media_url)}" alt="${esc(item.title)}" loading="lazy">`}
  function renderGallery(){const dedicatedCategories=['PKK','FDVD','DGP'];const filtered=items.filter(x=>!dedicatedCategories.includes(x.category)&&(activeFilter==='all'||x.category===activeFilter||(activeFilter==='Desain'&&x.category==='Karya Siswa')));$('galleryCount').textContent=`${filtered.length} konten ditampilkan`;if(!filtered.length){$('galleryGrid').innerHTML='<div class="empty-state"><div class="empty-icon">▧</div><h3>Belum ada konten</h3><p>Konten yang dipublikasikan admin akan tampil di sini.</p></div>';return}$('galleryGrid').innerHTML=filtered.map(x=>`<article class="gallery-card">${mediaMarkup(x)}<div class="gallery-info"><small>${esc(x.category)} · ${esc(x.event_date||'')}</small><h3>${esc(x.title)}</h3><p>${esc(x.description||'')}</p></div></article>`).join('')}
  $('studentLoginForm').addEventListener('submit',async e=>{e.preventDefault();const msg=$('studentLoginMessage');if(!sb){msg.textContent='Supabase belum dikonfigurasi. Lengkapi config.js terlebih dahulu.';return}const email=$('studentLoginEmail').value.trim(),password=$('studentLoginPassword').value;msg.textContent='Memeriksa akun…';const {data,error}=await sb.auth.signInWithPassword({email,password});if(error){msg.textContent='Login siswa gagal: periksa email dan password akun.';return}const user=data.user;const {data:profile,error:profileError}=await sb.from('profiles').select('role').eq('id',user.id).single();if(profileError||!profile){await sb.auth.signOut();msg.textContent='Profil akun tidak ditemukan. Hubungi admin.';return}if(['admin','editor'].includes(profile.role)){await sb.auth.signOut();msg.textContent='Akun ini adalah akun pengelola. Gunakan tombol Login di menu atas untuk masuk ke panel admin.';return}currentUser = user;
closeStudentLogin();
$('studentLogin').classList.add('hidden');
$('attendancePanel').classList.remove('hidden');$('attendanceLoginHint').classList.add('hidden');$('attendanceWelcome').textContent='Login sebagai '+(user.email||'siswa')+'. Isi formulir presensi di bawah.';$('attendanceTime').textContent='Waktu perangkat saat ini: '+new Date().toLocaleString('id-ID');$('absensi').scrollIntoView({behavior:'smooth'});toast('Login siswa berhasil')});
  $('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!sb){$('loginMessage').textContent='Supabase belum dikonfigurasi. Lengkapi config.js terlebih dahulu.';return}const email=$('loginEmail').value.trim(),password=$('loginPassword').value;const {data,error}=await sb.auth.signInWithPassword({email,password});if(error){$('loginMessage').textContent='Login gagal: '+error.message;return}currentUser=data.user;const {data:profile}=await sb.from('profiles').select('role').eq('id',currentUser.id).single();if(!profile){await sb.auth.signOut();$('loginMessage').textContent='Profil akun tidak ditemukan. Hubungi admin.';return}if(!['admin','editor'].includes(profile.role)){await sb.auth.signOut();currentUser=null;$('loginMessage').textContent='Akun ini bukan akun pengelola. Gunakan tombol Login siswa pada bagian Absensi.';return}closeLogin();$('publicSite').classList.add('hidden');document.querySelector('.site-header').classList.add('hidden');document.querySelector('.site-footer').classList.add('hidden');$('adminApp').classList.remove('hidden');$('adminEmail').textContent=currentUser.email;$('adminAvatar').textContent=(currentUser.email||'A')[0].toUpperCase();notice('Login berhasil. Peran: '+profile.role);await loadAdminItems()});
  document.querySelectorAll('.admin-tab').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.panel)));
  document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.goto)));
  function showPanel(name){document.querySelectorAll('.admin-tab').forEach(b=>b.classList.toggle('active',b.dataset.panel===name));document.querySelectorAll('.admin-panel').forEach(p=>p.classList.toggle('hidden',p.id!=='panel-'+name));$('adminPageTitle').textContent=({overview:'Ringkasan',content:'Konten & Galeri',add:'Tambah konten',attendance:'Rekap absensi'})[name]||'Dashboard';if(name==='add')resetForm();if(name==='attendance'){loadAttendanceAdmin();startAttendanceLive()}}
  $('viewSite').addEventListener('click',()=>{ $('adminApp').classList.add('hidden');$('publicSite').classList.remove('hidden');document.querySelector('.site-header').classList.remove('hidden');document.querySelector('.site-footer').classList.remove('hidden') });
  $('logoutButton').addEventListener('click',async()=>{if(sb)await sb.auth.signOut();currentUser=null;$('adminApp').classList.add('hidden');$('publicSite').classList.remove('hidden');document.querySelector('.site-header').classList.remove('hidden');document.querySelector('.site-footer').classList.remove('hidden');toast('Kamu sudah keluar dari dashboard')});
  let attendanceChannel=null;
  let attendancePoll=null;
  let attendanceRows=[];
  function selectedAttendanceMonth(){const value=$('attendanceMonth')?.value;return /^\d{4}-\d{2}$/.test(value||'')?value:new Date().toISOString().slice(0,7)}
  function monthRange(month){const [y,m]=month.split('-').map(Number);return {from:new Date(y,m-1,1).toISOString(),to:new Date(y,m,1).toISOString()}}
  function renderAttendanceRows(rows){
    attendanceRows=rows||[];
    const counts={Hadir:0,Izin:0,Sakit:0};
    attendanceRows.forEach(x=>{if(counts[x.status]!==undefined)counts[x.status]++});
    const summary=$('attendanceMonthSummary');
    if(summary)summary.innerHTML=`<div class="attendance-stat"><strong>${attendanceRows.length}</strong><span>Total presensi</span></div><div class="attendance-stat"><strong>${counts.Hadir}</strong><span>Hadir</span></div><div class="attendance-stat"><strong>${counts.Izin}</strong><span>Izin</span></div><div class="attendance-stat"><strong>${counts.Sakit}</strong><span>Sakit</span></div>`;
    const el=$('attendanceAdminList');
    if(!attendanceRows.length){el.innerHTML='<p class="muted">Belum ada data absensi untuk bulan yang dipilih.</p>';return}
    el.innerHTML=attendanceRows.map(x=>`<div class="manage-row"><div>${x.selfie_url?`<a href="${esc(x.selfie_url)}" target="_blank" rel="noopener"><img src="${esc(x.selfie_url)}" alt="Selfie siswa" loading="lazy"></a>`:'—'}</div><div class="row-copy"><strong>${esc(x.student_name)} · ${esc(x.student_class)}</strong><small>${esc(x.status)} · ${esc(new Date(x.submitted_at).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'}))}${x.note?' · '+esc(x.note):''}</small></div></div>`).join('');
  }
  async function loadAttendanceAdmin(){
    if(!sb)return;
    const el=$('attendanceAdminList');if(el)el.innerHTML='<p class="muted">Memuat data absensi…</p>';
    const month=selectedAttendanceMonth(),range=monthRange(month);
    const {data,error}=await sb.from('attendance').select('*').gte('submitted_at',range.from).lt('submitted_at',range.to).order('submitted_at',{ascending:false});
    if(error){el.innerHTML='<p class="muted">Tidak dapat memuat absensi: '+esc(error.message)+'</p>';if($('attendanceLiveStatus'))$('attendanceLiveStatus').textContent='Koneksi perlu diperiksa';return}
    renderAttendanceRows(data||[]);
    if($('attendanceLiveStatus'))$('attendanceLiveStatus').textContent='Terhubung · diperbarui '+new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'});
  }
  function startAttendanceLive(){
    if(!sb)return;
    if(attendanceChannel)sb.removeChannel(attendanceChannel);
    if(attendancePoll)clearInterval(attendancePoll);
    attendanceChannel=sb.channel('attendance-live-monitor').on('postgres_changes',{event:'*',schema:'public',table:'attendance'},()=>loadAttendanceAdmin()).subscribe(status=>{
      if($('attendanceLiveStatus') && status==='SUBSCRIBED')$('attendanceLiveStatus').textContent='Live aktif · menunggu presensi baru';
    });
    // Fallback polling every 20 seconds if realtime publication is not enabled in Supabase.
    attendancePoll=setInterval(()=>{if(!$('adminApp').classList.contains('hidden')&&!$('panel-attendance').classList.contains('hidden'))loadAttendanceAdmin()},20000);
  }
  function exportAttendanceCSV(){
    if(!sb)return;
    const month=selectedAttendanceMonth();
    const columns=[['Tanggal','tanggal'],['Waktu','waktu'],['Nama Siswa','student_name'],['Kelas','student_class'],['Status','status'],['Catatan','note'],['Waktu Kirim ISO','submitted_at'],['URL Foto Selfie','selfie_url']];
    const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const rows=[columns.map(c=>q(c[0])).join(',')];
    attendanceRows.forEach(x=>{
      const d=new Date(x.submitted_at);
      const vals={tanggal:d.toLocaleDateString('id-ID',{timeZone:'Asia/Jakarta'}),waktu:d.toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'}),...x};
      rows.push(columns.map(c=>q(vals[c[1]])).join(','));
    });
    const blob=new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`rekap-absensi-DKV-${month}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  $('refreshAttendance').addEventListener('click',loadAttendanceAdmin);
  $('attendanceMonth').value=new Date().toISOString().slice(0,7);
  $('attendanceMonth').addEventListener('change',loadAttendanceAdmin);
  $('exportAttendance').addEventListener('click',exportAttendanceCSV);
  async function loadAdminItems(){if(!sb)return;const {data,error}=await sb.from('content').select('*').order('created_at',{ascending:false});if(error){notice('Gagal memuat data: '+error.message);return}const all=data||[];$('statTotal').textContent=all.length;$('statPublished').textContent=all.filter(x=>x.published).length;$('statDraft').textContent=all.filter(x=>!x.published).length;const row=x=>`<div class="admin-row"><div>${x.media_url&&(x.media_type==='image'||x.media_type?.startsWith('image/'))?`<img src="${esc(x.media_url)}" alt="">`:'▧'}</div><div><strong>${esc(x.title)}</strong><small>${esc(x.category)} · ${x.published?'Terbit':'Draft'} · ${esc(x.event_date||'')}</small></div></div>`;$('recentList').innerHTML=all.slice(0,5).map(row).join('')||'<p class="muted">Belum ada konten.</p>';$('manageList').innerHTML=all.map(x=>`<div class="manage-row"><div>${x.media_url&&(x.media_type==='image'||x.media_type?.startsWith('image/'))?`<img src="${esc(x.media_url)}" alt="">`:'▧'}</div><div class="row-copy"><strong>${esc(x.title)}</strong><small>${esc(x.category)} · ${esc(x.event_date||'')} · ${x.published?'Dipublikasikan':'Draft'}</small></div><div class="row-actions"><button class="small-btn" data-edit="${x.id}">Edit</button><button class="small-btn" data-toggle="${x.id}" data-published="${x.published}">${x.published?'Jadikan draft':'Publikasikan'}</button><button class="small-btn danger" data-delete="${x.id}">Hapus</button></div></div>`).join('')||'<p class="muted">Belum ada konten.</p>';document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editContent(all.find(x=>x.id===b.dataset.edit)));document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>togglePublish(b.dataset.toggle,b.dataset.published==='true'));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteContent(b.dataset.delete))}
  function resetForm(){ $('contentForm').reset();$('contentId').value='';$('contentFormTitle').textContent='Tambah konten baru';$('contentDate').value=new Date().toISOString().slice(0,10);$('currentMedia').textContent='';$('contentMessage').textContent='';$('saveContent').disabled=false }
  function editContent(x){if(!x)return;showPanel('add');$('contentId').value=x.id;$('contentTitle').value=x.title;$('contentCategory').value=x.category;$('contentDate').value=x.event_date;$('contentDescription').value=x.description||'';$('videoUrl').value=x.youtube_url||'';$('contentPublished').checked=!!x.published;$('currentMedia').textContent=x.media_url?'Media saat ini tersimpan. Unggah file baru untuk menggantinya.':'';$('contentFormTitle').textContent='Edit konten'}
  $('cancelEdit').addEventListener('click',()=>showPanel('content'));
  $('contentForm').addEventListener('submit',async e=>{e.preventDefault();if(!sb||!currentUser)return;const btn=$('saveContent');btn.disabled=true;$('contentMessage').textContent='Menyimpan…';try{const id=$('contentId').value||null,file=$('mediaFile').files[0],youtube=$('videoUrl').value.trim();let media_url=null,media_type=null;const old=items.find(x=>x.id===id);if(old){media_url=old.media_url;media_type=old.media_type}if(file){const isVideo=file.type.startsWith('video/');const max=isVideo?50*1024*1024:8*1024*1024;if(file.size>max)throw new Error(isVideo?'Ukuran video maksimal 50 MB.':'Ukuran foto maksimal 8 MB.');const path=`${currentUser.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const up=await sb.storage.from('dkv-media').upload(path,file,{upsert:false,contentType:file.type});if(up.error)throw up.error;media_url=sb.storage.from('dkv-media').getPublicUrl(path).data.publicUrl;media_type=isVideo?'video':'image'}const payload={title:$('contentTitle').value.trim(),category:$('contentCategory').value,event_date:$('contentDate').value,description:$('contentDescription').value.trim(),youtube_url:youtube||null,media_url:youtube?null:media_url,media_type:youtube?'video':media_type,published:$('contentPublished').checked,created_by:currentUser.id};let res=id?await sb.from('content').update(payload).eq('id',id):await sb.from('content').insert(payload);if(res.error)throw res.error;$('contentMessage').textContent='Konten berhasil disimpan.';toast('Konten berhasil disimpan');resetForm();await loadAdminItems();await loadItems();showPanel('content')}catch(err){$('contentMessage').textContent='Gagal menyimpan: '+(err.message||'Periksa konfigurasi Supabase.')}finally{btn.disabled=false}});
  async function togglePublish(id,published){const {error}=await sb.from('content').update({published:!published}).eq('id',id);if(error){notice('Gagal mengubah status: '+error.message);return}toast('Status publikasi diperbarui');await loadAdminItems();await loadItems()}
  async function deleteContent(id){if(!confirm('Yakin ingin menghapus konten ini?'))return;const {error}=await sb.from('content').delete().eq('id',id);if(error){notice('Gagal menghapus: '+error.message);return}toast('Konten dihapus');await loadAdminItems();await loadItems()}
  $('attendanceForm').addEventListener('submit',async e=>{e.preventDefault();if(!sb||!currentUser){$('attendanceMessage').textContent='Silakan login terlebih dahulu.';return}const file=$('selfieFile').files[0],btn=$('submitAttendance');if(!file){$('attendanceMessage').textContent='Foto selfie wajib diunggah.';return}if(!file.type.startsWith('image/')){$('attendanceMessage').textContent='File harus berupa foto.';return}if(file.size>8*1024*1024){$('attendanceMessage').textContent='Ukuran foto maksimal 8 MB.';return}btn.disabled=true;$('attendanceMessage').textContent='Mengirim absensi…';try{const path='attendance/'+currentUser.id+'/'+Date.now()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const up=await sb.storage.from('dkv-media').upload(path,file,{upsert:false,contentType:file.type});if(up.error)throw up.error;const photo=sb.storage.from('dkv-media').getPublicUrl(path).data.publicUrl;const res=await sb.from('attendance').insert({student_id:currentUser.id,student_name:$('studentName').value.trim(),student_class:$('studentClass').value.trim(),status:$('attendanceStatus').value,note:$('attendanceNote').value.trim(),selfie_url:photo,submitted_at:new Date().toISOString()});if(res.error)throw res.error;$('attendanceMessage').textContent='Absensi berhasil dikirim.';$('attendanceForm').reset();$('attendanceTime').textContent='Terkirim pada '+new Date().toLocaleString('id-ID');toast('Absensi berhasil dikirim')}catch(err){$('attendanceMessage').textContent='Gagal mengirim absensi: '+(err.message||'Periksa koneksi dan pengaturan database.')}finally{btn.disabled=false}});
  $('studentLogout').addEventListener('click',async()=>{if(sb)await sb.auth.signOut();currentUser=null;$('attendancePanel').classList.add('hidden');$('attendanceLoginHint').classList.remove('hidden');toast('Kamu sudah keluar dari akun siswa')});
  if(sb){loadItems();sb.auth.getSession().then(({data})=>{if(data.session)currentUser=data.session.user})}
})();
