import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Calendar, Award, BookOpen, 
  AlertCircle, Send, User, ChevronRight, Sparkles, Plus, X, Search, Phone, Mail, Globe, MapPin 
} from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../context/AuthContext';

const PetCare = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('veterinarians');
  const [veterinarians, setVeterinarians] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Həkim detalları üçün modal state
  const [selectedVetDetail, setSelectedVetDetail] = useState(null);

  // Randevu Form State-ləri
  const [petInfo, setPetInfo] = useState(''); 
  const [clientPhone, setClientPhone] = useState(''); 
  const [vetSearchQuery, setVetSearchQuery] = useState('');
  const [selectedVetId, setSelectedVetId] = useState('');
  const [serviceType, setServiceType] = useState('Ümumi Müayinə');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vetRes, articleRes] = await Promise.all([
        API.get('/Veterinarians').catch(() => ({ data: [] })),
        API.get('/PetCareArticles').catch(() => ({ data: [] }))
      ]);

      const extract = (res) => {
        const raw = res?.data;
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray(raw.$values)) return raw.$values;
        return [];
      };

      setVeterinarians(extract(vetRes));
      setArticles(extract(articleRes));
    } catch (err) {
      console.error("Məlumatları çəkərkən xəta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();

    if (!petInfo || !clientPhone || !selectedVetId || !appointmentDate) {
      setMessage({ text: "Zəhmət olmasa bütün vacib sahələri doldurun.", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ text: '', type: '' });

      await API.post('/VetAppointments', {
        userId: user?.id || 1,
        petShopId: Number(selectedVetId),
        petInfo: petInfo,
        clientPhone: clientPhone,
        serviceType: serviceType,
        appointmentDate: appointmentDate,
        notes: notes || ""
      });

      setMessage({ text: "Randevunuz uğurla qeydə alındı!", type: "success" });
      setPetInfo('');
      setClientPhone('');
      setNotes('');
      setAppointmentDate('');
      setVetSearchQuery('');
      setSelectedVetId('');
    } catch (err) {
      console.error("Randevu xətası:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || "Seçdiyiniz tarix və saat üçün artıq randevu mövcuddur. Zəhmət olmasa başqa vaxt seçin.";
      setMessage({ text: typeof errorMsg === 'string' ? errorMsg : "Seçdiyiniz tarix və saatda artıq başqa randevu var.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVets = veterinarians.filter(v => {
    const vetName = v.user?.fullName || v.fullName || '';
    const clinicName = v.clinicName || v.petShopName || '';
    const specialty = v.specialty || '';
    const query = vetSearchQuery.toLowerCase();
    return vetName.toLowerCase().includes(query) || 
           clinicName.toLowerCase().includes(query) || 
           specialty.toLowerCase().includes(query);
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      {/* Header Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black">Dostunuzun Sağlamlığı Etibarlı Əllərdə</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">Peşəkar baytar həkimlərimizdən anında randevu alın və ya faydalı məqalələri oxuyun.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button 
              onClick={() => setActiveTab('veterinarians')} 
              className={`px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all ${activeTab === 'veterinarians' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Baytarlar
            </button>
            <button 
              onClick={() => setActiveTab('appointment')} 
              className={`px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all ${activeTab === 'appointment' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Randevu Təyin Et
            </button>
            <button 
              onClick={() => setActiveTab('articles')} 
              className={`px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all ${activeTab === 'articles' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              Məqalələr
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        
        {/* TAB 1: VETERINARIANS */}
        {activeTab === 'veterinarians' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900">Mütəxəssis Baytarlarımız</h2>
              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="Həkim və ya klinikaya görə axtar..." 
                  value={vetSearchQuery}
                  onChange={(e) => setVetSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-sm shadow-sm focus:outline-none"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400 font-medium">Yüklənir...</div>
            ) : filteredVets.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <p className="text-slate-500 font-semibold text-sm">Heç bir həkim tapılmadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredVets.map((vet) => {
                  const name = vet.user?.fullName || vet.fullName || "Baytar Həkim";
                  const clinic = vet.clinicName || vet.petShopName || "ViviVet Klinika";
                  const specialty = vet.specialty || "Ümumi Baytarlıq";
                  const bio = vet.bio || "Məlumat qeyd olunmayıb.";
                  const experience = vet.experienceYears || 3;
                  const phone = vet.phoneNumber || vet.phone || vet.user?.phoneNumber || "+994 12 000 00 00";

                  return (
                    <div 
                      key={vet.id} 
                      onClick={() => setSelectedVetDetail(vet)}
                      className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={vet.imageUrl || vet.user?.imageUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"} 
                            alt={name} 
                            className="w-16 h-16 rounded-2xl object-cover border shadow-inner"
                          />
                          <div>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md flex items-center gap-1 w-fit mt-0.5">
                              <MapPin size={10} /> {clinic}
                            </span>
                            <h3 className="text-lg font-black text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors">{name}</h3>
                            <p className="text-blue-600 font-bold text-xs">{specialty}</p>
                          </div>
                        </div>

                        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{bio}</p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Phone size={12} className="text-blue-600" /> {phone}
                        </span>
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1">Ətraflı <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPOINTMENT */}
        {activeTab === 'appointment' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Baytarlıq Randevusu Təyin Et</h2>
            <p className="text-xs text-slate-500 text-center mb-6">Seçdiyiniz tarix və saatda həkimin başqa randevusu varsa sistem xəta verəcək.</p>

            {message.text && (
              <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-6 ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                <AlertCircle size={18} className="shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleAppointmentSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Ev Heyvanınızın Məlumatı</label>
                  <input 
                    type="text"
                    value={petInfo}
                    onChange={(e) => setPetInfo(e.target.value)}
                    placeholder="Məsələn: Pişik - Mələk"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Telefon Nömrəniz</label>
                  <input 
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+994 50 123 45 67"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Həkim Seç</label>
                  <input 
                    type="text"
                    placeholder="Həkim adı yazın..."
                    value={vetSearchQuery}
                    onChange={(e) => {
                      setVetSearchQuery(e.target.value);
                      setSelectedVetId('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-10 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                    required
                  />
                  <Search size={16} className="absolute left-3.5 top-11 text-slate-400" />

                  {vetSearchQuery && !selectedVetId && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredVets.map(v => (
                        <div 
                          key={v.id}
                          onClick={() => {
                            setVetSearchQuery(v.user?.fullName || v.fullName);
                            setSelectedVetId(v.id);
                          }}
                          className="p-3.5 hover:bg-blue-50 text-xs font-semibold cursor-pointer border-b last:border-none"
                        >
                          {v.user?.fullName || v.fullName} - <span className="text-blue-600">{v.specialty}</span> ({v.clinicName || v.petShopName})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Xidmət Növü</label>
                  <select 
                    value={serviceType} 
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="Ümumi Müayinə">Ümumi Müayinə</option>
                    <option value="Peyvəndləmə">Peyvəndləmə</option>
                    <option value="Cərrahiyyə / Sterilizasiya">Cərrahiyyə / Sterilizasiya</option>
                    <option value="Diş Təmizliyi və Baxımı">Diş Təmizliyi və Baxımı</option>
                    <option value="Parazit Müalicəsi">Parazit Müalicəsi</option>
                    <option value="Dəri və Tük Müalicəsi">Dəri və Tük Müalicəsi</option>
                    <option value="Laboratoriya Analizi">Laboratoriya Analizi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tarix və Saat</label>
                <input 
                  type="datetime-local" 
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Əlavə Qeydlər (İstəyə bağlı)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Heyvanda hər hansı bir narahatlıq varsa qeyd edin..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-600 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 cursor-pointer text-sm transition-all"
              >
                {submitting ? 'Yoxlanılır və Göndərilir...' : 'Randevu Təsdiqlə'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ARTICLES */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Faydalı Məqalələr</h2>
            {articles.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <p className="text-slate-500 font-semibold text-sm">Hələ ki heç bir məqalə əlavə olunmayıb.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((art) => (
                  <div key={art.id} className="bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                    {art.imageUrl && <img src={art.imageUrl} alt={art.title} className="w-full h-48 object-cover" />}
                    <div className="p-6 flex flex-col justify-between flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{art.title}</h3>
                        <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">{art.content}</p>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 pt-2">{new Date(art.createdDate || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* HƏKİM DETAL MODALI */}
      {selectedVetDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative space-y-6">
            <button 
              onClick={() => setSelectedVetDetail(null)} 
              className="absolute top-6 right-6 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <img 
                src={selectedVetDetail.imageUrl || selectedVetDetail.user?.imageUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"} 
                className="w-20 h-20 rounded-2xl object-cover border shadow-sm" 
                alt="Vet" 
              />
              <div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                  <MapPin size={10} /> {selectedVetDetail.clinicName || selectedVetDetail.petShopName || "ViviVet Klinika"}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">{selectedVetDetail.user?.fullName || selectedVetDetail.fullName}</h3>
                <p className="text-blue-600 font-bold text-xs">{selectedVetDetail.specialty}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Təcrübə</span>
                <p className="text-sm font-black text-slate-800">{selectedVetDetail.experienceYears || 3} il</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Əlaqə Nömrəsi</span>
                <p className="text-sm font-black text-slate-800">{selectedVetDetail.phoneNumber || selectedVetDetail.phone || selectedVetDetail.user?.phoneNumber || "+994 50 000 00 00"}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Həkim Haqqında / Bio</h4>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {selectedVetDetail.bio || "Məlumat qeyd olunmayıb."}
              </p>
            </div>

            <button 
              onClick={() => {
                setSelectedVetId(selectedVetDetail.id);
                setVetSearchQuery(selectedVetDetail.user?.fullName || selectedVetDetail.fullName);
                setSelectedVetDetail(null);
                setActiveTab('appointment');
              }} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl cursor-pointer text-sm shadow-lg shadow-blue-600/20 transition-all"
            >
              Bu Həkimə Randevu Götür
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetCare;