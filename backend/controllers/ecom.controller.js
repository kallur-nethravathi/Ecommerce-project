import { ResponseBuilder } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import RequestContext from "../utils/context.js";
import { EcomService } from "../services/ecom.service.js";

export class EcomController{
    constructor(){
        this.service = new EcomService();
        this.context = RequestContext
    }
    #handleResponse(serviceResponse, startTime) {

        // Ensure we have a valid service response
        if (!serviceResponse) {
          console.error("Service response is undefined or null");
          return ResponseBuilder.error(new Error("Service returned empty response"), {
            duration: new Date() - startTime
          });
        }
    
        // Check if serviceResponse is already a ResponseBuilder result
        if (serviceResponse.body && typeof serviceResponse.status === 'number') {
    
          return serviceResponse;  // Return the ResponseBuilder response as is
        }
    
        // For non-ResponseBuilder responses, handle as before...
        const { status = 200, message = "Success", data = null } = serviceResponse;
        let duration = new Date() - startTime;
    
        // Create appropriate response
        if (status >= 400) {
          return ResponseBuilder.fail(message, {
            status,
            code: 'BAD_REQUEST',
            duration
          });
        }
    
        // Create success response
        const response = ResponseBuilder.success(data, {
          message,
          status,
          duration
        });
        return response;
      }

      async handleRequest(req,res,operation){
        const requestId = this.context.get().requestId;
        const startTime = Date.now();

        try{
            const result = await operation();
            logger.info('Request ${requestId} completed in ${Date.now() - startTime}ms');
            const response = this.#handleResponse(result, startTime);
            return res.status(response.status).json(response.body);
        }catch(error){
            console.log("error",error)
            logger.error('Request ${requestId} failed:',{
                error,
                path:req.path,
                duration: Date.now() - startTime,
            });
            
            const errorResponse = ResponseBuilder.error(error,{
                requestId,
                duration: Date.now() - startTime,
            });
            return res.status(errorResponse.status).json(errorResponse.body);
        }
      }

      register = async (req, res) => {
        this.handleRequest(req,res,async () => {
            return await this.service.register(req.payload)
        })
      }

      login = async (req, res) => {
        this.handleRequest(req,res,async () => {
            return await this.service.login(req.payload)
        })
      }

      verifyOtp = async (req, res) => {
        this.handleRequest(req,res,async () => {
            return await this.service.verifyOtp(req.payload)
        })
      }

      forgotPassword = async (req, res) => {
        this.handleRequest(req,res,async () => {
            return await this.service.forgotPassword(req.payload)
        })
      }

}
