import { AuthError, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { FirebaseSignInResponse } from "../interfaces/FirbaseSignInResponse";


export class AuthService {
  static async signIn(email: string, pass: string): Promise<FirebaseSignInResponse> {
    try {
        const userLoggedIn = await signInWithEmailAndPassword(auth, email, pass);
        return {
            result: userLoggedIn.user ? 'OK' : 'ERROR',
            user: userLoggedIn.user ?? null
        }
    } catch (error: unknown) {
        return {
            result: 'ERROR',
            user: null,
            error: error as AuthError
        };
    }
  }
}
