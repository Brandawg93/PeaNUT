import { createSwaggerSpec } from 'next-swagger-doc'

const options = {
  components: {
    securitySchemes: {
      BasicAuth: {
        type: 'http',
        scheme: 'basic',
      },
    },
  },
  security: [
    {
      BasicAuth: [],
    },
  ],
}

const useAuth = process.env.USERNAME && process.env.PASSWORD

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // define api folder under app folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PeaNUT API',
        version: '1.0',
      },
      ...(useAuth ? options : {}),
    },
  })
  return spec
}
