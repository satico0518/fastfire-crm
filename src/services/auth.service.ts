import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { FirebaseSignInOrCreateResponse } from "../interfaces/FirebaseSignInOrCreateResponse";
import { db } from "../firebase/firebase.config";
import { ref, push, set, update } from "firebase/database";
import { User } from "../interfaces/User";
import { ServiceResponse } from "../interfaces/Shared";

export class AuthService {
  static async createUser(user: User): Promise<FirebaseSignInOrCreateResponse> {
    try {
      const createUserResponse = await createUserWithEmailAndPassword(
        auth,
        user.email,
        "Ff12345"
      );
      if (createUserResponse.user && createUserResponse.user.uid) {
        const userToPush: User = {
          ...user,
          id: createUserResponse.user.uid,
          isActive: true,
        };
        const docRef = push(ref(db, "users"));
        await set(docRef, userToPush);

        return {
          result: "OK",
          user: createUserResponse.user,
          error: undefined,
        };
      }

      return {
        result: "ERROR",
        user: null,
        error: "Error al intentar crear usuario, intente de nuevo!",
      };
    } catch (error) {
      let message;
      if (error?.code && error?.code.includes("auth/email-already-in-use")) {
        message = "Este usuario ya fue creado!";
      }

      console.error({ error });
      return {
        result: "ERROR",
        user: null,
        error: message ?? "Error al intentar crear usuario",
      };
    }
  }

  static async signIn(
    email: string,
    pass: string
  ): Promise<FirebaseSignInOrCreateResponse> {
    try {
      const userLoggedIn = await signInWithEmailAndPassword(auth, email, pass);
      return {
        result: userLoggedIn.user ? "OK" : "ERROR",
        user: userLoggedIn.user ?? null,
      };
    } catch (error: unknown) {
      console.error(error);

      return {
        result: "ERROR",
        user: null,
        error: "Error al intentar iniciar sesion.",
      };
    }
  }

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

  static async LogOut(): Promise<ServiceResponse> {
    try {
      await auth.signOut()
      return {
        result: 'OK',
        message: ''
      };
    } catch (error) {
      console.error(
        `Error cerrando sesión - [currentUserUid: ${auth.currentUser?.uid}]`,
        error
      );
      return {
        result: "ERROR",
        message: "",
        errorMessage: "Error cerrando sesión",
      };
    }
  }
}
