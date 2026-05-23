// src/pages/student/StudentProgressPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import { fetchStudentGrades, fetchStudentGradeDetails, fetchStudentPrograms } from "../../api/api";
import { toast } from "react-toastify";
import { Star, TrendingDown, Activity, X, ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const attendanceLabels = {
  PRESENT: "Присутствовал",
  ABSENT: "Отсутствовал",
  LATE: "Опоздал",
  EXCUSED: "По уваж. причине",
};

export default function StudentProgressPage() {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];
  const isParent = userRoles.includes("PARENT");

  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId") || user?.id;

  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const progList = await fetchStudentPrograms(studentId);
        setPrograms(progList);
        if (progList.length === 1) {
          setSelectedProgramId(progList[0].programId);
        }
      } catch (err) {
        toast.error("Не удалось загрузить программы");
      }
    })();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchStudentGrades(studentId, selectedProgramId);
        setGrades(data);
      } catch (err) {
        toast.error("Не удалось загрузить успеваемость");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, selectedProgramId]);

  const openDetails = async (subject) => {
    setSelectedSubject(subject);
    setDetailsLoading(true);
    try {
      const data = await fetchStudentGradeDetails(studentId, subject.subjectId, null, selectedProgramId);
      setDetails(data);
    } catch (err) {
      toast.error("Не удалось загрузить детальные оценки");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedSubject(null);
    setDetails([]);
  };

  const headerTitle = isParent ? "Успеваемость ребёнка" : "Успеваемость";
  const backLink = isParent ? "/parent/dashboard" : "/student";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              to={backLink}
              className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border rounded-lg px-3 py-2 hover:bg-gray-100 transition shadow-sm"
            >
              <ArrowLeft size={16} className="text-[#f6a623]" />
              На главную
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">{headerTitle}</h1>
          </div>

          {programs.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedProgramId(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedProgramId === null
                    ? "bg-[#f6a623] text-white shadow"
                    : "bg-white text-gray-600 border hover:bg-gray-100"
                }`}
              >
                Все программы
              </button>
              {programs.map((p) => (
                <button
                  key={p.programId}
                  onClick={() => setSelectedProgramId(p.programId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedProgramId === p.programId
                      ? "bg-[#f6a623] text-white shadow"
                      : "bg-white text-gray-600 border hover:bg-gray-100"
                  }`}
                >
                  {p.programName}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Activity size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Данные об успеваемости пока отсутствуют</p>
            </div>
          ) : (
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-[600px] w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Предмет</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-[#f6a623]" /> Средний балл
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-1">
                        <TrendingDown size={14} className="text-red-500" /> Пропуски
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grades.map((item) => (
                    <tr
                      key={item.subjectId}
                      onClick={() => openDetails(item)}
                      className="hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">{item.subjectName}</td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${item.averageGrade >= 4 ? "text-green-600" : item.averageGrade >= 3 ? "text-yellow-600" : "text-red-600"}`}>
                          {item.averageGrade > 0 ? item.averageGrade.toFixed(1) : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.absences > 0 ? (
                          <span className="text-red-600 font-medium">{item.absences}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeDetails}>
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Оценки по предмету «{selectedSubject.subjectName}»
              </h2>
              <button onClick={closeDetails} className="p-1 rounded-full hover:bg-gray-100 transition text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh] scrollbar-hide">
              {detailsLoading ? (
                <p className="text-gray-500">Загрузка...</p>
              ) : details.length === 0 ? (
                <p className="text-gray-500">Нет оценок за текущий период</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Дата</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Время</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Группа</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Оценка</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Посещ.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {details.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{new Date(item.date).toLocaleDateString("ru-RU")}</td>
                        <td className="px-4 py-2 text-sm">{item.time?.substring(0, 5)}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.groupName || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">{item.gradeValue}</td>
                        <td className="px-4 py-2 text-sm">
                            {item.attendanceStatus === "PRESENT"
                            ? "✓"
                            : attendanceLabels[item.attendanceStatus] || item.attendanceStatus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

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