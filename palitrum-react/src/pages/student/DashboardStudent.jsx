import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Award,
  TrendingUp,
  Star,
} from "lucide-react";
import { fetchStudentGrades, fetchStudentPrograms } from "../../api/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Мини-компонент для одного дня с уроками
const DayColumn = ({ date, lessons }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex-1 min-w-[200px]">
    <div className="flex items-center gap-2 mb-2">
      <Calendar size={14} className="text-[#f6a623]" />
      <span className="font-semibold text-gray-700">
        {new Date(date).toLocaleDateString("ru-RU", {
          weekday: "short",
          day: "numeric",
        })}
      </span>
    </div>
    {lessons.length === 0 ? (
      <p className="text-xs text-gray-400">Нет занятий</p>
    ) : (
      lessons.map((lesson, idx) => (
        <div key={idx} className="mb-2 p-2 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">{lesson.title}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Clock size={12} />
            <span>
              {lesson.startTime?.substring(0, 5)}–{lesson.endTime?.substring(0, 5)}
            </span>
            <MapPin size={12} />
            <span>{lesson.roomName || "—"}</span>
          </div>
        </div>
      ))
    )}
  </div>
);

export default function DashboardStudent() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const studentId = user?.id;

  // Загрузка программ и успеваемости (используя существующие API функции)
  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Загружаем программы студента через существующую функцию
        const programsList = await fetchStudentPrograms(studentId);
        setPrograms(programsList);
        
        if (programsList.length > 0) {
          const activeProgramId = programsList[0].programId;
          setSelectedProgramId(activeProgramId);
          
          // Загружаем оценки через существующую функцию
          const gradesData = await fetchStudentGrades(studentId, activeProgramId);
          setGrades(gradesData);
          
          // Получаем преподавателя (если есть в данных программы)
          if (programsList[0].teacherName) {
            setTeacher(programsList[0].teacherName);
          }
        } else {
          // Если нет программ, пробуем загрузить оценки без programId
          const gradesData = await fetchStudentGrades(studentId, null);
          setGrades(gradesData);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        toast.error("Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Загрузка расписания
  useEffect(() => {
    if (!studentId) return;
    
    const fetchSchedule = async () => {
      try {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const start = today.toISOString().split("T")[0];
        const end = nextWeek.toISOString().split("T")[0];

        // Используем API из api/api или прямой вызов
        const API = (await import("../../api/api")).default;
        const response = await API.get(
          `/api/lessons/calendar?start=${start}&end=${end}&studentId=${studentId}`
        );
        const lessons = response.data;

        // Группировка по датам
        const grouped = {};
        lessons.forEach((l) => {
          const date = l.date;
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(l);
        });

        const result = [];
        // Ближайшие 3 дня
        for (let i = 0; i < 3; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split("T")[0];
          result.push({ date: dateStr, lessons: grouped[dateStr] || [] });
        }
        // Добавляем следующие дни с уроками
        Object.keys(grouped)
          .sort()
          .forEach((date) => {
            if (!result.find((r) => r.date === date)) {
              result.push({ date, lessons: grouped[date] });
            }
          });

        setSchedule(result.slice(0, 4));
      } catch (err) {
        console.error("Ошибка загрузки расписания:", err);
        toast.error("Не удалось загрузить расписание");
      }
    };
    
    fetchSchedule();
  }, [studentId]);

  // Преобразуем оценки в формат для отображения
  const gradesList = grades.map(item => ({
    subjectId: item.subjectId,
    subjectName: item.subjectName,
    averageGrade: item.averageGrade || 0,
    absences: item.absences || 0
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 lg:p-8">
          {/* Закреплённая шапка */}
          <div className="sticky top-0 z-10 bg-gray-50 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 mb-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {user?.firstName?.[0] || "У"}
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                    Добрый день, {user?.firstName || "Ученик"}!
                  </h1>
                  {teacher && (
                    <p className="text-gray-500 mt-1">
                      Преподаватель: {teacher}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/student/progress"
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <TrendingUp size={16} /> Успеваемость
                </Link>
                <Link
                  to="/student/schedule"
                  className="px-4 py-2 bg-[#f6a623] text-white rounded-xl shadow-sm hover:bg-[#ad7822] transition flex items-center gap-2 text-sm font-medium"
                >
                  <Calendar size={16} /> Всё расписание
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
            </div>
          ) : (
            <>
              {/* Расписание на ближайшие дни */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                  <Calendar size={20} className="text-[#f6a623]" /> Ближайшие занятия
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {schedule.length > 0 ? (
                    schedule.map((day) => (
                      <DayColumn key={day.date} date={day.date} lessons={day.lessons} />
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Нет ближайших занятий</p>
                  )}
                </div>
              </div>

              {/* Сетка с оценками и прочим */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Оценки - с переходом на страницу успеваемости */}
                <Link 
                  to="/student/progress"
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all cursor-pointer block"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Star size={20} className="text-[#f6a623]" /> Мои оценки
                    </h2>
                    <span className="text-xs text-[#f6a623] font-medium">Подробнее →</span>
                  </div>
                  <div className="space-y-2">
                    {gradesList.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Пока нет оценок
                      </p>
                    ) : (
                      gradesList.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                            {item.subjectName}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium text-lg ${
                              item.averageGrade >= 4 ? "text-[#f6a623]" : 
                              item.averageGrade >= 3 ? "text-yellow-600" : 
                              "text-yellow-800"
                            }`}>
                              {item.averageGrade > 0 ? item.averageGrade.toFixed(1) : "—"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    {gradesList.length > 4 && (
                      <div className="text-center pt-2">
                        <span className="text-xs text-gray-400">и ещё {gradesList.length - 4} предметов...</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Домашние задания (заглушка) */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-500" /> Домашние задания
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-600">— Сольфеджио: упр. 45</li>
                    <li className="text-sm text-gray-600">— Скрипка: Этюд №5</li>
                    <li className="text-sm text-gray-400 italic mt-2">
                      Скоро появится раздел с заданиями от преподавателя
                    </li>
                  </ul>
                </div>

                {/* Конкурсы / события */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-md border border-indigo-100 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Award size={28} className="text-indigo-600" />
                    <h2 className="font-semibold text-lg">Конкурсы</h2>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Городской конкурс скрипачей — приём заявок до 20 декабря
                  </p>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
                    Подробнее
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <style>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}