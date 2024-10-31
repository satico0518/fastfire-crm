import { User as FirebaseUser } from "@firebase/auth"
import { User } from "./User"

export interface FirebaseSignInOrCreateResponse {
    result: 'OK'|'ERROR'
    firebaseUser?: FirebaseUser,
    user?: User,
    error?: string,
}