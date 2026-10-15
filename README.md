# Website DKV SMKN 7 Kabupaten Tangerang

Website responsif dengan halaman profil, kegiatan, galeri foto/video, login admin, dashboard, status draft/publikasi, dan pengelolaan akun admin/editor menggunakan Supabase.

## File dalam paket
- `index.html` — tampilan publik dan dashboard admin.
- `styles.css` — desain responsif.
- `app.js` — galeri, login, upload, dan pengelolaan konten.
- `config.js` — konfigurasi URL dan anon/public key Supabase.
- `supabase-setup.sql` — tabel, role, kebijakan akses, dan bucket media.

## A. Buat backend gratis
1. Buat akun di https://supabase.com lalu buat project baru. Simpan password database di tempat aman.
2. Di project, buka **SQL Editor** > **New query**. Buka file `supabase-setup.sql`, salin seluruh isinya, tempel ke editor, lalu klik **Run**.
3. Buka **Project Settings > API**. Salin **Project URL** dan **anon/public key**. Jangan pernah menggunakan `service_role` atau secret key di website.
4. Buka `config.js` dengan Notepad atau VS Code. Ganti nilai `SUPABASE_URL` dan `SUPABASE_ANON_KEY`, simpan file.

## B. Buat admin pertama
1. Di Supabase buka **Authentication > Users > Add user** dan buat akun menggunakan email kamu.
2. Buka **SQL Editor** dan jalankan query ini, ganti email contoh dengan email akunmu:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id and u.email = 'admin@contoh.sch.id';
```

3. Untuk anggota tim media, buat akun terpisah di Authentication > Users lalu jalankan query serupa dengan `role = 'editor'`. Jangan mengaktifkan pendaftaran publik tanpa kebutuhan.

## C. Jalankan di laptop
Cara mudah: pasang Python jika belum tersedia, buka Command Prompt di folder yang berisi file website, lalu jalankan:

```bash
python -m http.server 8000
```

Jika perintah itu tidak dikenali, coba `py -m http.server 8000`. Buka `http://localhost:8000` di browser. Alternatif: gunakan VS Code dengan ekstensi Live Server.

## D. Terbitkan gratis
1. Setelah konfigurasi dan tes lokal, buat akun di https://www.netlify.com.
2. Unggah folder website (berisi `index.html`, `styles.css`, `app.js`, dan `config.js`) lewat fitur deploy manual/drag-and-drop Netlify.
3. Netlify akan memberi subdomain `*.netlify.app`.
4. Di Supabase buka **Authentication > URL Configuration**, set **Site URL** ke URL Netlify dan tambahkan URL itu ke **Redirect URLs**.
5. Tes login, upload, publikasi, dan akses dari HP.

## Keamanan
- Jangan memasukkan service_role/secret key ke `config.js`.
- Akun baru otomatis berperan `viewer`; ubah hanya akun tepercaya menjadi `admin` atau `editor` menggunakan query di atas.
- Foto/video di bucket publik dapat dilihat oleh siapa pun yang memiliki URL. Dapatkan izin sebelum menerbitkan foto siswa.
- Untuk kanal resmi sekolah, minta persetujuan pihak sekolah. Kuota gratis Supabase/Netlify dapat berubah sesuai kebijakan penyedia.

Website belum online otomatis; backend harus dibuat dan konfigurasi harus diisi sebelum login dan unggahan bekerja.

## Fitur tambahan: PKK, FDVD, DGP, dan absensi

- Menu publik kini memiliki bagian Kegiatan, PKK, FDVD, DGP, dan Absensi.
- Saat mengunggah konten di panel admin, pilih kategori PKK, FDVD, atau DGP agar konten bisa difilter pada bagian terkait.
- Form absensi membutuhkan akun siswa di Supabase Authentication. Buat akun siswa melalui **Authentication > Users > Add user**; akun otomatis mendapat role `viewer` dan dapat mengakses formulir presensi setelah login.
- Login siswa pada versi ini menggunakan email dan password Supabase. Jika sekolah membutuhkan username murni, sistem perlu dikembangkan dengan pemetaan username khusus di backend.
- Untuk menyiapkan tabel absensi, buka Supabase **SQL Editor** dan jalankan kembali seluruh `supabase-setup.sql`. Skrip menambahkan tabel `attendance` beserta kebijakan akses.
- Admin/editor dapat melihat rekap absensi pada panel admin > Absensi. Siswa hanya dapat mengirim dan membaca data absensinya sendiri melalui kebijakan RLS.
- Foto selfie bisa diambil dari kamera perangkat yang mendukung atribut `capture`. Untuk foto TimeMark, siswa perlu mengambil foto di aplikasi TimeMark lalu memilih hasilnya dari perangkat.
- Waktu pengiriman disimpan oleh aplikasi dan tidak menjadi bukti mutlak lokasi atau waktu pengambilan foto. Validasi lokasi/anti-kecurangan tambahan belum termasuk versi ini.

Setelah perubahan dipublikasikan ke GitHub Pages, pastikan URL website ditambahkan pada Supabase **Authentication > URL Configuration > Redirect URLs**. Tes akun admin dan siswa sebelum digunakan secara resmi.


## Halaman kategori khusus

- `kategori.html?kategori=PKK` — halaman khusus PKK
- `kategori.html?kategori=FDVD` — halaman khusus FDVD
- `kategori.html?kategori=DGP` — halaman khusus DGP

Menu PKK, FDVD, dan DGP membuka halaman kategori tersendiri. Konten kategori tersebut disembunyikan dari galeri dashboard utama.


## Pemantauan absensi dan ekspor bulanan
- Panel admin/guru menampilkan jam dan tanggal WIB yang bergerak setiap detik.
- Bagian Rekap absensi memuat data untuk bulan yang dipilih, menghitung total Hadir/Izin/Sakit, dan mengekspor CSV UTF-8 yang dapat dibuka di Microsoft Excel.
- Pembaruan langsung menggunakan Supabase Realtime; fallback polling berjalan setiap 20 detik saat panel absensi terbuka.
- Agar Realtime aktif, jalankan pembaruan `supabase-setup.sql` di Supabase SQL Editor. Jika project membatasi publication, buka Database > Replication dan pastikan tabel `public.attendance` disertakan.
- Ekspor CSV dibuat saat admin menekan tombol; tidak ada pengiriman otomatis terjadwal setiap akhir bulan.
