"use client";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--body-bg)] text-[var(--text-primary)] py-12 px-4 lg:px-12">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Intro */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20">
            <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow px-6 py-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L19 7V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Syarat & Ketentuan</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Ketentuan penggunaan layanan Manajemen Barang.</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-[var(--text-secondary)] space-y-3">
                <p className="leading-relaxed">Terakhir diperbarui: <span className="font-medium">16 November 2025</span></p>
                <p className="leading-relaxed">Silakan baca syarat berikut sebelum menggunakan layanan. Jika Anda memiliki pertanyaan, hubungi tim dukungan.</p>
              </div>

              <nav className="mt-6">
                <ul className="space-y-2 text-sm">
                  <li><a href="#layanan" className="text-emerald-600 hover:underline">Layanan</a></li>
                  <li><a href="#akun" className="text-emerald-600 hover:underline">Pendaftaran & Akun</a></li>
                  <li><a href="#kewajiban" className="text-emerald-600 hover:underline">Kewajiban Pengguna</a></li>
                  <li><a href="#konten" className="text-emerald-600 hover:underline">Konten & Data</a></li>
                  <li><a href="#privasi" className="text-emerald-600 hover:underline">Privasi</a></li>
                </ul>
              </nav>

              <div className="mt-6">
                <Link href="/" className="block text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Kembali</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right / Content */}
        <article className="lg:col-span-8">
          <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow divide-y divide-[var(--divider)] overflow-hidden">
            <header className="p-8">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">Syarat & Ketentuan Penggunaan</h1>
              <p className="mt-3 text-lg text-[var(--text-secondary)] max-w-prose">Halaman ini memuat ketentuan yang mengatur penggunaan aplikasi Manajemen Barang — mencakup pembuatan loker, pengelolaan inventaris, serta fitur pemindaian QR. Bacalah dengan seksama sebelum menggunakan layanan.</p>
            </header>

            <div className="p-8 prose prose-lg max-w-none text-[var(--text-secondary)]">
              <section id="layanan">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Layanan</h2>
                <p className="lead">Kami menyediakan fungsionalitas untuk membuat dan mengelola loker, menambahkan barang, kategorisasi, dan fitur laporan serta pemindaian QR.</p>
                <h3 className="text-xl font-medium text-[var(--text-primary)]">Ruang Lingkup Layanan</h3>
                <ul>
                  <li>Pembuatan dan konfigurasi loker</li>
                  <li>Manajemen barang (CRUD), termasuk batch creation</li>
                  <li>Laporan sederhana dan statistik penggunaan</li>
                </ul>
              </section>

              <section id="akun">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Pendaftaran & Akun</h2>
                <p className="lead">Beberapa fitur memerlukan akun untuk keamanan dan personalisasi. Jagalah kerahasiaan kredensial Anda.</p>
                <h3 className="text-xl font-medium text-[var(--text-primary)]">Keamanan Akun</h3>
                <ul>
                  <li>Gunakan kata sandi yang kuat dan tidak dibagikan.</li>
                  <li>Segera laporkan akses tidak sah melalui halaman profil atau dukungan.</li>
                </ul>
              </section>

              <section id="kewajiban">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Kewajiban Pengguna</h2>
                <p className="lead">Pengguna bertanggung jawab atas penggunaan layanan sesuai hukum dan kebijakan internal organisasi.</p>
                <h3 className="text-xl font-medium text-[var(--text-primary)]">Larangan</h3>
                <ul>
                  <li>Pengunggahan konten ilegal atau yang melanggar hak pihak lain.</li>
                  <li>Penyalahgunaan loker atau akses tanpa izin.</li>
                </ul>
              </section>

              <section id="konten">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Konten & Data</h2>
                <p className="lead">Konten dan data yang Anda masukkan adalah tanggung jawab Anda. Kami menyediakan sarana penyimpanan dan pengelolaan.</p>
                <h3 className="text-xl font-medium text-[var(--text-primary)]">Tanggung Jawab atas Data</h3>
                <p>Pastikan data yang Anda unggah valid dan tidak melanggar hukum atau kebijakan pihak ketiga.</p>
              </section>

              <section id="privasi">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Privasi</h2>
                <p className="lead">Informasi pribadi diproses sesuai <Link href="/privacy" className="text-emerald-600 hover:underline">Kebijakan Privasi</Link>. Bacalah kebijakan tersebut untuk detail pengelolaan data.</p>
              </section>

              <section id="pembatasan">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Pembatasan & Larangan</h2>
                <p className="lead">Dilarang melakukan tindakan yang merusak layanan atau melakukan akses tidak sah.</p>
              </section>

              <section id="batasan">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Batasan Tanggung Jawab</h2>
                <p className="lead">Pemilik layanan tidak bertanggung jawab atas kerugian tidak langsung atau kehilangan data, sejauh diizinkan hukum.</p>
              </section>

              <section id="pengakhiran">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Pengakhiran</h2>
                <p className="lead">Kami dapat menangguhkan atau menutup akun yang melanggar kebijakan.</p>
              </section>

              <section id="perubahan">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Perubahan Syarat</h2>
                <p className="lead">Perubahan syarat akan diumumkan pada halaman ini; penggunaan berkelanjutan menandakan penerimaan.</p>
              </section>

              <section id="kontak">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Kontak</h2>
                <p className="lead">Untuk pertanyaan terkait syarat ini, kunjungi <Link href="/profile" className="text-emerald-600 hover:underline">Profil</Link> atau hubungi administrator.</p>
              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}