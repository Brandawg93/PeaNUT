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

const useAuth = process.env.WEB_USERNAME && process.env.WEB_PASSWORD

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api/v1', // define api folder under app folder
    schemaFolders: ['src/app/api/v1'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PeaNUT API',
        version: '1.0',
        description: 'A Tiny Dashboard for Network UPS Tools',
      },
      ...(useAuth ? options : {}),
    },
  })
  return spec
}
