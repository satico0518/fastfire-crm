import { User } from "@firebase/auth"

export interface FirebaseSignInOrCreateResponse {
    result: 'OK'|'ERROR'
    user: User | null,
    error?: string,
}