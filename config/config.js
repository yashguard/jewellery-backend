import Joi from "joi";
import dotenv from "dotenv";
import {serverEnums} from "./enum.js";

const developmentMode = serverEnums.DEVELOPMENT;
dotenv.config({path: developmentMode === serverEnums.PRODUCTION ? ".env" : ".env.dev"});

const envVarsSchema = Joi.object({
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().trim().description("Mongodb url"),
    CLIENT_URL: Joi.string().trim().description("Client url"),
    BASE_URL: Joi.string().trim().description("Base URL"),
    SERVER_URL: Joi.string().trim().description("Server url"),
    JWT_SECRET_KEY: Joi.string().description("Jwt secret key").default("JwtSecretKEyHere"),

    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description("the from field in the emails sent by the app"),

    GOOGLE_CLIENT_ID: Joi.string().description("google client id"),
    GOOGLE_CLIENT_SECRET: Joi.string().description("google client secret"),
    GOOGLE_REDIRECT_URL: Joi.string().description("google redirect url"),

    RAZORPAY_KEY_ID: Joi.string().description("razorpay key id"),
    RAZORPAY_KEY_SECRET: Joi.string().description("razorpay key secret"),

    DIGITAL_OCEAN_FOLDERNAME: Joi.string().description("digitalOcean folder name"),
    DIGITAL_OCEAN_SPACES_ACCESS_KEY: Joi.string().description("digital ocean spaces access key"),
    DIGITAL_OCEAN_SPACES_SECRET_KEY: Joi.string().description("digital ocean spaces secret key"),
    DIGITAL_OCEAN_SPACES_REGION: Joi.string().description("digital ocean spaces region"),
    DIGITAL_OCEAN_SPACES_BASE_URL: Joi.string().description("digital ocean spaces base url"),
    DIGITAL_OCEAN_BUCKET_NAME: Joi.string().description("digital ocean spaces bucket name"),
}).unknown();

const {value: envVars,error} = envVarsSchema
    .prefs({errors: {label: "key"}})
    .validate(process.env);

if (error) {console.log("Config Error: ",error);}

console.log({
    mode: developmentMode,
});

export const config = {
    port: envVars.PORT,
    mongodb: {
        url: envVars.MONGODB_URL,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    base_url: envVars.BASE_URL,
    server_url: envVars.SERVER_URL,
    client_url: envVars.CLIENT_URL,
    jwt: {
        secret_key: envVars.JWT_SECRET_KEY,
    },
    google: {
        client_id: envVars.GOOGLE_CLIENT_ID,
        client_secret: envVars.GOOGLE_CLIENT_SECRET,
        redirect_url: envVars.GOOGLE_REDIRECT_URL,
    },
    cloud: {
        digitalocean: {
            foldername: envVars.DIGITAL_OCEAN_FOLDERNAME,
            access_key: envVars.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
            secret_key: envVars.DIGITAL_OCEAN_SPACES_SECRET_KEY,
            region: envVars.DIGITAL_OCEAN_SPACES_REGION,
            base_url: envVars.DIGITAL_OCEAN_SPACES_BASE_URL,
            bucket_name: envVars.DIGITAL_OCEAN_BUCKET_NAME,
        },
    },
    email: {
        smtp: {
            host: envVars.SMTP_HOST,
            port: envVars.SMTP_PORT,
            auth: {
                user: envVars.SMTP_USERNAME,
                pass: envVars.SMTP_PASSWORD,
            },
        },
        from: envVars.EMAIL_FROM,
    },
    razorpay: {
        key_id: envVars.RAZORPAY_KEY_ID,
        key_secret: envVars.RAZORPAY_KEY_SECRET
    }
};
