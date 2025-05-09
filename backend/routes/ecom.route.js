import express from "express";
import { validateRequest } from "../middlewares/apivalidation.middleware.js";
import { PageAccess } from "../routes/route.access.js";
import { EcomController } from "../controllers/ecom.controller.js";

const ecomController = new EcomController();
const Router =express.Router();

const applymiddlewares = ({ auth, schema, ispublic, pageName}) => {
    const middleware = [];
    if (!ispublic) middleware.push(auth,pageName?.pageName?.name);

    middleware.push((req,res,next) => {
        req.payload ={ ...req.body, ...req.params, ...req.query};
        next();
    });

    if (schema){
        middleware.push((req,res,next) => {
            validateRequest(schema, { body: req.payload })(req,res,next);
        });
    }
    return middleware;
};

const routes = [
    { path: "/register", method:"post", pageName: PageAccess.register, auth:false, ispublic:true,handler:ecomController.register},
    { path: "/login", method:"post", pageName: PageAccess.login, auth:false, ispublic:true,handler:ecomController.login},
    { path: "/verify-otp", method:"post", pageName: PageAccess.verifyOtp, auth:false, ispublic:true,handler:ecomController.verifyOtp},
    { path: "/forgot-password", method:"post", pageName: PageAccess.forgotPassword, auth:false, ispublic:true,handler:ecomController.forgotPassword},
];

routes.forEach(({ path, method, pageName, auth, schema,handler, ispublic}) => {
    Router[method](path, ...applymiddlewares({ auth, schema, ispublic, pageName }), handler);
});

export default Router;