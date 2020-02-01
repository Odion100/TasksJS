const abstractMethods = (obj, reserved_methods = [], useREST) => {
  const methods = [];
  const REST_methods = ["get", "put", "post", "delete"];
  const props = Object.getOwnPropertyNames(obj);

  props.forEach(name => {
    if (typeof obj[name] === "function" && reserved_methods.indexOf(name) === -1) {
      const method =
        useREST && REST_methods.indexOf(name.toLocaleLowerCase()) === -1
          ? "put"
          : name.toLocaleLowerCase();
      methods.push({ method, name });
    }
  });

  return methods;
};

module.exports = { abstractMethods };
