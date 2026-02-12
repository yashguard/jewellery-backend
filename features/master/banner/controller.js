import {successResponse,errorResponse} from "../../../helper/apiResponse.js";
import {deleteFile} from "../../../helper/aws_s3.js";
import BannerModel from '../../master/banner/model.js';
import Services from "../banner/service.js";
import {updateMultipleFiles,uploadMultipleFiles} from '../../aws/controller.js';
const folderName = "banner";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {title,description} = req.body;
            const uploadedImages = await uploadMultipleFiles(req,folderName);

            const doc = {
                title,
                description,
                files: uploadedImages.map((image) => ({urls: image.url})),
            };

            const result = await Services.create(doc);

            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Banners is created successfully.",
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "banner.create",
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const result = await Services.get();
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Banner list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "banner.get"
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {title,description} = req.body;

            const find = await BannerModel.findById(id);
            if (!find) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Banner not found.")
                });
            }

            const findDoc = await BannerModel.findById(id);
            let files = await updateMultipleFiles(req,findDoc,folderName);

            const doc = {title,description,files: files};
            const result = await Services.update(id,doc);

            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Banner is updated.",
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "banner.update"
            });
        }
    };

    /**
     * delete
     */
    static deleteBanner = async (req,res) => {
        try {
            const {id} = req.params;

            const find = await BannerModel.findById(id);
            if (!find) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Banner not found.")
                });
            }

            for (const image of find.files) {
                await deleteFile({
                    filename: image.urls,
                });
            }

            await Services.deleteBanner(id);

            return successResponse({
                res,
                statusCode: 200,
                message: "Banner is deleted"
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "banner.delete"
            });
        }
    };

    /**
     * delete single file
     */
    static deleteSingleFile = async (req,res) => {
        try {
            const {id,fileId} = req.params;

            const banner = await BannerModel.findById(id);
            if (!banner) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Banner not found.")
                });
            }

            let fileDeleted = false;

            const deleteFromImages = (files) => {
                const index = files.findIndex(file => file._id.toString() === fileId);
                if (index !== -1) {
                    const filename = files[ index ].urls;
                    deleteFile({
                        filename: filename
                    });
                    files.splice(index,1);
                    fileDeleted = true;
                }
            };

            if (banner.files && banner.files.length > 0) {
                deleteFromImages(banner.files);
            }

            if (!fileDeleted && banner.urls && banner.urls.length > 0) {
                deleteFromImages(banner.urls);
            }

            if (!fileDeleted) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("File not found.")
                });
            }

            await banner.save();
            return successResponse({
                res,
                statusCode: 200,
                message: "File is deleted."
            });

        } catch (error) {
            return errorResponse({res,error});
        }
    };

}
export default controller;
