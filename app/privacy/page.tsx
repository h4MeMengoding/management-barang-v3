"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 lg:px-12">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Intro & TOC */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl shadow px-6 py-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8 2 5 5 5 9V12L3 14V18H21V14L19 12V9C19 5 16 2 12 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Kebijakan Privasi</h2>
                  <p className="text-sm text-gray-600">Bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700 space-y-3">
                <p className="leading-relaxed">Terakhir diperbarui: <span className="font-medium">16 November 2025</span></p>
                <p className="leading-relaxed">Kami menghargai privasi Anda dan berkomitmen melindungi data pengguna.</p>
              </div>

              <nav className="mt-6">
                <ul className="space-y-2 text-sm">
                  <li><a href="#data" className="text-emerald-600 hover:underline">Data yang Dikumpulkan</a></li>
                  <li><a href="#penggunaan" className="text-emerald-600 hover:underline">Tujuan Penggunaan</a></li>
                  <li><a href="#cookies" className="text-emerald-600 hover:underline">Cookies & Tracking</a></li>
                  <li><a href="#keamanan" className="text-emerald-600 hover:underline">Keamanan Data</a></li>
                </ul>
              </nav>

              <div className="mt-6">
                <Link href="/terms" className="block text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Syarat & Ketentuan</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right / Content */}
        <article className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-100 overflow-hidden">
            <header className="p-8">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Kebijakan Privasi</h1>
              <p className="mt-3 text-lg text-gray-600 max-w-prose">Penjelasan bagaimana data dikumpulkan, diproses, dan dilindungi dalam aplikasi Manajemen Barang. Kami berkomitmen menjaga kerahasiaan dan keamanan informasi pengguna.</p>
            </header>

            <div className="p-8 prose prose-lg max-w-none text-gray-700">
              <section id="data">
                <h2 className="text-2xl font-semibold text-gray-900">Data yang Kami Kumpulkan</h2>
                <p className="lead">Jenis data yang kami kumpulkan mencakup data akun, data inventaris, dan data penggunaan.</p>
                <h3 className="text-xl font-medium text-gray-800">Contoh Data</h3>
                <ul>
                  <li>Informasi akun: nama, email.</li>
                  <li>Data inventaris: nama barang, foto, jumlah, kategori.</li>
                  <li>Data teknis: alamat IP, log aktivitas, waktu akses.</li>
                </ul>
              </section>

              <section id="penggunaan">
                <h2 className="text-2xl font-semibold text-gray-900">Tujuan Penggunaan Data</h2>
                <p className="lead">Data digunakan untuk menjalankan layanan, otentikasi, dan meningkatkan pengalaman pengguna.</p>
                <h3 className="text-xl font-medium text-gray-800">Ruang Lingkup</h3>
                <ul>
                  <li>Penyediaan fitur manajemen loker dan barang.</li>
                  <li>Pemberian notifikasi dan dukungan pelanggan.</li>
                </ul>
              </section>

              <section id="cookies">
                <h2 className="text-2xl font-semibold text-gray-900">Cookies & Tracking</h2>
                <p className="lead">Kami menggunakan cookie untuk autentikasi, preferensi, dan analitik. Anda dapat mengelola cookie melalui browser.</p>
              </section>

              <section id="keamanan">
                <h2 className="text-2xl font-semibold text-gray-900">Keamanan Data</h2>
                <p className="lead">Kami menerapkan praktik keamanan standar industri, seperti enkripsi saat transmisi dan kontrol akses internal.</p>
                <h3 className="text-xl font-medium text-gray-800">Batasan</h3>
                <p>Meskipun kami berusaha melindungi data, tidak ada sistem yang sepenuhnya bebas risiko.</p>
              </section>

              <section id="pihak-ketiga">
                <h2 className="text-2xl font-semibold text-gray-900">Pihak Ketiga</h2>
                <p className="lead">Kami mungkin menggunakan layanan pihak ketiga (mis. Supabase) untuk fungsionalitas aplikasi. Mitra tersebut hanya mendapatkan akses yang diperlukan.</p>
              </section>

              <section id="hak">
                <h2 className="text-2xl font-semibold text-gray-900">Hak Pengguna</h2>
                <p className="lead">Anda dapat meminta akses, koreksi, atau penghapusan data. Hubungi dukungan untuk permintaan tersebut.</p>
              </section>

              <section id="retensi">
                <h2 className="text-2xl font-semibold text-gray-900">Retensi Data</h2>
                <p className="lead">Data disimpan selama diperlukan untuk tujuan operasional dan kepatuhan hukum.</p>
              </section>

              <section id="perubahan">
                <h2 className="text-2xl font-semibold text-gray-900">Perubahan Kebijakan</h2>
                <p className="lead">Perubahan kebijakan akan dipublikasikan di halaman ini; pengguna akan diberitahu bila perlu.</p>
              </section>

              <section id="kontak">
                <h2 className="text-2xl font-semibold text-gray-900">Kontak</h2>
                <p className="lead">Untuk pertanyaan mengenai kebijakan ini, kunjungi <Link href="/profile" className="text-emerald-600 hover:underline">Profil</Link> atau hubungi administrator.</p>
              </section>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
