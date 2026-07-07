import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [
    process.env.NODE_ENV !== 'production' && basicSsl(),
  ].filter(Boolean),
}
