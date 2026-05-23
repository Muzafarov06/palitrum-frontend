import React, { useEffect, useState } from "react";
import StaticPage from "../../components/common/StaticPage";
import { MapPin, Phone, Mail, GraduationCap, Clock, BookOpen, Layers, ChevronRight } from "lucide-react";
import { fetchDepartments, fetchProgramsByDepartment, getPublicSettings } from "../../api/api";

const DEFAULT_PROGRAM_IMG = "/default-program.png";

function formatYears(n) {
  if (!n) return null;
  if (n === 1) return '1 год';
  if (n >= 2 && n <= 4) return `${n} года`;
  return `${n} лет`;
}

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [orgName, setOrgName] = useState("ДШИ «Ермолино»");
  const [contacts, setContacts] = useState({
    address: '173517, Новгородская обл., д. Ермолино, д.33б',
    phone: '8(8162) 747731',
    email: 'dshi.ermolino@mail.ru',
    workingHours: 'Пн-Пт: 9:00-20:00, Сб: 9:00-16:00',
    head: '',
    secretary: ''
  });

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getPublicSettings();
      if (settings) {
        if (settings.orgName) setOrgName(settings.orgName);
        setContacts(prev => ({
          address: settings.address || prev.address,
          phone: settings.phone || prev.phone,
          email: settings.email || prev.email,
          workingHours: settings.workingHours || prev.workingHours,
          head: settings.head || prev.head,
          secretary: settings.secretary || prev.secretary
        }));
      }
    } catch (err) {
      console.warn('Не удалось загрузить настройки');
    }
  };

  const loadData = async () => {
    try {
      const depts = await fetchDepartments();
      setDepartments(depts || []);
      
      const progMap = {};
      for (const dept of depts) {
        try {
          const progs = await fetchProgramsByDepartment(dept.id);
          progMap[dept.id] = progs || [];
        } catch {
          progMap[dept.id] = [];
        }
      }
      setProgramsMap(progMap);
    } catch (error) {
      console.error("Ошибка загрузки отделений:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaticPage title={`Отделения ${orgName}`}>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#f6a623] border-t-transparent rounded-full animate-spin" />
          <p className="ml-3 text-gray-500">Загрузка отделений...</p>
        </div>
      </StaticPage>
    );
  }

  return (
    <StaticPage title={`Отделения ${orgName}`}>
      {/* Информация об учреждении */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-white to-orange-50 rounded-3xl p-8 shadow-xl border border-orange-100/50 mb-12">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#f6a623]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#f6a623]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#f6a623]/10 rounded-2xl">
              <GraduationCap size={28} className="text-[#f6a623]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{orgName}</h2>
              <p className="text-gray-500 text-sm mt-0.5">Государственное образовательное учреждение</p>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
              <MapPin size={18} className="text-[#f6a623] mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 text-sm">{contacts.address}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
              <Phone size={18} className="text-[#f6a623] flex-shrink-0" />
              <span className="text-gray-600 text-sm">{contacts.phone}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
              <Mail size={18} className="text-[#f6a623] flex-shrink-0" />
              <span className="text-gray-600 text-sm">{contacts.email}</span>
            </div>
            {contacts.workingHours && (
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <Clock size={18} className="text-[#f6a623] flex-shrink-0" />
                <span className="text-gray-600 text-sm">{contacts.workingHours}</span>
              </div>
            )}
            {(contacts.head || contacts.secretary) && (
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl sm:col-span-2">
                <Layers size={18} className="text-[#f6a623] flex-shrink-0" />
                <span className="text-gray-600 text-sm">
                  <b>Руководство:</b> {[contacts.head, contacts.secretary].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl">
          <Layers size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Отделения пока не добавлены</p>
        </div>
      ) : (
        <div className="space-y-16">
          {departments.map((dept) => {
            const programs = programsMap[dept.id] || [];
            
            return (
              <div key={dept.id} className="animate-fadeIn">
                {/* Заголовок отделения */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-1.5 bg-gradient-to-b from-[#f6a623] to-orange-300 rounded-full" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {dept.name}
                      <span className="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {programs.length} {programs.length === 1 ? 'программа' : 
                          programs.length >= 2 && programs.length <= 4 ? 'программы' : 'программ'}
                      </span>
                    </h2>
                    {dept.description && (
                      <p className="text-gray-500 mt-1 max-w-2xl">{dept.description}</p>
                    )}
                  </div>
                </div>

                {/* Программы отделения */}
                {programs.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
                    <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400">В этом отделении пока нет программ</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((prog) => (
                      <div 
                        key={prog.id} 
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={prog.imageUrl || DEFAULT_PROGRAM_IMG} 
                            alt={prog.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { e.target.src = DEFAULT_PROGRAM_IMG; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {prog.durationYears && (
                            <div className="absolute top-3 right-3 bg-[#f6a623] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                              <Clock size={12} /> 
                              {formatYears(prog.durationYears)}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#f6a623] transition-colors">
                            {prog.name}
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                            {prog.description || "Описание программы появится позже"}
                          </p>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-[#f6a623] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Подробнее <ChevronRight size={16} className="ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </StaticPage>
  );
}