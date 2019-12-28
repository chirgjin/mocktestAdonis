const { validate } = use("Validator");
const globalMessages = {
    required : "{{ field }} is required",
    string : "{{ field }} must be of type string",
    integer : "{{ field }} must be an integer",
    unique : "{{ field }} must be unique in {{ argument.0 }}",
    in(field, validation, args) {
        return `${field} must have one of the following values : ${args.join(",")}`;
    },
    array : "{{ field }} must be an array",
    range : "{{ field }} must be between {{ argument.0 }} and {{ argument.1 }}",
    alphaNumeric : "{{ field }} must be alphanumeric string",
};

module.exports = function (obj, rules, messages={}) {
    return validate(obj, rules, Object.assign({}, globalMessages, messages));
};