export abstract class HttpResponseMessage {
  static success<T>(message: string, data: T, statusCode = 200) {
    return { customResponse: true, statusCode, message, data };
  }

  static created<T>(entity: string, data: T) {
    return {
      customResponse: true,
      statusCode: 201,
      message: `${entity} created successfully`,
      data,
    };
  }

  static updated<T>(entity: string, data: T) {
    return {
      customResponse: true,
      statusCode: 200,
      message: `${entity} updated successfully`,
      data,
    };
  }

  static deleted<T>(entity: string, data: T) {
    return {
      customResponse: true,
      statusCode: 200,
      message: `${entity} deleted successfully`,
      data,
    };
  }

  static custom<T>(message: string, data: T, statusCode = 200) {
    return { customResponse: true, statusCode, message, data };
  }
}
