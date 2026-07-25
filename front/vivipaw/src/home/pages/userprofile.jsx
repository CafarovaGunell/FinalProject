import React, { useState, useEffect } from 'react';
import { 
  User, Stethoscope, Store, PlusCircle, Trash2, 
  CheckCircle, XCircle, FileText, ShoppingBag, Heart, ShieldCheck, ChevronDown 
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  
  // Rol və tab idarəetməsi
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'pets', 'doctorPanel', 'storePanel'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Yuxarıdakı kiçik ikon menyusu üçün
  
  // Modal / Form state-ləri (Baytar və Mağaza qeydiyyatı üçün)
  const [modalType, setModalType] = useState(null); // 'vet' və ya 'store'
  
  // Məlumatlar
  const [myPets, setMyPets] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  
  // Form inputları
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleCategory, setArticleCategory] = useState('Ümumi');

  // Baytar / Mağaza müraciət form inputları
  const [regData, setRegData] = useState({
    clinicName: '', specialty: '', experienceYears: '', licenseNumber: '', bio: '',
    storeName: '', description: '', phone: '', email: '', taxNumber: '', city: '', address: '', instagram: '', logoUrl: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // İstifadəçi roluna və məlumatlarına görə məlumatları çəkirik
  useEffect(() => {
    if (user?.role === 'Veterinarian') setActiveTab('doctorPanel');
    else if (user?.role === 'PetShop') setActiveTab('storePanel');
    else setActiveTab('overview');

    // Məsələn, istifadəçinin heyvanlarını və ya baytar/mağaza məlumatlarını çəkmək
    const fetchUserData = async () => {
      try {
        // Simulyasiya və ya real API çağırışları
        // const res = await API.get(`/Pets/my-pets/${user?.id}`);
        // setMyPets(res.data);
      } catch (err) {
        console.error("Məlumat yüklənmədi", err);
      }
    };
    fetchUserData();
  }, [user]);

  // Heyvan elanı əlavə etmə (Müştəri üçün)
  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // API çağırışı
      const newPet = { id: Date.now(), name: petName, breed: petBreed, age: petAge };
      setMyPets([...myPets, newPet]);
      setMessage({ text: "Heyvan elanı uğurla əlavə olundu!", type: 'success' });
      setPetName(''); setPetBreed(''); setPetAge('');
    } catch (err) {
      setMessage({ text: "Xəta baş verdi.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Heyvan elanını silmə
  const handleDeletePet = async (id) => {
    setMyPets(myPets.filter(p => p.id !== id));
    setMessage({ text: "Elan silindi.", type: 'success' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans pb-24">
      
      {/* ÜST HİSSƏ: Profil Banneri və Rol/Qeydiyyat İkonu */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-sky-500/20 border-2 border-sky-400/40 flex items-center justify-center text-3xl font-black text-sky-400 shadow-lg">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user?.fullName || 'İstifadəçi'}</h1>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {user?.role || 'Müştəri'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Sağ Tərəf: Kiçik Qeydiyyat / Rol İkonu və Menyu */}
        <div className="relative z-20">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
          >
            <ShieldCheck size={16} className="text-sky-400" />
            <span>Baytar və ya Mağaza Ol</span>
            <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Açılan Kiçik Menyu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden py-2 z-30 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => { setModalType('vet'); setIsDropdownOpen(false); }} 
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-sky-600/20 hover:text-sky-400 flex items-center gap-2.5 transition-colors"
              >
                <Stethoscope size={16} className="text-sky-400" /> Baytar Kimi Qeydiyyat
              </button>
              <button 
                onClick={() => { setModalType('store'); setIsDropdownOpen(false); }} 
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-sky-600/20 hover:text-sky-400 flex items-center gap-2.5 transition-colors"
              >
                <Store size={16} className="text-sky-400" /> Mağaza (PetShop) Aç
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mesaj Bildirişi */}
      {message.text && (
        <div className={`mt-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold">✕</button>
        </div>
      )}

      {/* ROLA GÖRƏ DİNAMİK MENYU TABLARI */}
      <div className="flex flex-wrap gap-2 mt-8 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Şəxsi Məlumatlar
        </button>

        <button 
          onClick={() => setActiveTab('pets')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'pets' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Mənim Heyvanlarım ({myPets.length})
        </button>

        {/* Əgər istifadəçi baytardırsa, bu tab görünür */}
        <button 
          onClick={() => setActiveTab('doctorPanel')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'doctorPanel' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
        >
          🩺 Baytar Paneli & Randevular
        </button>

        {/* Əgər istifadəçi maqazadırsa, bu tab görünür */}
        <button 
          onClick={() => setActiveTab('storePanel')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'storePanel' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
        >
          🛍️ Mağaza & Məhsul Satışı
        </button>
      </div>

      {/* ƏSAS KONTENT SAHƏSİ */}
      <div className="mt-8">
        
        {/* 1. ÜMUMI / ŞƏXSİ MƏLUMATLAR */}
        {activeTab === 'overview' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-xl space-y-5">
            <h3 className="text-lg font-black text-slate-900">Hesab Tənzimləmələri</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Ad Soyad</label>
              <input type="text" defaultValue={user?.fullName} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">E-poçt ünvanı</label>
              <input type="email" defaultValue={user?.email} disabled className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed" />
            </div>
            <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-sky-600/20 transition-all cursor-pointer">
              Dəyişiklikləri Yadda Saxla
            </button>
          </div>
        )}

        {/* 2. MƏNİM HEYVANLARIM (Müştəri öz heyvanını paylaşıb silə bilər) */}
        {activeTab === 'pets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Yeni Heyvan Paylaşma Formu */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl h-fit">
              <h3 className="text-md font-black text-slate-900 mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-sky-500" /> Yeni Heyvan Elanı Paylaş
              </h3>
              <form onSubmit={handleAddPet} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Heyvanın Adı</label>
                  <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Məs: Reks" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sky-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cinsi / Növü</label>
                  <input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="Məs: Golden Retriever" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sky-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Yaşı</label>
                  <input type="text" value={petAge} onChange={(e) => setPetAge(e.target.value)} placeholder="Məs: 1 yaş" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-sky-500" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-xs shadow-md cursor-pointer transition-all">
                  Paylaş
                </button>
              </form>
            </div>

            {/* Paylaşılan Heyvanların Siyahısı (Silmə funksiyası ilə) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-md font-black text-slate-900">Paylaşdığınız Heyvan Elanları</h3>
              {myPets.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 text-xs">
                  Hələ heç bir heyvan elanı paylaşmamısınız.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {myPets.map(pet => (
                    <div key={pet.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{pet.name}</h4>
                        <p className="text-xs text-slate-500">{pet.breed} • {pet.age}</p>
                      </div>
                      <button 
                        onClick={() => handleDeletePet(pet.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Elanı sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. BAYTAR PANELİ (Scroll olunan randevular və Məqalə yazma) */}
        {activeTab === 'doctorPanel' && (
          <div className="space-y-8">
            
            {/* Gələn Randevular (Scroll Siyahısı) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
              <h3 className="text-md font-black text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope size={18} className="text-emerald-600" /> Xəstələrdən Gələn Randevular
              </h3>
              
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                {/* Nümunə Randevu Elementi */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900">Pişik (Mestan) - Peyvənd</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">📅 28 İyul 2026, 14:00 | 📞 +994 50 123 45 67</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer">Qəbul</button>
                    <button className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 cursor-pointer">Ləğv</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Məqalə Yazıb Paylaşma Formu */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl max-w-2xl">
              <h3 className="text-md font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-emerald-600" /> PetCare Səhifəsi Üçün Məqalə Yaz
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); alert("Məqalə yayımlandı!"); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Başlıq</label>
                  <input type="text" value={articleTitle} onChange={(e) => setArticleTitle(e.target.value)} placeholder="Məs: İsti havada ev heyvanlarına qulluq" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Məzmun</label>
                  <textarea rows="4" value={articleContent} onChange={(e) => setArticleContent(e.target.value)} placeholder="Məqalə mətni..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs resize-none focus:outline-none focus:border-emerald-500" required></textarea>
                </div>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md cursor-pointer">
                  PetCare-də Yayımla
                </button>
              </form>
            </div>

          </div>
        )}

        {/* 4. MAĞAZA / PETSHOP PANELİ (Aksesuar, geyim, yem satışı) */}
        {activeTab === 'storePanel' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-amber-600" /> Mağaza Məhsullarının İdarə Edilməsi
                </h3>
                <p className="text-xs text-slate-500 mt-1">Heyvan yemləri, geyimləri və aksesuarlarını burdan əlavə edib sata bilərsən.</p>
              </div>
              <button className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer">
                + Yeni Məhsul Əlavə Et
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center py-10 text-xs text-slate-400">
                Hələ ki mağazanızda aktiv məhsul yoxdur.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Baytar və ya Mağaza Qeydiyyat Formu */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button onClick={() => setModalType(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold">✕</button>
            
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {modalType === 'vet' ? '🩺 Baytarlıq Qeydiyyatı' : '🛍️ PetShop Mağaza Qeydiyyatı'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">Məlumatları daxil edin və təsdiqə göndərin.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert("Müraciət göndərildi!"); setModalType(null); }} className="space-y-4">
              {modalType === 'vet' ? (
                <>
                  <input type="text" placeholder="Klinika Adı" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" required />
                  <input type="text" placeholder="İxtisas (Məs: Cərrah)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" required />
                  <input type="text" placeholder="Lisenziya Nömrəsi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" required />
                </>
              ) : (
                <>
                  <input type="text" placeholder="Mağaza Adı" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" required />
                  <input type="text" placeholder="VÖEN (Tax Number)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" required />
                  <input type="text" placeholder="Şəhər və Ünvan" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs" required />
                </>
              )}
              <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-xs shadow-md cursor-pointer">
                Müraciəti Göndər
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;