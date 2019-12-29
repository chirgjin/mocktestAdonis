module.exports = {
    PermissionDeniedException : use("App/Exceptions/PermissionDeniedException"),
    PermissionDenied : use("App/Exceptions/PermissionDeniedException"),

    NotFoundException : use("App/Exceptions/NotFoundException"),
    NotFound : use("App/Exceptions/NotFoundException"),

    IncorrectTypeException : use("App/Exceptions/IncorrectTypeException"),
    IncorrectType : use("App/Exceptions/IncorrectTypeException"),

    MissingValueException : use("App/Exceptions/MissingValueException"),
    MissingValue : use("App/Exceptions/MissingValueException"),

    BadRequest : use("App/Exceptions/BadRequestException"),
    BadRequestException : use("App/Exceptions/BadRequestException"),
    
    FieldException : use("App/Exceptions/FieldException"),

    WaitTimeException : use("App/Exceptions/WaitTimeException"),

    BadStateException : use("App/Exceptions/BadStateException"),
};