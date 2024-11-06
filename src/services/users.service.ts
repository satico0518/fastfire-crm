import { auth, db } from "../firebase/firebase.config";
import { ref, update } from "firebase/database";
import { ServiceResponse } from "../interfaces/Shared";
import { User } from "../interfaces/User";

export class UsersService {
  static async deleteUser(userKey: string): Promise<ServiceResponse> {
    try {
      const usersRef = ref(db, `users/${userKey}`);
      await update(usersRef, { isActive: false });
      return {
        result: "OK",
        message: "Usuario eliminado exitosamante",
      };
    } catch (err) {
      console.error(
        `Error eliminando el usuario [key: ${userKey}] - [currentUserUid: ${auth.currentUser?.uid}]`,
        err
      );
      return {
        result: "ERROR",
        message: "",
        errorMessage: "Error eliminando el usuario",
      };
    }
  }

  static async modifyUser(user: User): Promise<ServiceResponse> {
    try {
      const usersRef = ref(db, `users/${user.key}`);
      await update(usersRef, user);
      return {
        result: "OK",
        message: "Usuario modificado exitosamante",
      };
    } catch (err) {
      console.error(
        `Error modificando el usuario [key: ${user.key}] - [currentUserUid: ${auth.currentUser?.uid}]`,
        err
      );
      return {
        result: "ERROR",
        message: "",
        errorMessage: "Error modificando el usuario",
      };
    }
  }

  static async removeGroupKeyFromUsers(
    usersToRemoveGroupKey: User[],
    removedGroupKey: string
  ): Promise<ServiceResponse> {
    try {
      for (const user of usersToRemoveGroupKey) {
        const usersRef = ref(db, `users/${user.key}`);
        user.workgroupKeys = user.workgroupKeys.filter(wgk => wgk !== removedGroupKey)
        await update(usersRef, user);
      }

      return {
        result: "OK",
      };
    } catch (error) {
      console.error(`Error al intentar eliminar el grupo del usuario.`, {
        error,
      });
      return {
        result: "ERROR",
        message: null,
        errorMessage: "Error al intentar eliminar el grupo del usuario.",
      };
    }
  }
}
