import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';

export default function ManageQRCode() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] lg:pl-24">
      <Sidebar />
      
      <main className="w-full px-4 pt-4 pb-20 md:px-6 md:py-6 lg:px-8 lg:pb-8">
        <Header />
        
        <Card>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Kelola QR Code</h1>
          <p className="mt-4 text-gray-600">Manajemen QR Code untuk loker dan barang akan ditampilkan di sini.</p>
        </Card>
      </main>
    </div>
  );
}
