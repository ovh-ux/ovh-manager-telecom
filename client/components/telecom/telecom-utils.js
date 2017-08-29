export default class TelecomUtils {
    static checkClassParameters (params, mandatoryParams, className) {
        if (!className) {
            throw new Error(`Please provide a class name when checking parameters`);
        }

        mandatoryParams.forEach(function (param) {
            if (!_.has(params, param)) {
                let errorMsg = `${param} option must be specified when creating a new ${className}`;
                throw new Error(errorMsg);
            }
        });

        return true;
    }
}
