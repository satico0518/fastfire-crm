import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { FirebaseSignInOrCreateResponse } from "../interfaces/FirebaseSignInOrCreateResponse";
import { db } from "../firebase/firebase.config";
import { ref, push, set, get } from "firebase/database";
import { User } from "../interfaces/User";
import { ServiceResponse } from "../interfaces/Shared";

export class AuthService {
  static async createUser(user: User): Promise<ServiceResponse> {
    try {
      const createUserResponse = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.permissions.includes('PROVIDER') ? 'P12345' : 'Ff12345' // TODO env Var
      );
      if (createUserResponse.user && createUserResponse.user.uid) {
        const userToPush: User = {
          ...user,
          id: createUserResponse.user.uid,
          isActive: true,
        };
        const docRef = push(ref(db, "users"));
        userToPush.key = docRef.key as string;
        await set(docRef, userToPush);

        return {
          result: "OK",
        };
      }

      return {
        result: "ERROR",
        errorMessage: "Error al intentar crear usuario, intente de nuevo!",
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message;
      if (error?.code && error?.code.includes("auth/email-already-in-use")) {
        message = "Este usuario ya fue creado!";
      }

      console.error({ error });
      return {
        result: "ERROR",
        errorMessage: message ?? "Error al intentar crear usuario",
      };
    }
  }

  static async signIn(
    email: string,
    pass: string
  ): Promise<FirebaseSignInOrCreateResponse> {
    try {
      const userLoggedIn = await signInWithEmailAndPassword(auth, email, pass);
      const users: User[] =  Object.values((await get(ref(db, 'users'))).val());
      const userDB = users?.filter((u) => u.email === email)[0];
      if (!userDB) {
        const msg = `El usuario "${email}" no está registrado.`;
        console.error(msg);
        return {
          result: "ERROR",
          error: msg
        };
      } else if (userDB && !userDB.isActive) {
        const msg = `El usuario "${email}" está inactivo. Comuníquese con el administrador!`;
        console.error(msg);
        return {
          result: "ERROR",
          error: msg
        };
      }

      return {
        result: 'OK',
        firebaseUser: userLoggedIn.user,
        user: userDB,
      }
    } catch (error: unknown) {
      console.error(error);
      return {
        result: "ERROR",
        error: "Error al intentar iniciar sesión, revise sus credenciales.",
      };
    }
  }

  static async changePassword(userEmail: string): Promise<ServiceResponse> {
    try {
      await sendPasswordResetEmail(auth, userEmail);
      return {
        result: 'OK'
      }
    } catch (error) {
      console.error('Error enviando correo para cambiar contraseña', {error});
      return {
        result: 'ERROR',
        errorMessage: 'Error enviando correo para cambiar contraseña'
      }
    }
  }

  static async LogOut(): Promise<ServiceResponse> {
    try {
      await auth.signOut();
      return {
        result: "OK",
      };
    } catch (error) {
      console.error(
        `Error cerrando sesión - [currentUserUid: ${auth.currentUser?.uid}]`,
        error
      );
      return {
        result: "ERROR",
        errorMessage: "Error cerrando sesión",
      };
    }
  }
}
