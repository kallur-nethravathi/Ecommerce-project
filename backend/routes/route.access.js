export const PageAccess = Object.freeze({
    register: Object.freeze({
        name:"register",
        allowedRoles: ["users"],
    }),
    login: Object.freeze({
        name:"login",
        allowedRoles: ["users"],
    }),
    forgotPassword: Object.freeze({
        name:"forgotPassword",
        allowedRoles: ["users"],
    }),
})

export const getpageDetails = Object.fromEntries(
    Object.entries(PageAccess).map(([key, value]) => [value.name, value.allowedRoles])
);