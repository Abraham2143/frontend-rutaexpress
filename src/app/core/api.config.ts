export const API_CONFIG = {

  /*
    false = consumir backend real
    true  = usar datos mock
  */
  useMocks: false,

  baseUrl:
    'https://x29deu7hn0.execute-api.us-east-1.amazonaws.com',

  endpoints: {

    catalog:
      '/api/catalog/services',

    shipments:
      '/api/shipments'

  }

};