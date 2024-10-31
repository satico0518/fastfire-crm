import { useEffect } from "react";
import { useUsersStore } from "../stores/users/users.store";
import { db } from "../firebase/firebase.config";
import { useUiStore } from "../stores/ui/ui.store";
import { onValue, ref } from "firebase/database";
import { User } from "../interfaces/User";
import { Task } from "../interfaces/Task";
import { useTasksStore } from "../stores/tasks/tasks.store";

export const useLoadData = () => {
  const setUsers = useUsersStore((state) => state.setUsers);
  const setTasks = useTasksStore((state) => state.setTasks);
  const setIsLoading = useUiStore((state) => state.setIsLoading);
  const setSnackbar = useUiStore((state) => state.setSnackbar);

  useEffect(() => {
    try {
      setIsLoading(true);
      const usersRef = ref(db, "users");
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const values: User[] = Object.entries<User>(data).map(
            ([key, value]) => ({ ...value, key })
          ) as User[];
          setUsers(values);
        } else setUsers([]);

        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error cargando usuarios.", { error });

      setSnackbar({
        open: true,
        message: "Error cargando usuarios.",
        severity: "error",
        duration: 10000,
      });
    }
  }, [setIsLoading, setSnackbar, setUsers]);

  useEffect(() => {
    try {
      setIsLoading(true);
      const tasksRef = ref(db, "tasks");
      onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const values = Object.entries<Task>(data).map(([key, value]) => ({
            ...value,
            key,
          }));
          setTasks(values);
        } else setTasks([]);

        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error cargando tareas.", { error });

      setSnackbar({
        open: true,
        message: "Error cargando tareas.",
        severity: "error",
        duration: 10000,
      });
    }
  }, [setIsLoading, setSnackbar, setTasks]);
};
