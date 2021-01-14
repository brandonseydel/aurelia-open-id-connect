import { User } from 'oidc-client';

export type UserManagerEventHandler = (...ev: unknown[]) => void;

// we call these "actions" because they have
// side effects instead of having return values.
export type UserManagerEventsAction = (a: UserManagerEventHandler | User) => void;
