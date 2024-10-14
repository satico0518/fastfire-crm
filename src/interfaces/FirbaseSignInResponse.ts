import { AuthError, User } from "@firebase/auth"

export interface FirebaseSignInResponse {
    result: 'OK'|'ERROR'
    user: User | null,
    error?: AuthError
}