import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";
import Header from "./components/Header";
import StaffPage from "./pages/manager/StaffPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import StudentProgramsPage from "./pages/manager/StudentProgramsPage";
import GroupsPage from "./pages/manager/GroupsPage";
import Hero from "./components/Hero";
import PositionsPage from "./pages/manager/PositionsPage";
import TeacherLoadPage from "./pages/manager/TeacherLoadPage";
import ParentDashboard from "./pages/parent/DashboardParent";
import StudentSchedulePage from "./pages/student/StudentSchedulePage";
import StudentProgressPage from "./pages/student/StudentProgressPage";
import TeacherJournalPage from "./pages/teacher/TeacherJournalPage";
import ScheduleTemplatesPage from "./pages/manager/ScheduleTemplatesPage";
import SchedulePage from "./pages/manager/SchedulePage";
import FilesPage from "./pages/manager/FilesPage";
import RoomsPage from "./pages/manager/RoomsPage";
import ProgramsGrid from "./components/ProgramsGrid";

import LocationsGrid from "./components/LocationsGrid";
import EventsGrid from "./components/EventsGrid";
import Teachers from "./components/Teachers";
import FAQ from "./components/FAQ";
import ManagerNewsPage from "./pages/manager/NewsPage";   // тот самый компонент, который мы написали
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import LocationMap from "./components/LocationMap";
import TeacherDashboard from "./pages/teacher/DashboardTeacher";
import RolesPermissionsPage from "./pages/manager/RolesPermissionsPage";
// --- Статические страницы ---
import BasicInfoPage from "./pages/static/BasicInfoPage";
import StructureAndManagementPage from "./pages/static/StructureAndManagementPage";
import DocumentsPage from "./pages/static/DocumentsPage";
import EducationPage from "./pages/static/EducationPage";
import FacilitiesPage from "./pages/static/FacilitiesPage";
import FinancialPage from "./pages/static/FinancialPage";
import VacantPlacesPage from "./pages/static/VacantPlacesPage";
import ScholarshipsPage from "./pages/static/ScholarshipsPage";
import InternationalCooperationPage from "./pages/static/InternationalCooperationPage";
import EducationalStandardsPage from "./pages/static/EducationalStandardsPage";
import OrganizationFoodPage from "./pages/static/OrganizationFoodPage";
import ContestsPage from "./pages/static/ContestsPage";
import NewsPage from "./pages/static/NewsPage";
import GalleryPage from "./pages/static/GalleryPage";
import ElectronicServicesPage from "./pages/static/ElectronicServicesPage";
import PersonalizedFundingPage from "./pages/static/PersonalizedFundingPage";
import DepartmentPage from "./pages/static/DepartmentPage";
import AdmissionPage from "./pages/static/AdmissionPage";
import GuestBookPage from "./pages/static/GuestBookPage";
import AppealsDispatcherPage from "./pages/static/AppealsDispatcherPage";
import QualityAssessmentPage from "./pages/static/QualityAssessmentPage";
import LaborProtectionPage from "./pages/static/LaborProtectionPage";
import AntiCorruptionPage from "./pages/static/AntiCorruptionPage";
import AntiCorruptionExpertisePage from "./pages/static/AntiCorruptionExpertisePage";
import MethodicalMaterialsPage from "./pages/static/MethodicalMaterialsPage";
import CorruptionFormsPage from "./pages/static/CorruptionFormsPage";
import IncomeInfoPage from "./pages/static/IncomeInfoPage";
import CommissionPage from "./pages/static/CommissionPage";
import AntiCorruptionFeedbackPage from "./pages/static/AntiCorruptionFeedbackPage";
import AntiCorruptionDocsPage from "./pages/static/AntiCorruptionDocsPage";
import FAQPage from "./pages/static/FAQPage";
import PddPage from "./pages/static/PddPage";
import MemoryWallPage from "./pages/static/MemoryWallPage";
import ParentInfoPage from "./pages/static/ParentInfoPage";

// --- Страницы приложения ---
import ApplyPage from "./pages/ApplicationForm";
import StudentDashboard from "./pages/student/DashboardStudent";
import AcademicPeriodsPage from "./pages/manager/AcademicPeriodsPage";
// --- CRUD и административные страницы ---
import UsersFullCrud from "./pages/admin/UsersFullCrud";
import StudentsPage from "./pages/manager/StudentsPage";
import ParentsPage from "./pages/manager/ParentsPage";
import TeachersPage from "./pages/manager/TeachersPage";
import DepartmentsCrud from "./pages/manager/DepartmentsPage";
import ProgramsPage from "./pages/manager/ProgramsPage";
import SubjectsCrud from "./pages/manager/SubjectsPage";
import ApplicationPage from "./pages/manager/ApplicationsPage";
import AdminDashboard from "./pages/admin/DashboardAdmin";
import ManagerDashboard from "./pages/manager/DashboardManager";
import ImportPage from "./pages/admin/ImportPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPrograms, fetchAllProgramsPublic, fetchTeachers, fetchPublicRooms, fetchLocations, fetchNews, fetchApplications } from "./api/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Заглушка для нереализованных страниц
function Page({ name }) {
  return (
    <main className="container pt-8">
      <h1 className="text-3xl font-bold mb-6">{name}</h1>
      <p>Контент страницы "{name}" пока не реализован.</p>
    </main>
  );
}

// ------------------- AppWrapper -------------------
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

// ------------------- App -------------------
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdminPage = location.pathname.startsWith("/admin") || 
                    location.pathname.startsWith("/manager") || 
                    location.pathname.startsWith("/super-admin") ||
                    location.pathname === "/applications" ||
                    location.pathname.startsWith("/teacher") ||
                    location.pathname.startsWith("/parent") ||
                    location.pathname === "/departments" ||  
                    location.pathname === "/news" || 
                    location.pathname === "/roles-permissions" || 
                    location.pathname === "/files" || 
                    location.pathname === "/academic-periods" || 
                    location.pathname === "/schedule-templates" ||
                    location.pathname === "/schedule" ||
                    location.pathname === "/positions" ||
                    location.pathname === "/staff" ||
                    location.pathname === "/groups" ||
                    location.pathname === "/student-programs" ||
                    location.pathname === "/journal" ||
                    location.pathname === "/settings";

const isStudentPage = location.pathname.startsWith("/student");

  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [eventsNews, setEventsNews] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingEventsNews, setLoadingEventsNews] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [programsError, setProgramsError] = useState(null);
  const [teachersError, setTeachersError] = useState(null);
  const [locationsError, setLocationsError] = useState(null);
  const [eventsNewsError, setEventsNewsError] = useState(null);
  const [applicationsError, setApplicationsError] = useState(null);

  // Загрузка данных для публичной части
  useEffect(() => {
    setLoadingPrograms(true);
    fetchAllProgramsPublic()
      .then((data) => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => setProgramsError("Не удалось загрузить программы"))
      .finally(() => setLoadingPrograms(false));

    setLoadingTeachers(true);
    fetchTeachers()
      .then((data) => setTeachers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.warn("Учителя недоступны без авторизации:", err);
        setTeachers([]); // или оставить пустым
      })
      .finally(() => setLoadingTeachers(false));

    setLoadingLocations(true);
    fetchPublicRooms()
      .then((data) => setLocations(data))
      .catch(() => setLocationsError("Не удалось загрузить кабинеты"))
      .finally(() => setLoadingLocations(false));

    setLoadingEventsNews(true);
fetchNews({ size: 100 })
  .then((data) => {
    const newsList = data.content || data || [];
    setEventsNews(Array.isArray(newsList) ? newsList : []);
  })
  .catch((err) => {
    console.warn("Ошибка загрузки новостей:", err);
    setEventsNews([]);
  })
  .finally(() => setLoadingEventsNews(false));

    setLoadingApplications(true);
    fetchApplications()
      .then((data) => setApplications(Array.isArray(data) ? data : data?.data || []))
      .catch(() => setApplicationsError("Не удалось загрузить заявки"))
      .finally(() => setLoadingApplications(false));
  }, []);

  // Редирект с корня в зависимости от роли
  useEffect(() => {
    if (!user) return;
    const roles = user.roles || [];

    if (location.pathname === "/") {
      if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) {
        navigate("/admin/dashboard", { replace: true });
      } else if (roles.some(r => ["MANAGER","DIRECTOR","MANAGERS_PROCESSING"].includes(r))) {
        navigate("/manager/dashboard", { replace: true });
      } else if (roles.includes("STUDENT")) {
        navigate("/student", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      {!isAdminPage && !isStudentPage && <Header />}

      <Routes>
        {/* Публичная главная страница */}
        <Route
          path="/"
          element={
            <main className="container pt-8">
              <Hero />
              <section className="mt-10">
                {loadingPrograms ? <p className="text-gray-500 text-center">Загрузка программ...</p> :
                 programsError ? <p className="text-red-500 text-center">{programsError}</p> :
                 <ProgramsGrid items={programs} />}
              </section>
              <section className="mt-12">
                {loadingLocations ? <p className="text-gray-500 text-center">Загрузка кабинетов...</p> :
                 locationsError ? <p className="text-red-500 text-center">{locationsError}</p> :
                 <LocationsGrid items={locations} />}
              </section>
              <section className="mt-12">
                {loadingEventsNews ? <p className="text-gray-500 text-center">Загрузка мероприятий...</p> :
                 eventsNewsError ? <p className="text-red-500 text-center">{eventsNewsError}</p> :
                 <EventsGrid items={eventsNews} />}
              </section>
              <section><FAQ /></section>
              <section><Testimonials /></section>
              <section className="mt-12"><LocationMap /></section>
            </main>
          }
        />


        <Route path="/apply" element={<ApplyPage />} />

        {/* Дашборд админа */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <AdminLayout>
                <AdminDashboard applications={applications} loading={loadingApplications} error={applicationsError} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/import"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER"]}>
              <AdminLayout>
                <ImportPage/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/journal" element={
          <ProtectedRoute roles={["TEACHER"]}>
            <AdminLayout>
              <TeacherJournalPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/schedule" element={
          <ProtectedRoute>
            <AdminLayout>
              <SchedulePage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        {/* Дашборд менеджера */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER"]}>
              <AdminLayout>
                <ManagerDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/staff" element={
          <ProtectedRoute roles={["SUPER_ADMIN","MANAGER", "TEACHER"]}>
            <AdminLayout><StaffPage /></AdminLayout>
          </ProtectedRoute>
        } />
        


        <Route path="/settings" element={
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <AdminLayout><SystemSettingsPage /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/positions" element={
          <ProtectedRoute roles={["SUPER_ADMIN","MANAGER", "TEACHER"]}>
            <AdminLayout><PositionsPage /></AdminLayout>
          </ProtectedRoute>
        } />

        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute roles={["PARENT"]}>
              <AdminLayout>
                <ParentDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/student/schedule"
          element={
            <ProtectedRoute roles={["STUDENT", "PARENT"]}>
              <StudentSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/progress"
          element={
                <ProtectedRoute roles={["STUDENT", "PARENT"]}>
              <StudentProgressPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule-templates"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "MANAGER"]}>
              <AdminLayout>
                <ScheduleTemplatesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/academic-periods" element={
          <ProtectedRoute roles={["SUPER_ADMIN","MANAGER"]}>
            <AdminLayout>
              <AcademicPeriodsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Публичная страница помещений - с Header и Footer */}
        <Route
          path="/rooms"
          element={
            <RoomsPage />
          }
        />


        {/* Помещения – исправлено: обёрнуто в AdminLayout */}
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER","DIRECTOR"]}>
              <AdminLayout>
                <RoomsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        

        {/* Административные маршруты (только SUPER_ADMIN, ADMIN) */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER"]}>
              <AdminLayout>
                <UsersFullCrud />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Менеджерские маршруты (ADMIN, MANAGER, DIRECTOR) */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER","DIRECTOR"]}>
              <AdminLayout>
                <StudentsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        // Внутри 
        

        {/* Дашборд учителя */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute roles={["TEACHER"]}>
              <AdminLayout>
                <TeacherDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/teacher-loads"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "MANAGER", "TEACHER"]}>
              <AdminLayout>
                <TeacherLoadPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/parents"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER","DIRECTOR"]}>
              <AdminLayout>
                <ParentsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER","DIRECTOR"]}>
              <AdminLayout>
                <TeachersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Заявки – доступно менеджерам и админам */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER","DIRECTOR"]}>
              <AdminLayout>
                <ApplicationPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/student-programs" element={
          <ProtectedRoute roles={["SUPER_ADMIN","MANAGER"]}>
            <AdminLayout><StudentProgramsPage /></AdminLayout>
          </ProtectedRoute>
        } />


        {/* Корневой админский маршрут (для совместимости) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","MANAGER","MANAGERS_PROCESSING"]}>
              <AdminLayout>
                <AdminDashboard applications={applications} loading={loadingApplications} error={applicationsError} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/admin/groups" element={
          <ProtectedRoute roles={["SUPER_ADMIN","MANAGER"]}>
            <AdminLayout><GroupsPage /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* CRUD для отделений, программ, предметов – доступно админам и менеджерам */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "PARENT", "MANAGER", "TEACHER", "STUDENT"]}>
              <AdminLayout>
                <DepartmentsCrud/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/roles-permissions"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <AdminLayout>
                <RolesPermissionsPage/>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/files"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "MANAGER"]}>
              <AdminLayout>
                <FilesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/news"
          element={
            <AdminLayout>
              <ManagerNewsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "PARENT", "MANAGER", "TEACHER", "STUDENT"]}>
              <AdminLayout>
                <ProgramsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects-crud"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN","ADMIN","MANAGER","DIRECTOR"]}>
              <AdminLayout>
                <SubjectsCrud />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Студенческая зона */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Статические страницы (доступны всем) */}
        <Route path="/nav-basic-info" element={<BasicInfoPage />} />
        <Route path="/nav-structure" element={<StructureAndManagementPage />} />
        <Route path="/nav-documents" element={<DocumentsPage />} />
        <Route path="/nav-education" element={<EducationPage />} />
        <Route path="/nav-leadership" element={<Page name="Руководство" />} />
        <Route path="/nav-teachers" element={<Page name="Педагогический состав" />} />
        <Route path="/nav-equipment" element={<FacilitiesPage />} />
        <Route path="/nav-paid-services" element={<Page name="Платные образовательные услуги" />} />
        <Route path="/nav-finance" element={<FinancialPage />} />
        <Route path="/nav-vacancies" element={<VacantPlacesPage />} />
        <Route path="/nav-scholarships" element={<ScholarshipsPage />} />
        <Route path="/nav-international" element={<InternationalCooperationPage />} />
        <Route path="/nav-standards" element={<EducationalStandardsPage />} />
        <Route path="/nav-catering" element={<OrganizationFoodPage />} />
        <Route path="/nav-contests" element={<ContestsPage />} />
        <Route path="/nav-news" element={<NewsPage />} />
        <Route path="/nav-gallery" element={<GalleryPage />} />
        <Route path="/nav-services" element={<ElectronicServicesPage />} />
        <Route path="/nav-personalized-finance" element={<PersonalizedFundingPage />} />
        <Route path="/nav-department" element={<DepartmentPage />} />
        <Route path="/nav-admission" element={<AdmissionPage />} />
        <Route path="/nav-guestbook" element={<GuestBookPage />} />
        <Route path="/nav-requests" element={<AppealsDispatcherPage />} />
        <Route path="/nav-quality-assessment" element={<QualityAssessmentPage />} />
        <Route path="/nav-labor-protection" element={<LaborProtectionPage />} />
        <Route path="/nav-traffic-rules" element={<PddPage />} />
        <Route path="/nav-faq" element={<FAQPage />} />
        <Route path="/nav-memory" element={<MemoryWallPage />} />
        <Route path="/nav-anti-legal" element={<AntiCorruptionPage />} />
        <Route path="/nav-anti-expertise" element={<AntiCorruptionExpertisePage />} />
        <Route path="/nav-anti-methods" element={<MethodicalMaterialsPage />} />
        <Route path="/nav-anti-documents" element={<CorruptionFormsPage />} />
        <Route path="/nav-anti-finance" element={<IncomeInfoPage />} />
        <Route path="/nav-anti-commission" element={<CommissionPage />} />
        <Route path="/nav-anti-feedback" element={<AntiCorruptionFeedbackPage />} />
        <Route path="/nav-anti-reports" element={<AntiCorruptionDocsPage />} />
        <Route path="/nav-parent-info" element={<ParentInfoPage />} />
      </Routes>

      {!isAdminPage && !isStudentPage && <Footer />}
      <ToastContainer position="bottom-right" autoClose={2500} theme="colored" />
    </div>
  );
}