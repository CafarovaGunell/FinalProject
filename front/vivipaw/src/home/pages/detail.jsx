import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';

// React Icons
import { 
  FiArrowLeft, FiHeart, FiMapPin, FiPhone, FiMail, 
  FiInstagram, FiShare2, FiTag, FiShield, FiClock, 
  FiCheck, FiExternalLink, FiInfo, FiAlertCircle, FiSend, FiX 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Adoption Modal State-ləri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    housingType: 'Ev',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);

    axios.get(`http://localhost:5123/api/Animals/${id}`)
      .then(res => {
        setPet(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Məlumat yüklənərkən xəta:", err);
        setError("Elan tapılmadı və ya serverlə əlaqə kəsildi.");
        setLoading(false);
      });
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  // Müraciət formasının göndərilməsi
  const handleAdoptSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Backend-də yaradacağın AdoptionRequests API endpoint-i
      await axios.post('http://localhost:5123/api/AdoptionRequests', {
        petId: parseInt(id),
        userId: 1, // Əgər Auth sistemin varsa buraya daxil olan istifadəçinin ID-si gəlir
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        housingType: formData.housingType,
        reason: formData.reason
      });
      
      setSuccessMessage("Müraciətiniz uğurla göndərildi! Tezliklə sizinlə əlaqə saxlanılacaq.");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
        setFormData({ fullName: '', phone: '', address: '', housingType: 'Ev', reason: '' });
      }, 3000);
    } catch (err) {
      console.error("Müraciət göndərilərkən xəta:", err);
      alert("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
        <p className="text-sm font-semibold animate-pulse">Məlumatlar yüklənir...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
        <div className="bg-rose-50 text-rose-500 p-4 rounded-full mb-3">
          <FiAlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Xəta Baş Verdi</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/adopt')} 
          className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200"
        >
          Bütün Elanlara Qayıt
        </button>
      </div>
    );
  }

  const mapUrl = pet.latitude && pet.longitude 
    ? `https://www.google.com/maps?q=${pet.latitude},${pet.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pet.petShopAddress || pet.location)}`;

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Üst Naviqasiya & Düymələr */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <FiArrowLeft size={16} /> Geri
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              {copied ? <FiCheck size={16} className="text-emerald-600" /> : <FiShare2 size={16} />}
              <span className="hidden sm:inline">{copied ? "Kopyalandı!" : "Paylaş"}</span>
            </button>

            <button 
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl border transition-all shadow-sm ${
                isFavorite 
                  ? 'bg-rose-50 border-rose-200 text-rose-500' 
                  : 'bg-white border-slate-200/80 text-slate-400 hover:text-rose-500'
              }`}
            >
              <FiHeart size={16} className={isFavorite ? 'fill-rose-500' : ''} />
            </button>
          </div>
        </div>

        {/* ƏSAS KART / ŞƏKİL VƏ İNFO */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Sol: Şəkil */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] border border-slate-100">
              <img 
                src={pet.imageUrl || '/placeholder-pet.jpg'} 
                alt={pet.name} 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-lg text-white uppercase tracking-wider shadow-sm ${
                  pet.isUrgent ? 'bg-rose-500' : 'bg-indigo-600'
                }`}>
                  {pet.isUrgent ? 'Təcili' : 'Aktiv'}
                </span>

                {pet.isAdopted && (
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-lg bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                    Sahibləndirildi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sağ: Məlumat Paneli */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
                <FiTag size={12} />
                <span>{pet.categoryName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pet.name}</h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
                {pet.breed} • {pet.gender}
              </p>
            </div>

            {/* Özəlliklər */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Yaş</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{pet.ageText}</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Cinsiyyət</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{pet.gender}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Məkan</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">{pet.location}</p>
              </div>
            </div>

            {/* Tarix */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pt-1">
              <FiClock size={14} />
              <span>Elan tarixi: {pet.dateText}</span>
            </div>

            {/* Əlaqə və Övladlığa Götürmə Düymələri */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              
              {/* Yeni Övladlığa Götürmə Müraciət Düyməsi */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                <FiHeart size={16} /> Övladlığa Götürmək Üçün Müraciət Et
              </button>

              {pet.petShopPhone ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a 
                    href={`tel:${pet.petShopPhone}`}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <FiPhone size={15} /> Zəng Et
                  </a>
                  
                  <a 
                    href={`https://wa.me/${pet.petShopPhone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                  >
                    <FaWhatsapp size={16} /> WhatsApp
                  </a>
                </div>
              ) : null}
            </div>

          </div>
        </div>

        {/* PETSHOP / SIĞINACAQ & ÜNVAN KARTU */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FiShield className="text-indigo-600" size={18} /> Sahibləndirən Qurum / PetShop
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-3.5">
              <img 
                src={pet.petShopLogo || '/placeholder-logo.png'} 
                alt={pet.petShopName} 
                className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{pet.petShopName}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <FiMapPin size={13} className="text-slate-400" /> {pet.petShopAddress || 'Ünvan qeyd olunmayıb'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
              {pet.petShopInstagram && (
                <a 
                  href={`https://instagram.com/${pet.petShopInstagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-pink-600 hover:border-pink-200 transition-all shadow-sm"
                >
                  <FiInstagram size={16} />
                </a>
              )}

              {pet.petShopEmail && (
                <a 
                  href={`mailto:${pet.petShopEmail}`}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                >
                  <FiMail size={16} />
                </a>
              )}

              <a 
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
              >
                <FiExternalLink size={14} /> Xəritədə Bax
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ÖVLADLIĞA GÖTÜRMƏ MÜRACİƏT MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <FiX size={18} />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Övladlığa Götürmə Müraciəti</h3>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-bold text-indigo-600">{pet.name}</span> üçün müraciət formasını doldurun.
              </p>
            </div>

            {successMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-bold text-center space-y-2">
                <FiCheck size={24} className="mx-auto text-emerald-600" />
                <p>{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleAdoptSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ad və Soyad</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Məs: Əli Məmmədov"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Əlaqə Nömrəsi</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+994 50 123 45 67"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Yaşayış Növü</label>
                    <select 
                      value={formData.housingType}
                      onChange={(e) => setFormData({...formData, housingType: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-all"
                    >
                      <option value="Ev">Ev (Şəxsi)</option>
                      <option value="Kirayə">Kirayə Ev</option>
                      <option value="Həyət evi">Həyət Evi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Şəhər / Ünvan</label>
                    <input 
                      type="text" 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Bakı ş."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Niyə bu heyvanı istəyirsiniz?</label>
                  <textarea 
                    rows="3"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Qısa məlumat yazın..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600 transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  <FiSend size={15} /> {submitting ? 'Göndərilir...' : 'Müraciəti Təsdiq Et'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PetDetail;