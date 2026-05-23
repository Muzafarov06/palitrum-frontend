import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFilteredApplications, updateApplicationStatus } from "./api";
import { toast } from "react-toastify";

export const applicationsKey = (params) => ["applications", params];

export const useApplications = (params) => {
  return useQuery({
    queryKey: applicationsKey(params),
    queryFn: () => fetchFilteredApplications(params),
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateApplicationStatus(id, status),
    onSuccess: (data, variables) => {
      toast.success("Статус заявки обновлён");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => toast.error("Не удалось обновить статус"),
  });
};