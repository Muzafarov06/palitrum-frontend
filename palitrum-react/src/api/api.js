import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
});

// Создаём отдельный экземпляр для публичных запросов (без токена)
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// ========== ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ПУБЛИЧНЫХ ЭНДПОИНТОВ ==========
const isPublicEndpoint = (url) => {
  if (!url) return false;
  const publicPaths = [
    '/auth/login',
    '/api/programs/public',
    '/api/settings/public'
  ];
  return publicPaths.some(path => url.includes(path));
};

// Интерсептор для API (с токеном)
API.interceptors.request.use((config) => {
  if (!isPublicEndpoint(config.url)) {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      toast.error("Недостаточно прав для выполнения действия");
    } else if (error.response?.status === 401 && !isPublicEndpoint(error.config?.url)) {
      toast.error("Сессия истекла, войдите снова");
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// ================= AUTH =================
export async function login(email, password) {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
}

export async function fetchMe() {
  const response = await API.get("/auth/me");
  return response.data;
}

// ================= USERS =================
export async function fetchFilteredUsers({
  status = null,
  roleName = null,
  search = null,
  birthDateFrom = null,
  birthDateTo = null,
  page = 0,
  size = 10,
  sort = "id,asc"
}) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (roleName) params.append("roleName", roleName);
  if (search) params.append("search", search);
  if (birthDateFrom) params.append("birthDateFrom", birthDateFrom);
  if (birthDateTo) params.append("birthDateTo", birthDateTo);
  params.append("page", page);
  params.append("size", size);
  params.append("sort", sort);
  const response = await API.get(`/api/users/filter?${params.toString()}`);
  return response.data;
}
export const fetchUsersWithFilters = fetchFilteredUsers; // алиас

export async function fetchUsersStatistics() {
  const response = await API.get("/api/users/statistics");
  return response.data;
}

export async function fetchUsers() {
  const response = await API.get("/api/users");
  return response.data;
}

export async function createUser(data) {
  const response = await API.post("/api/users", data);
  return response.data;
}

export async function updateUser(id, data) {
  const response = await API.put(`/api/users/${id}`, data);
  return response.data;
}

export async function updateUserStatus(id, status) {
  const response = await API.patch(`/api/users/${id}/status`, null, { params: { status } });
  return response.data;
}

export async function deleteUser(id) {
  const response = await API.delete(`/api/users/${id}`);
  return response.data;
}

export async function fetchUserById(id) {
  const response = await API.get(`/api/users/${id}`);
  return response.data;
}

// ================= ROLES =================
export async function fetchRoles(search = "", page = 0, size = 100) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("size", size);
  const response = await API.get(`/api/roles?${params.toString()}`);
  if (response.data && Array.isArray(response.data.content)) return response.data.content;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

export async function createRole(data) {
  const response = await API.post("/api/roles", data);
  return response.data;
}

export async function updateRole(id, data) {
  const response = await API.put(`/api/roles/${id}`, data);
  return response.data;
}

export async function deleteRole(id) {
  const response = await API.delete(`/api/roles/${id}`);
  return response.data;
}

// ================= USER ROLES =================
export async function fetchUserRoles(userId = null, roleId = null) {
  const response = await API.get("/api/user-roles", { params: { userId, roleId } });
  return response.data;
}

export async function createUserRole(data) {
  const response = await API.post("/api/user-roles", data);
  return response.data;
}
export const assignRoleToUser = createUserRole; // алиас

export async function deleteUserRole(id) {
  const response = await API.delete(`/api/user-roles/${id}`);
  return response.data;
}
export const revokeRoleFromUser = deleteUserRole; // алиас

// ================= DEPARTMENTS =================
export async function fetchDepartments() {
  const response = await API.get("/api/departments");
  return response.data;
}
export async function fetchProgramsByDepartmentAdmin(departmentId) {
  const response = await API.get(`/api/programs/by-department/${departmentId}`);
  return response.data;
}
export async function createDepartment(data) {
  const response = await API.post("/api/departments", data);
  return response.data;
}
export async function updateDepartment(departmentId, data) {
  const response = await API.put(`/api/departments/${departmentId}`, data);
  return response.data;
}
export async function deleteDepartment(departmentId) {
  const response = await API.delete(`/api/departments/${departmentId}`);
  return response.data;
}

// ================= PROGRAMS =================
export async function fetchAllPrograms() {
  const response = await API.get("/api/programs");
  return response.data;
}
export async function fetchProgramById(programId) {
  const response = await API.get(`/api/programs/${programId}`);
  return response.data;
}
export async function createProgram(data) {
  const response = await API.post("/api/programs", data);
  return response.data;
}
export const updateProgram = async (programId, data) => {
  const response = await API.put(`/api/programs/${programId}`, data);
  return response.data;
};
export const deleteProgram = async (programId) => {
  const response = await API.delete(`/api/programs/${programId}`);
  return response.data;
};
export async function fetchPrograms() {
  const response = await API.get("/api/programs");
  if (response.data && Array.isArray(response.data.content)) return response.data.content;
  if (Array.isArray(response.data)) return response.data;
  return [];
}
export async function fetchDepartmentsAdmin() {
  const response = await API.get("/api/departments");
  return response.data;
}

// ================= PROGRAMS BY DEPARTMENT =================
export async function fetchProgramsByDepartment(departmentId) {
  const response = await API.get(`/api/programs/by-department/${departmentId}`);
  return response.data;
}
export async function fetchProgramDepartmentsByDepartment(departmentId) {
  const response = await API.get(`/api/program-department/by-department/${departmentId}`);
  return response.data;
}
export const deleteProgramFromDepartment = async (programId, departmentId) => {
  const response = await API.delete("/api/program-department/unlink", { params: { programId, departmentId } });
  return response.status === 204;
};
export async function addProgramToDepartment(programId, departmentId, isPrimary = false, notes = "") {
  const response = await API.post("/api/program-department/link", { programId, departmentId, isPrimary, notes });
  return response.data;
}

// ================= SUBJECTS =================
export async function fetchSubjects() {
  const response = await API.get("/api/subjects");
  return response.data;
}
export async function fetchSubjectById(subjectId) {
  const response = await API.get(`/api/subjects/${subjectId}`);
  return response.data;
}
export async function createSubject(data) {
  const response = await API.post("/api/subjects", data);
  return response.data;
}
export async function updateSubject(subjectId, data) {
  const response = await API.put(`/api/subjects/${subjectId}`, data);
  return response.data;
}
export async function deleteSubject(subjectId) {
  const response = await API.delete(`/api/subjects/${subjectId}`);
  return response.data;
}

// ================= PROGRAM-SUBJECT =================
export async function fetchSubjectsByProgram(programId) {
  const response = await API.get(`/api/program-subjects/by-program/${programId}`);
  return response.data;
}
export async function linkSubjectToProgram(programId, subjectId, academicYear, hoursPerWeekForProgram = 0) {
  const response = await API.post("/api/program-subjects/link", {
    programId: Number(programId),
    subjectId: Number(subjectId),
    academicYear: Number(academicYear),
    hoursPerWeekForProgram: Number(hoursPerWeekForProgram)
  });
  return response.data;
}
export async function updateProgramSubject(id, academicYear, hoursPerWeekForProgram) {
  const response = await API.put(`/api/program-subjects/${id}`, { academicYear, hoursPerWeekForProgram });
  return response.data;
}
export async function unlinkSubjectFromProgram(programId, subjectId, academicYear) {
  const response = await API.delete("/api/program-subjects/unlink", { params: { programId, subjectId, academicYear } });
  return response.status === 204;
}
export async function fetchSubjectsByLessonType(lessonType) {
  const all = await fetchSubjects();
  return all.filter(s => s.lessonType === lessonType);
}
export const addSubjectToProgram = linkSubjectToProgram;
export const deleteSubjectFromProgram = unlinkSubjectFromProgram;
export const getAllSubjects = fetchSubjects;
export const getSubjectById = fetchSubjectById;
export const getSubjectsByProgram = fetchSubjectsByProgram;

// ================= APPLICATIONS =================
export async function createApplication(data) {
  const response = await API.post("/api/applications", data);
  return response.data;
}
export async function getApplicationFiles(applicationId) {
  return getFilesByEntity("APPLICATION", applicationId);
}
export async function deleteApplication(id) {
  await API.delete(`/api/applications/${id}`);
}
export async function fetchApplications() {
  const response = await API.get("/api/applications");
  return response.data;
}
export async function fetchApplicationById(id) {
  const response = await API.get(`/api/applications/${id}`);
  return response.data;
}
export async function updateApplication(id, data) {
  const response = await API.put(`/api/applications/${id}`, data);
  return response.data;
}
export async function updateApplicationStatus(id, status) {
  const response = await API.patch(`/api/applications/${id}/status`, null, { params: { status } });
  return response.data;
}
export async function fetchApplicationsStatistics() {
  const response = await API.get("/api/applications/statistics");
  return response.data;
}
export async function fetchFilteredApplications({
  status = null,
  programId = null,
  childLastName = null,
  childFirstName = null,
  startDate = null,
  endDate = null,
  page = 0,
  size = 10,
}) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (programId) params.append("programId", programId);
  if (childLastName) params.append("childLastName", childLastName);
  if (childFirstName) params.append("childFirstName", childFirstName);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("page", page);
  params.append("size", size);
  const response = await API.get(`/api/applications/filter?${params.toString()}`);
  return response.data;
}

// ================= FILES =================
export async function getFilesByEntity(entityType, entityId) {
  const response = await API.get(`/api/files/${entityType}/${entityId}`);
  return response.data;
}
export async function deleteFile(fileId) {
  await API.delete(`/api/files/${fileId}`);
}
export async function uploadFiles(entityId, entityType, files) {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  const response = await API.post(`/api/files/upload?entityType=${entityType}&entityId=${entityId}`, formData);
  return response.data;
}
export async function replaceFiles(entityType, entityId, files) {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  const response = await API.put(`/api/files/replace/${entityType}/${entityId}`, formData);
  return response.data;
}
export async function deleteAllFilesForEntity(entityType, entityId) {
  const files = await getFilesByEntity(entityType, entityId);
  for (const file of files) await deleteFile(file.id);
}
export async function fetchFilteredFiles(entityType, entityId, fileName, page = 0, size = 12) {
  const params = new URLSearchParams();
  if (entityType) params.append("entityType", entityType);
  if (entityId) params.append("entityId", entityId);
  if (fileName) params.append("fileName", fileName);
  params.append("page", page);
  params.append("size", size);
  const response = await API.get(`/api/files/filter?${params.toString()}`);
  return response.data;
}
export async function fetchFilesStatistics(entityType = null) {
  const params = new URLSearchParams();
  if (entityType) params.append("entityType", entityType);
  const response = await API.get(`/api/files/statistics?${params.toString()}`);
  return response.data;
}

// ================= ROOMS =================
export async function createRoom(data) {
  const response = await API.post("/api/rooms", data);
  return response.data;
}
export async function updateRoom(id, data) {
  const response = await API.put(`/api/rooms/${id}`, data);
  return response.data;
}
export async function deleteRoom(id) {
  await API.delete(`/api/rooms/${id}`);
}
export async function getRoomImage(roomId) {
  const files = await getFilesByEntity("ROOM", roomId);
  return files.length > 0 ? files[0] : null;
}
export async function fetchFilteredRooms(search = "", type = "", page = 0, size = 12) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  params.append("page", page);
  params.append("size", size);
  const response = await API.get(`/api/rooms/filter?${params.toString()}`);
  return response.data;
}
export async function fetchRoomsStatistics(search = "", type = "") {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  const response = await API.get(`/api/rooms/statistics?${params.toString()}`);
  return response.data;
}

// ================= ACADEMIC PERIODS =================
export async function fetchAcademicPeriods(search = "", page = 0, size = 10) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("size", size);
  const response = await API.get(`/api/academic-periods?${params.toString()}`);
  return response.data;
}
export async function fetchAcademicPeriodsStatistics() {
  const response = await API.get("/api/academic-periods/statistics");
  return response.data;
}
export async function createAcademicPeriod(data) {
  const response = await API.post("/api/academic-periods", data);
  return response.data;
}
export async function updateAcademicPeriod(id, data) {
  const response = await API.put(`/api/academic-periods/${id}`, data);
  return response.data;
}
export async function deleteAcademicPeriod(id) {
  await API.delete(`/api/academic-periods/${id}`);
}

// ================= SCHEDULE TEMPLATES =================
export async function fetchScheduleTemplates(periodId, page = 0, size = 10) {
  const params = new URLSearchParams();
  params.append("periodId", periodId);
  params.append("page", page);
  params.append("size", size);
  const response = await API.get(`/api/schedule-templates?${params.toString()}`);
  return response.data;
}
export async function createScheduleTemplate(data) {
  const response = await API.post("/api/schedule-templates", data);
  return response.data;
}
export async function updateScheduleTemplate(id, data) {
  const response = await API.put(`/api/schedule-templates/${id}`, data);
  return response.data;
}
export async function deleteScheduleTemplate(id) {
  await API.delete(`/api/schedule-templates/${id}`);
}

// ================= DROPDOWN =================
export async function fetchGroupsByPeriod(periodId) {
  const response = await API.get(`/api/dropdown/groups/by-period/${periodId}`);
  return response.data;
}
export async function fetchIndividualStudents() {
  const response = await API.get("/api/dropdown/students/individual");
  return response.data;
}
export async function fetchAllTeachers() {
  const response = await API.get("/api/dropdown/teachers");
  return response.data;
}
export async function fetchTeachersByProgram(programId) {
  const response = await API.get(`/api/dropdown/teachers/by-program/${programId}`);
  return response.data;
}
export async function fetchSubjectsByStudent(studentId) {
  const response = await API.get(`/api/subjects/by-student/${studentId}`);
  return response.data;
}
export async function fetchSubjectsForProgram(programId) {
  const response = await API.get(`/api/subjects/by-program/${programId}`);
  return response.data;
}
export async function generateLessons(periodId) {
  const response = await API.post(`/api/schedule-templates/generate?periodId=${periodId}`);
  return response.data;
}

// ================= GROUPS =================
export async function fetchGroups() {
  const response = await API.get("/api/groups");
  return response.data;
}
export async function fetchRoomsByMinCapacity(minCapacity) {
  const response = await API.get(`/api/dropdown/rooms?minCapacity=${minCapacity}`);
  return response.data;
}

// ================= NEWS =================
export async function fetchNews(params = {}) {
  const {
    search = null,
    isPublic = null,
    pinned = null,
    authorId = null,
    startDate = null,
    endDate = null,
    page = 0,
    size = 12,
    sort = "createdAt,desc"
  } = params;
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (isPublic !== null && isPublic !== undefined) queryParams.append("isPublic", isPublic);
  if (pinned !== null && pinned !== undefined) queryParams.append("pinned", pinned);
  if (authorId) queryParams.append("authorId", authorId);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  queryParams.append("page", page);
  queryParams.append("size", size);
  if (sort) queryParams.append("sort", sort);
  const response = await API.get(`/api/news?${queryParams.toString()}`);
  const data = response.data;
  if (data && data.content) return data;
  if (Array.isArray(data)) return { content: data, totalElements: data.length };
  return { content: [], totalElements: 0 };
}
export async function fetchNewsStatistics({ search, isPublic, pinned, authorId, startDate, endDate }) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (isPublic !== null && isPublic !== undefined) params.append("isPublic", isPublic);
  if (pinned !== null && pinned !== undefined) params.append("pinned", pinned);
  if (authorId) params.append("authorId", authorId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await API.get(`/api/news/statistics?${params.toString()}`);
  return response.data;
}
export async function getNewsById(id) {
  const response = await API.get(`/api/news/${id}`);
  return response.data;
}
export async function createNews(data) {
  const response = await API.post("/api/news", data);
  return response.data;
}
export async function updateNews(id, data) {
  const response = await API.put(`/api/news/${id}`, data);
  return response.data;
}
export async function deleteNews(id) {
  await API.delete(`/api/news/${id}`);
}

// ================= USER RELATIONS (старая сигнатура – для совместимости) =================
export async function fetchUserRelations(userId, relationType) {
  if (relationType === 'parent') {
    const response = await API.get(`/api/user-relations/child/${userId}/parents`);
    return response.data;
  } else if (relationType === 'child') {
    const response = await API.get(`/api/user-relations/parent/${userId}/children`);
    return response.data;
  } else {
    throw new Error("Invalid relationType. Use 'parent' or 'child'");
  }
}

export async function fetchChildrenByParent(parentId) {
  const response = await API.get(`/api/user-relations/parent/${parentId}/children`);
  return response.data;
}

export async function fetchParentsByChild(childId) {
  const response = await API.get(`/api/user-relations/child/${childId}/parents`);
  return response.data;
}

// ================= НОВЫЕ ФУНКЦИИ ДЛЯ ПОЛУЧЕНИЯ ВСЕХ СВЯЗЕЙ ПОЛЬЗОВАТЕЛЯ =================
export async function fetchUsersByRole(roleName, page = 0, size = 100) {
  const response = await fetchFilteredUsers({ roleName, page, size, sort: "id,asc" });
  return response.content;
}

export async function createUserRelation(data) {
  const response = await API.post("/api/user-relations", data);
  return response.data;
}

export async function deleteUserRelation(relationId) {
  await API.delete(`/api/user-relations/${relationId}`);
}

export async function fetchUserRelationsForUser(userId) {
  try {
    const [parentsAsChild, childrenAsParent] = await Promise.all([
      fetchParentsByChild(userId),
      fetchChildrenByParent(userId)
    ]);
    const allRelations = [];
    for (const parent of parentsAsChild) {
      allRelations.push({
        id: parent.id,
        parentUserId: parent.parentUserId,
        childUserId: parent.childUserId,
        relationType: parent.relationType,
        verified: parent.verified,
        parentFullName: parent.parentFullName,
        childFullName: parent.childFullName
      });
    }
    for (const child of childrenAsParent) {
      allRelations.push({
        id: child.id,
        parentUserId: child.parentUserId,
        childUserId: child.childUserId,
        relationType: child.relationType,
        verified: child.verified,
        parentFullName: child.parentFullName,
        childFullName: child.childFullName
      });
    }
    return allRelations;
  } catch (error) {
    console.error("fetchUserRelationsForUser error:", error);
    throw error;
  }
}

// ================= PUBLIC FUNCTIONS =================
export async function fetchAllProgramsPublic() {
  const response = await publicApi.get("/api/programs/public");
  return response.data;
}
export async function fetchPublicRooms() {
  const response = await publicApi.get("/api/rooms/filter?page=0&size=100");
  const data = response.data;
  if (data && Array.isArray(data.content)) return data.content;
  return Array.isArray(data) ? data : [];
}
export async function fetchPublicNews() {
  const response = await publicApi.get("/api/news?size=100");
  if (response.data && Array.isArray(response.data.content)) return response.data.content;
  if (Array.isArray(response.data)) return response.data;
  return [];
}
export async function getPublicSettings() {
  const response = await publicApi.get('/api/settings/public');
  return response.data;
}
export async function fetchLocations() {
  const response = await publicApi.get("/api/rooms");
  if (response.data && Array.isArray(response.data.content)) return response.data.content;
  if (Array.isArray(response.data)) return response.data;
  return [];
}
export async function fetchTeachers() {
  const response = await publicApi.get("/api/teachers");
  return response.data;
}

// ================= STUDENT JOURNAL =================
export async function fetchStudentGrades(studentId, programId = null) {
  const params = new URLSearchParams();
  if (programId) params.append("programId", programId);
  const response = await API.get(`/api/journal/student/${studentId}/grades?${params.toString()}`);
  return response.data;
}
export async function fetchStudentLessons(studentId, startDate, endDate) {
  const params = new URLSearchParams();
  params.append("start", startDate);
  params.append("end", endDate);
  params.append("studentId", studentId);
  const response = await API.get(`/api/lessons/calendar?${params.toString()}`);
  return response.data;
}
export async function fetchStudentGradeDetails(studentId, subjectId, periodId = null) {
  const params = new URLSearchParams();
  if (periodId) params.append("periodId", periodId);
  const response = await API.get(`/api/journal/student/${studentId}/grades/${subjectId}/details?${params.toString()}`);
  return response.data;
}
export async function fetchStudentPrograms(studentId) {
  const response = await API.get(`/api/journal/student/${studentId}/programs`);
  return response.data;
}

// ================= PERMISSIONS =================
export async function fetchAllPermissions() {
  const response = await API.get("/api/permissions");
  return response.data;
}
export async function fetchAllRolePermissions() {
  const response = await API.get("/api/role-permissions");
  return response.data;
}
export async function assignPermissionToRole(roleId, permissionId) {
  const response = await API.post("/api/role-permissions", { roleId, permissionId });
  return response.data;
}
export async function unassignPermissionFromRole(roleId, permissionId) {
  const response = await API.delete(`/api/role-permissions/${roleId}/${permissionId}`);
  return response.data;
}

// ================= POSITIONS =================
export async function fetchPositions() {
  const response = await API.get("/api/positions");
  return response.data;
}
export async function createPosition(data) {
  const response = await API.post("/api/positions", data);
  return response.data;
}
export async function updatePosition(id, data) {
  const response = await API.put(`/api/positions/${id}`, data);
  return response.data;
}
export async function deletePosition(id) {
  await API.delete(`/api/positions/${id}`);
}

// ================= STAFF =================
export async function fetchStaff() {
  const response = await API.get("/api/staff");
  return response.data;
}
export async function createStaff(data) {
  const response = await API.post("/api/staff", data);
  return response.data;
}
export async function updateStaff(id, data) {
  const response = await API.put(`/api/staff/${id}`, data);
  return response.data;
}
export async function deleteStaff(id) {
  await API.delete(`/api/staff/${id}`);
}

// ================= TEACHER LOADS =================
export async function fetchTeacherLoads(periodId = null) {
  const params = periodId ? `?periodId=${periodId}` : "";
  const response = await API.get(`/api/teacher-loads${params}`);
  return response.data;
}
export async function createTeacherLoad(data) {
  const response = await API.post("/api/teacher-loads", data);
  return response.data;
}
export async function updateTeacherLoad(id, data) {
  const response = await API.put(`/api/teacher-loads/${id}`, data);
  return response.data;
}
export async function deleteTeacherLoad(id) {
  await API.delete(`/api/teacher-loads/${id}`);
}

// ================= SYSTEM SETTINGS =================
export async function getSystemSettings() {
  const response = await API.get('/api/settings');
  return response.data;
}
export async function updateSystemSettings(settings) {
  const response = await API.put('/api/settings', settings);
  return response.data;
}
export async function fetchAllFiles(page = 0, size = 12) {
  const response = await API.get(`/api/files/list`, { params: { page, size, sort: "uploadedAt,desc" } });
  return response.data;
}

// ================= PUBLIC NEWS (новая версия) =================
export async function fetchPublicNewsV2(page = 0, size = 12, search = null, pinned = null) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (pinned !== null && pinned !== undefined) params.append("pinned", pinned);
  params.append("page", page);
  params.append("size", size);
  const response = await publicApi.get(`/api/news/public?${params.toString()}`);
  return response.data;
}

// ================= PUBLIC ROOMS (новая версия) =================
export async function fetchPublicRoomsV2(page = 0, size = 100, search = null, type = null) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  params.append("page", page);
  params.append("size", size);
  const response = await publicApi.get(`/api/rooms/public?${params.toString()}`);
  return response.data;
}

// ================= SCHEDULE GENERATOR (добавлено) =================
export async function generateScheduleTemplates(requestData) {
  const response = await API.post("/api/schedule-generator/generate", requestData);
  return response.data;
}

export async function smartGenerateSchedule(requestData) {
  const response = await API.post("/api/schedule-generator/smart-generate", requestData);
  return response.data;
}

export default API;