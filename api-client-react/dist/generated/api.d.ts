import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuthResponse, BadRequestResponse, BarnWiseData, ChangePasswordRequest, ConflictResponse, DataEnvelope, HealthStatus, LoginRequest, RegisterRequest, UnauthorizedResponse } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterAccountUrl: () => string;
/**
 * @summary Register a BarnWise account
 */
export declare const registerAccount: (registerRequest: RegisterRequest, options?: Parameters<typeof customFetch>[1]) => Promise<AuthResponse>;
export declare const getRegisterAccountMutationKey: () => readonly ["registerAccount"];
export declare const getRegisterAccountMutationOptions: <TError = ErrorType<BadRequestResponse | ConflictResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerAccount>>, TError, RegisterAccountMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerAccount>>, TError, RegisterAccountMutationVariables, TContext>;
export type RegisterAccountMutationResult = NonNullable<Awaited<ReturnType<typeof registerAccount>>>;
export type RegisterAccountMutationBody = BodyType<RegisterRequest>;
export type RegisterAccountMutationError = ErrorType<BadRequestResponse | ConflictResponse>;
export type RegisterAccountMutationVariables = {
    data: BodyType<RegisterRequest>;
};
/**
* @summary Register a BarnWise account
*/
export declare const useRegisterAccount: <TError = ErrorType<BadRequestResponse | ConflictResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerAccount>>, TError, RegisterAccountMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof registerAccount>>, TError, RegisterAccountMutationVariables, TContext>;
export declare const getLoginAccountUrl: () => string;
/**
 * @summary Log in to a BarnWise account
 */
export declare const loginAccount: (loginRequest: LoginRequest, options?: Parameters<typeof customFetch>[1]) => Promise<AuthResponse>;
export declare const getLoginAccountMutationKey: () => readonly ["loginAccount"];
export declare const getLoginAccountMutationOptions: <TError = ErrorType<UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginAccount>>, TError, LoginAccountMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof loginAccount>>, TError, LoginAccountMutationVariables, TContext>;
export type LoginAccountMutationResult = NonNullable<Awaited<ReturnType<typeof loginAccount>>>;
export type LoginAccountMutationBody = BodyType<LoginRequest>;
export type LoginAccountMutationError = ErrorType<UnauthorizedResponse>;
export type LoginAccountMutationVariables = {
    data: BodyType<LoginRequest>;
};
/**
* @summary Log in to a BarnWise account
*/
export declare const useLoginAccount: <TError = ErrorType<UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof loginAccount>>, TError, LoginAccountMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof loginAccount>>, TError, LoginAccountMutationVariables, TContext>;
export declare const getChangePasswordUrl: () => string;
/**
 * @summary Change the signed-in user's password
 */
export declare const changePassword: (changePasswordRequest: ChangePasswordRequest, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getChangePasswordMutationKey: () => readonly ["changePassword"];
export declare const getChangePasswordMutationOptions: <TError = ErrorType<BadRequestResponse | UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changePassword>>, TError, ChangePasswordMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof changePassword>>, TError, ChangePasswordMutationVariables, TContext>;
export type ChangePasswordMutationResult = NonNullable<Awaited<ReturnType<typeof changePassword>>>;
export type ChangePasswordMutationBody = BodyType<ChangePasswordRequest>;
export type ChangePasswordMutationError = ErrorType<BadRequestResponse | UnauthorizedResponse>;
export type ChangePasswordMutationVariables = {
    data: BodyType<ChangePasswordRequest>;
};
/**
* @summary Change the signed-in user's password
*/
export declare const useChangePassword: <TError = ErrorType<BadRequestResponse | UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changePassword>>, TError, ChangePasswordMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof changePassword>>, TError, ChangePasswordMutationVariables, TContext>;
export declare const getDeleteAccountUrl: () => string;
/**
 * @summary Delete the signed-in account and all owned data
 */
export declare const deleteAccount: (options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteAccountMutationKey: () => readonly ["deleteAccount"];
export declare const getDeleteAccountMutationOptions: <TError = ErrorType<UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAccount>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAccount>>, TError, void, TContext>;
export type DeleteAccountMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAccount>>>;
export type DeleteAccountMutationError = ErrorType<UnauthorizedResponse>;
/**
* @summary Delete the signed-in account and all owned data
*/
export declare const useDeleteAccount: <TError = ErrorType<UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAccount>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAccount>>, TError, void, TContext>;
export declare const getLogoutAccountUrl: () => string;
/**
 * @summary Log out of the current session
 */
export declare const logoutAccount: (options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getLogoutAccountMutationKey: () => readonly ["logoutAccount"];
export declare const getLogoutAccountMutationOptions: <TError = ErrorType<UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutAccount>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutAccount>>, TError, void, TContext>;
export type LogoutAccountMutationResult = NonNullable<Awaited<ReturnType<typeof logoutAccount>>>;
export type LogoutAccountMutationError = ErrorType<UnauthorizedResponse>;
/**
* @summary Log out of the current session
*/
export declare const useLogoutAccount: <TError = ErrorType<UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutAccount>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutAccount>>, TError, void, TContext>;
export declare const getGetMyBarnWiseDataUrl: () => string;
/**
 * @summary Get the signed-in user's BarnWise data
 */
export declare const getMyBarnWiseData: (options?: Parameters<typeof customFetch>[1]) => Promise<DataEnvelope>;
export declare const getGetMyBarnWiseDataQueryKey: () => readonly ["/api/me/data"];
export declare const getGetMyBarnWiseDataQueryOptions: <TData = Awaited<ReturnType<typeof getMyBarnWiseData>>, TError = ErrorType<UnauthorizedResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyBarnWiseData>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyBarnWiseData>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyBarnWiseDataQueryResult = NonNullable<Awaited<ReturnType<typeof getMyBarnWiseData>>>;
export type GetMyBarnWiseDataQueryError = ErrorType<UnauthorizedResponse>;
/**
 * @summary Get the signed-in user's BarnWise data
 */
export declare function useGetMyBarnWiseData<TData = Awaited<ReturnType<typeof getMyBarnWiseData>>, TError = ErrorType<UnauthorizedResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyBarnWiseData>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSaveMyBarnWiseDataUrl: () => string;
/**
 * @summary Replace the signed-in user's BarnWise data
 */
export declare const saveMyBarnWiseData: (barnWiseData: BarnWiseData, options?: Parameters<typeof customFetch>[1]) => Promise<DataEnvelope>;
export declare const getSaveMyBarnWiseDataMutationKey: () => readonly ["saveMyBarnWiseData"];
export declare const getSaveMyBarnWiseDataMutationOptions: <TError = ErrorType<BadRequestResponse | UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof saveMyBarnWiseData>>, TError, SaveMyBarnWiseDataMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof saveMyBarnWiseData>>, TError, SaveMyBarnWiseDataMutationVariables, TContext>;
export type SaveMyBarnWiseDataMutationResult = NonNullable<Awaited<ReturnType<typeof saveMyBarnWiseData>>>;
export type SaveMyBarnWiseDataMutationBody = BodyType<BarnWiseData>;
export type SaveMyBarnWiseDataMutationError = ErrorType<BadRequestResponse | UnauthorizedResponse>;
export type SaveMyBarnWiseDataMutationVariables = {
    data: BodyType<BarnWiseData>;
};
/**
* @summary Replace the signed-in user's BarnWise data
*/
export declare const useSaveMyBarnWiseData: <TError = ErrorType<BadRequestResponse | UnauthorizedResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof saveMyBarnWiseData>>, TError, SaveMyBarnWiseDataMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof saveMyBarnWiseData>>, TError, SaveMyBarnWiseDataMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map