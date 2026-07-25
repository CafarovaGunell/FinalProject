import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ShieldCheck, XCircle, Plus, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // API-dan istifadəçinin randevularını çəkmək
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // İstifadəçi ID-si 1 olaraq qəbul edilir (Auth sisteminə görə dəyişə bilər)
        const response = await axios.get('http://localhost:5123/api/VetAppointments/user/1');
        setAppointments(response.data);
      } catch (err) {
        console.error("Randevular yüklənərkən xəta:", err);
        // Əgər backend hələ hazır deyilsə, dizaynı test etmək üçün saxta məlumatlar veririk
        setAppointments(getMockAppointments());
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Test məqsədli Mock Data (Backend qoşulana qədər görünməsi üçün)
  const getMockAppointments = () => [
    {
      id: 1,
      petShopName: "Luna Vet & PetShop",
      petShopAddress: "Nizami küç. 42, Bakı",
      serviceType: "Ümumi Müayinə",
      appointmentDate: "2026-06-15T14:30:00",
      status: "Təsdiqləndi",
      notes: "Püşüyün peyvənd vaxtıdır, ümumi yoxlanış olunacaq."
    },
    {
      id: 2,
      petShopName: "Happy Paws Klinika",
      petShopAddress: "Bülbül pr. 12, Bakı",
      serviceType: "Baxım & Grooming",
      appointmentDate: "2026-06-20T11:00:00",
      status: "Gözləmədə",
      notes: "Tük kəsimi və dırnaq təmizliyi."
    }
  ];

  // Randevunun ləğv edilməsi funksiyası
  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Bu randevunu ləğv etmək istədiyinizə əminsinizmi?")) return;
    
    try {
      await axios.delete(`http://localhost:5123/api/VetAppointments/${id}`);
      setAppointments(appointments.filter(app => app.id !== id));
    } catch (err) {
      console.error("Ləğv edərkən xəta baş verdi:", err);
      // Əgər backend yoxdursa sadəcə UI-dan silək ki, dizayn işlədiyini görə biləsən
      setAppointments(appointments.filter(app => app.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Randevularınız yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Üst Başlıq hissəsi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar size={14} /> Şəxsi Kabinet
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Mənim Randevularım</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Baytarlıq və baxım mərkəzlərinə aldığınız aktiv randevuları buradan izləyin.
            </p>
          </div>

          <Link 
            to="/petcare" 
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus size={16} /> Yeni Randevu Al
          </Link>
        </div>

        {/* Randevular siyahısı */}
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((item) => {
              const formattedDate = new Date(item.appointmentDate).toLocaleString('az-AZ', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              const isConfirmed = item.status === 'Təsdiqləndi';

              return (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider ${
                        isConfirmed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.serviceType}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{item.petShopName}</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{item.petShopAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="flex items-start gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600">
                        <FileText size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p><strong className="text-slate-700">Qeyd:</strong> {item.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center justify-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button 
                      onClick={() => handleCancelAppointment(item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-all"
                    >
                      <XCircle size={16} /> Randevunu Ləğv Et
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Calendar size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aktiv randevunuz yoxdur</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              Dostunuzun sağlamlığı üçün dərhal baytarlıq mərkəzlərimizdən vaxt ayıra bilərsiniz.
            </p>
            <div className="pt-2">
              <Link 
                to="/petcare" 
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                Randevulara Bax
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Appointments;